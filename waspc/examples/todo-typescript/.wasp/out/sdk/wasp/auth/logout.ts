import { removeLocalUserData } from 'wasp/api'
import { invalidateAndRemoveQueries } from 'wasp/operations/resources'

export default async function logout(): Promise<void> {
  removeLocalUserData()
  // TODO(filip): We are currently invalidating and removing  all the queries, but
  // we should remove only the non-public, user-dependent ones.
  await invalidateAndRemoveQueries()
}
