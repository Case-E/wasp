{{={= =}=}}
import { deserialize as superjsonDeserialize } from 'superjson'
import { useQuery } from '../client/operations'
import { addMetadataToQuery } from '../client/operations/queries/core'
import { api, handleApiError } from 'wasp/client/api'
import { HttpMethod } from 'wasp/client'
import type { AuthUser } from './types'

// PUBLIC API
export const getMe = createUserGetter()

// PUBLIC API
export default function useAuth(queryFnArgs?: unknown, config?: any) {
  return useQuery(getMe, queryFnArgs, config)
}  

function createUserGetter() {
  const getMeRelativePath = 'auth/me'
  const getMeRoute = { method: HttpMethod.Get, path: `/${getMeRelativePath}` }
  async function getMe(): Promise<AuthUser | null> {
    try {
      const response = await api.get(getMeRoute.path)
  
      return superjsonDeserialize(response.data)
    } catch (error) {
      if (error.response?.status === 401) {
        return null
      } else {
        handleApiError(error)
      }
    }
  }
  
  addMetadataToQuery(getMe, {
    relativeQueryPath: getMeRelativePath,
    queryRoute: getMeRoute,
    entitiesUsed: {=& entitiesGetMeDependsOn =},
  })

  return getMe
}