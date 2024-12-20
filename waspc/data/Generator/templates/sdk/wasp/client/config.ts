{{={= =}=}}
import { stripTrailingSlash } from '../universal/url.js'

const apiUrl = stripTrailingSlash(import.meta.env.REACT_APP_API_URL) || '{= defaultServerUrl =}';

// PUBLIC API
export type ClientConfig = {
  apiUrl: string,
} 

// PUBLIC API
export const config: ClientConfig = {
  apiUrl,
}
