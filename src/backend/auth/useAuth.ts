import { useContext } from 'react'
import { AuthContext, type AuthContextValue } from './AuthProvider'

/** Access the auth context. Throws if used outside an AuthProvider. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
