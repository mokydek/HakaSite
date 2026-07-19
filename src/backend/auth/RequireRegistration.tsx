import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../../ui'
import { getPublishedHackathon } from '../queries/hackathon'
import { getMyRegistration } from '../queries/registrations'
import { useAuth } from './useAuth'

type Status = 'checking' | 'registered' | 'unregistered'

/**
 * Requires the current user to be registered for the published hackathon.
 * While it checks it shows a spinner, otherwise it sends unregistered users to
 * /hackathon where they can register. Use inside RequireProfile.
 */
export function RequireRegistration() {
  const { loading: authLoading, user } = useAuth()
  const userId = user?.id ?? null
  const [status, setStatus] = useState<Status>('checking')

  useEffect(() => {
    if (authLoading || !userId) return
    let active = true
    setStatus('checking')
    void (async () => {
      try {
        const hackathon = await getPublishedHackathon()
        if (!hackathon) {
          if (active) setStatus('unregistered')
          return
        }
        const registration = await getMyRegistration(hackathon.id)
        if (active) setStatus(registration ? 'registered' : 'unregistered')
      } catch {
        if (active) setStatus('unregistered')
      }
    })()
    return () => {
      active = false
    }
  }, [authLoading, userId])

  if (authLoading || status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (status === 'unregistered') {
    return <Navigate to="/hackathon" replace />
  }

  return <Outlet />
}
