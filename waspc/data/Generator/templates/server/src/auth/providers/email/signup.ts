import { Request, Response } from 'express';
import { EmailFromField } from "../../../email/core/types.js";
import {
    createUser,
    findAuthIdentity,
    deleteUserByAuthId,
    doFakeWork,
    deserializeAndSanitizeProviderData,
    sanitizeAndSerializeProviderData,
} from "../../utils.js";
import {
    createEmailVerificationLink,
    sendEmailVerificationEmail,
    isEmailResendAllowed,
} from "./utils.js";
import { ensureValidEmail, ensureValidPassword, ensurePasswordIsPresent } from "../../validation.js";
import { GetVerificationEmailContentFn } from './types.js';
import { validateAndGetAdditionalFields } from '../../utils.js'

export function getSignupRoute({
    fromField,
    clientRoute,
    getVerificationEmailContent,
}: {
    fromField: EmailFromField;
    clientRoute: string;
    getVerificationEmailContent: GetVerificationEmailContentFn;
}) {
    return async function signup(
        req: Request<{ email: string; password: string; }>,
        res: Response,
    ): Promise<Response<{ success: true } | { success: false; message: string }>> {
        const fields = req.body;
        ensureValidArgs(fields);
        
        const existingAuthIdentity = await findAuthIdentity("email", fields.email);
        if (existingAuthIdentity) {
            const providerData = deserializeAndSanitizeProviderData<'email'>(existingAuthIdentity.providerData);
            // User already exists and is verified - don't leak information
            if (providerData.isEmailVerified) {
                await doFakeWork();
                return res.json({ success: true });
            }

            if (!isEmailResendAllowed(providerData, 'emailVerificationSentAt')) {
                return res.status(400).json({ success: false, message: "Please wait a minute before trying again." });
            }

            // User exists but is not verified - delete the user and create a new one
            await deleteUserByAuthId(existingAuthIdentity.authId);
        }

        const userFields = await validateAndGetAdditionalFields(fields);

        const newUserProviderData = await sanitizeAndSerializeProviderData<'email'>({
            password: fields.password,
            isEmailVerified: false,
            emailVerificationSentAt: null,
            passwordResetSentAt: null,
        });

        const user = await createUser(
            'email',
            fields.email,
            newUserProviderData,
            userFields,
        );

        const verificationLink = await createEmailVerificationLink(fields.email, clientRoute);
        try {
            await sendEmailVerificationEmail(
                fields.email,
                {
                    from: fromField,
                    to: fields.email,
                    ...getVerificationEmailContent({ verificationLink }),
                }
            );
        } catch (e: any) {
            console.error("Failed to send email verification email:", e);
            return res.status(500).json({ success: false, message: "Failed to send email verification email." });
        } 
      
        return res.json({ success: true });
    };
}

function ensureValidArgs(args: unknown): void {
    ensureValidEmail(args);
    ensurePasswordIsPresent(args);
    ensureValidPassword(args);
}
  
