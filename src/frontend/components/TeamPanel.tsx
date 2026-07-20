import { useState, type FormEvent } from 'react'
import { Check, Copy, LogOut, SquarePen, ToggleLeft, ToggleRight, Trash2, UserMinus } from 'lucide-react'
import { Badge, Button, Card, Input } from '../../ui'
import { FormError } from './FormError'
import { ConfirmAction } from './ConfirmAction'
import {
  deleteTeam,
  leaveTeam,
  removeMember,
  updateTeam,
  type TeamWithMembers,
} from '../../backend/queries/teams'

interface TeamPanelProps {
  team: TeamWithMembers
  currentUserId: string
  onChanged: () => void
}

export function TeamPanel({ team, currentUserId, onChanged }: TeamPanelProps) {
  const isOwner = team.owner_id === currentUserId
  const [error, setError] = useState<string | null>(null)

  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(team.name)
  const [savingName, setSavingName] = useState(false)

  const [copied, setCopied] = useState(false)
  const [togglingOpen, setTogglingOpen] = useState(false)

  async function handleSaveName(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const trimmed = nameDraft.trim()
    if (trimmed.length === 0) {
      setError('Enter a team name')
      return
    }
    setSavingName(true)
    try {
      await updateTeam(team.id, { name: trimmed })
      setEditingName(false)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename the team')
    } finally {
      setSavingName(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(team.invite_code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy the invite code')
    }
  }

  async function handleToggleOpen() {
    setError(null)
    setTogglingOpen(true)
    try {
      await updateTeam(team.id, { looking_for_members: !team.looking_for_members })
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the team')
    } finally {
      setTogglingOpen(false)
    }
  }

  async function handleRemove(profileId: string) {
    setError(null)
    try {
      await removeMember(team.id, profileId)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the member')
    }
  }

  async function handleLeave() {
    setError(null)
    try {
      await leaveTeam(team.id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not leave the team')
    }
  }

  async function handleDelete() {
    setError(null)
    try {
      await deleteTeam(team.id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the team')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {error ? <FormError message={error} /> : null}

      {editingName ? (
        <form onSubmit={handleSaveName} className="flex flex-wrap items-center gap-2">
          <Input
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" size="sm" loading={savingName}>
            Save
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingName(false)
              setNameDraft(team.name)
            }}
          >
            Cancel
          </Button>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {team.name}
          </h1>
          {isOwner ? (
            <button
              type="button"
              onClick={() => {
                setNameDraft(team.name)
                setEditingName(true)
              }}
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
            >
              <SquarePen size={16} strokeWidth={2} aria-hidden="true" />
              Edit
            </button>
          ) : null}
        </div>
      )}

      <Card className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Invite code</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded border border-border bg-surface px-3 py-2 font-mono text-lg tracking-widest text-foreground">
              {team.invite_code}
            </span>
            <Button
              size="sm"
              variant="secondary"
              icon={copied ? Check : Copy}
              onClick={() => void handleCopy()}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <p className="text-sm text-muted">Share this code so others can join your team.</p>
        </div>

        {isOwner ? (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <span className="text-sm font-medium text-foreground">Visibility</span>
            <button
              type="button"
              role="switch"
              aria-checked={team.looking_for_members}
              onClick={() => void handleToggleOpen()}
              disabled={togglingOpen}
              className="inline-flex w-fit items-center gap-2 text-sm text-foreground transition-colors hover:text-muted disabled:opacity-50"
            >
              {team.looking_for_members ? (
                <ToggleRight size={20} strokeWidth={2} aria-hidden="true" />
              ) : (
                <ToggleLeft size={20} strokeWidth={2} aria-hidden="true" />
              )}
              <span>
                {team.looking_for_members ? 'Open to new members' : 'Closed to new members'}
              </span>
            </button>
          </div>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="font-display text-base font-semibold text-foreground">
          Members ({team.members.length})
        </h2>
        <div className="border-t border-border">
          {team.members.map((member) => {
            const isYou = member.profile_id === currentUserId
            return (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {member.profile?.full_name ?? 'Unnamed participant'}
                    {isYou ? ' (you)' : ''}
                  </span>
                  {member.profile?.country ? (
                    <span className="text-sm text-muted">{member.profile.country}</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.role === 'owner' ? 'surface' : 'outline'}>
                    {member.role}
                  </Badge>
                  {isOwner && member.role !== 'owner' ? (
                    <ConfirmAction
                      label="Remove"
                      confirmLabel="Remove"
                      message="Remove from team?"
                      icon={UserMinus}
                      triggerVariant="ghost"
                      onConfirm={() => handleRemove(member.profile_id)}
                    />
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        {isOwner ? (
          <>
            <h2 className="font-display text-base font-semibold text-foreground">Delete team</h2>
            <p className="text-sm text-muted">
              Deleting removes the team for everyone. This cannot be undone.
            </p>
            <div>
              <ConfirmAction
                label="Delete team"
                confirmLabel="Delete permanently"
                message="Delete this team?"
                icon={Trash2}
                onConfirm={handleDelete}
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-base font-semibold text-foreground">Leave team</h2>
            <p className="text-sm text-muted">You can join another team after leaving.</p>
            <div>
              <ConfirmAction
                label="Leave team"
                confirmLabel="Leave"
                message="Leave this team?"
                icon={LogOut}
                onConfirm={handleLeave}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
