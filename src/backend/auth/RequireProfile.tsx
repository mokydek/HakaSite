import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../../ui'
import { useAuth } from './useAuth'

/**
 * Requires a complete profile, meaning a full name and a country. While auth
 * is resolving it shows a spinner. Incomplete users are sent to /onboarding.
 * Use inside ProtectedRoute so a session is already guaranteed.
 */
export function RequireProfile() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (!profile?.full_name || !profile.country) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
