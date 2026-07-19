import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../../ui'
import type { ProfileRole } from '../types'
import { useAuth } from './useAuth'

export interface RequireRoleProps {
  role: ProfileRole
}

/**
 * Gates routes behind a profile role, for example organizer. While auth is
 * resolving it shows a spinner. If the role does not match it redirects to
 * /hackathon. Use inside ProtectedRoute so the session is already guaranteed.
 */
export function RequireRole({ role }: RequireRoleProps) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (profile?.role !== role) {
    return <Navigate to="/hackathon" replace />
  }

  return <Outlet />
}
