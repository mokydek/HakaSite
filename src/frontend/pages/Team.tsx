import { useCallback, useEffect, useState } from 'react'
import { Button, Spinner } from '../../ui'
import { FormError } from '../components/FormError'
import { useAuth } from '../../backend/auth/useAuth'
import { getPublishedHackathon } from '../../backend/queries/hackathon'
import { getMyTeam, type TeamWithMembers } from '../../backend/queries/teams'
import type { Hackathon } from '../../backend/types'
import { CreateJoinTeam } from '../components/CreateJoinTeam'
import { TeamPanel } from '../components/TeamPanel'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Team() {
  usePageTitle('Team')
  const { user } = useAuth()

  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [team, setTeam] = useState<TeamWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const current = await getPublishedHackathon()
      setHackathon(current)
      setTeam(current ? await getMyTeam(current.id) : null)
    } catch {
      setError('Could not load your team')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const refetchTeam = useCallback(async () => {
    if (!hackathon) return
    try {
      setTeam(await getMyTeam(hackathon.id))
    } catch {
      setError('Could not refresh your team')
    }
  }, [hackathon])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <FormError message={error} />
        <Button variant="secondary" onClick={() => void load()}>
          Try again
        </Button>
      </div>
    )
  }

  if (!hackathon) {
    return <p className="text-sm text-muted">There is no active hackathon right now.</p>
  }

  if (team) {
    return (
      <TeamPanel
        team={team}
        currentUserId={user?.id ?? ''}
        onChanged={() => void refetchTeam()}
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Team</h1>
        <p className="text-sm text-muted">Create or join a team for {hackathon.title}.</p>
      </div>
      <CreateJoinTeam hackathonId={hackathon.id} onChanged={() => void refetchTeam()} />
    </div>
  )
}
