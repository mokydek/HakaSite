import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../../ui'
import { useAuth } from './useAuth'

/**
 * Gates a group of routes behind an authenticated session. While the auth
 * state is still resolving it shows a spinner so a refresh does not redirect
 * before the session is known. With no session it redirects to /signin and
 * preserves the attempted location in router state.
 */
export function ProtectedRoute() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  return <Outlet />
}
