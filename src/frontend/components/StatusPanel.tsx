import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge, Card, Spinner } from '../../ui'
import { getMyTeam, type TeamWithMembers } from '../../backend/queries/teams'
import { getMyTeamSubmission } from '../../backend/queries/submissions'

export function StatusPanel({ hackathonId }: { hackathonId: string }) {
  const [team, setTeam] = useState<TeamWithMembers | null>(null)
  const [hasSubmission, setHasSubmission] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setHasSubmission(false)
    void (async () => {
      try {
        const row = await getMyTeam(hackathonId)
        if (!active) return
        setTeam(row)
        if (row) {
          const submission = await getMyTeamSubmission(hackathonId, row.id).catch(() => null)
          if (active) setHasSubmission(submission !== null)
        }
      } catch {
        if (active) setError('Could not load your team')
      } finally {
        if (active) setLoading(false)
      }
    })()
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
        {loading ? (
          <Spinner size={16} />
        ) : !team ? (
          <span className="text-sm text-muted">Join a team to submit.</span>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted">
              {hasSubmission ? 'Submitted' : 'Not submitted yet'}
            </span>
            <Link
              to="/submit"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent"
            >
              {hasSubmission ? 'Edit submission' : 'Start submission'}
              <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </Card>
  )
}
