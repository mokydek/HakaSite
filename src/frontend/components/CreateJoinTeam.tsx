import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { Button, Card, Input, Spinner } from '../../ui'
import { FormError } from './FormError'
import {
  createTeam,
  getOpenTeams,
  joinTeamByCode,
  joinTeamById,
  type OpenTeam,
} from '../../backend/queries/teams'

interface CreateJoinTeamProps {
  hackathonId: string
  onChanged: () => void
}

export function CreateJoinTeam({ hackathonId, onChanged }: CreateJoinTeamProps) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)

  const [openTeams, setOpenTeams] = useState<OpenTeam[] | null>(null)
  const [openError, setOpenError] = useState<string | null>(null)
  const [joiningId, setJoiningId] = useState<string | null>(null)

  const loadOpen = useCallback(async () => {
    setOpenError(null)
    try {
      setOpenTeams(await getOpenTeams(hackathonId))
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : 'Could not load open teams')
    }
  }, [hackathonId])

  useEffect(() => {
    void loadOpen()
  }, [loadOpen])

  async function handleCreate(event: FormEvent) {
    event.preventDefault()
    setCreateError(null)
    if (name.trim().length === 0) {
      setCreateError('Enter a team name')
      return
    }
    setCreating(true)
    try {
      await createTeam(hackathonId, name.trim())
      onChanged()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create the team')
      setCreating(false)
    }
  }

  async function handleJoinByCode(event: FormEvent) {
    event.preventDefault()
    setJoinError(null)
    if (code.trim().length === 0) {
      setJoinError('Enter an invite code')
      return
    }
    setJoining(true)
    try {
      await joinTeamByCode(code.trim())
      onChanged()
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Could not join the team')
      setJoining(false)
    }
  }

  async function handleJoinById(teamId: string) {
    setOpenError(null)
    setJoiningId(teamId)
    try {
      await joinTeamById(teamId)
      onChanged()
    } catch (err) {
      setOpenError(err instanceof Error ? err.message : 'Could not join the team')
      setJoiningId(null)
      void loadOpen()
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users size={20} strokeWidth={2} aria-hidden="true" className="text-foreground" />
            <h2 className="font-display text-lg font-semibold text-foreground">Create a team</h2>
          </div>
          <p className="text-sm text-muted">Start a team and invite others with a code.</p>
          <form onSubmit={handleCreate} className="flex flex-col gap-3" noValidate>
            <Input
              label="Team name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Night Owls"
            />
            {createError ? <FormError message={createError} /> : null}
            <div>
              <Button type="submit" loading={creating}>
                Create team
              </Button>
            </div>
          </form>
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <UserPlus size={20} strokeWidth={2} aria-hidden="true" className="text-foreground" />
            <h2 className="font-display text-lg font-semibold text-foreground">Join a team</h2>
          </div>
          <p className="text-sm text-muted">Have an invite code from a teammate? Enter it here.</p>
          <form onSubmit={handleJoinByCode} className="flex flex-col gap-3" noValidate>
            <Input
              label="Invite code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="ABCD2345"
              className="font-mono uppercase tracking-widest"
            />
            {joinError ? <FormError message={joinError} /> : null}
            <div>
              <Button type="submit" variant="secondary" loading={joining}>
                Join team
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Open teams</h2>
        {openError ? <FormError message={openError} /> : null}
        {openTeams === null ? (
          <div className="flex justify-center py-8">
            <Spinner size={20} />
          </div>
        ) : openTeams.length === 0 ? (
          <p className="text-sm text-muted">No open teams right now. Create one to get started.</p>
        ) : (
          <div className="border-t border-border">
            {openTeams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between gap-4 border-b border-border py-4"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{team.name}</span>
                  <span className="text-sm text-muted">
                    {team.member_count} {team.member_count === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  loading={joiningId === team.id}
                  onClick={() => void handleJoinById(team.id)}
                >
                  Join
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
