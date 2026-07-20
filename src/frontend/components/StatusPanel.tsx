import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge, Card, Spinner } from '../../ui'
import { getMyTeam, type TeamWithMembers } from '../../backend/queries/teams'

export function StatusPanel({ hackathonId }: { hackathonId: string }) {
  const [team, setTeam] = useState<TeamWithMembers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getMyTeam(hackathonId)
      .then((row) => {
        if (active) setTeam(row)
      })
      .catch(() => {
        if (active) setError('Could not load your team')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [hackathonId])

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-base font-semibold text-foreground">Your status</h2>
        <div>
          <Badge>Registered</Badge>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <span className="text-sm font-medium text-foreground">Team</span>
        {error ? (
          <span className="text-sm font-semibold text-foreground">{error}</span>
        ) : loading ? (
          <Spinner size={16} />
        ) : team ? (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">{team.name}</span>
            <span className="text-sm text-muted">
              {team.members.length} {team.members.length === 1 ? 'member' : 'members'}
            </span>
            <Link
              to="/team"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent"
            >
              Manage team
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">You have no team yet.</span>
            <Link
              to="/team"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent"
            >
              Create or join a team
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <span className="text-sm font-medium text-foreground">Submission</span>
        <Link
          to="/submit"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent"
        >
          Open submission
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </Link>
      </div>
    </Card>
  )
}
