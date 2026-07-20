import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Check, Lock, Plus, Users, X } from 'lucide-react'
import { Button, Countdown, Input, Select, Spinner, Textarea } from '../../ui'
import { FormError } from '../components/FormError'
import { formatDateTime } from '../lib/format'
import { getCases } from '../../backend/queries/cases'
import { getPublishedHackathon } from '../../backend/queries/hackathon'
import { getMyTeam, type TeamWithMembers } from '../../backend/queries/teams'
import { getMyTeamSubmission, upsertSubmission } from '../../backend/queries/submissions'
import type { Case, Hackathon, Json, Submission } from '../../backend/types'

interface LinkItem {
  id: string
  label: string
  url: string
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function parseLinks(value: Json): LinkItem[] {
  if (!Array.isArray(value)) return []
  const result: LinkItem[] = []
  for (const item of value) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const label = typeof item.label === 'string' ? item.label : ''
      const url = typeof item.url === 'string' ? item.url : ''
      if (label || url) result.push({ id: crypto.randomUUID(), label, url })
    }
  }
  return result
}

export default function Submit() {
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [team, setTeam] = useState<TeamWithMembers | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [caseId, setCaseId] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [description, setDescription] = useState('')
  const [links, setLinks] = useState<LinkItem[]>([])
  const [fieldErrors, setFieldErrors] = useState<{ repoUrl?: string; demoUrl?: string }>({})

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)
  const [countdownDone, setCountdownDone] = useState(false)

  const passedCaseId =
    searchParams.get('case') ?? (location.state as { caseId?: string } | null)?.caseId ?? null

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const currentHackathon = await getPublishedHackathon()
      setHackathon(currentHackathon)
      if (!currentHackathon) {
        setTeam(null)
        return
      }
      const currentTeam = await getMyTeam(currentHackathon.id)
      setTeam(currentTeam)
      if (currentTeam) {
        const [currentSubmission, revealedCases] = await Promise.all([
          getMyTeamSubmission(currentHackathon.id, currentTeam.id),
          getCases(currentHackathon.id),
        ])
        setSubmission(currentSubmission)
        setCases(revealedCases)
        setCaseId(passedCaseId ?? currentSubmission?.case_id ?? '')
        setRepoUrl(currentSubmission?.repo_url ?? '')
        setDemoUrl(currentSubmission?.demo_url ?? '')
        setDescription(currentSubmission?.description ?? '')
        setLinks(parseLinks(currentSubmission?.files ?? []))
        setSavedAt(currentSubmission?.updated_at ?? null)
      }
    } catch {
      setLoadError('Could not load your submission')
    } finally {
      setLoading(false)
    }
  }, [passedCaseId])

  useEffect(() => {
    void load()
  }, [load])

  const deadline = hackathon?.submission_deadline ?? null
  const closed = (deadline ? new Date(deadline).getTime() <= Date.now() : false) || countdownDone

  function addLink() {
    setLinks((prev) => [...prev, { id: crypto.randomUUID(), label: '', url: '' }])
  }
  function updateLink(id: string, field: 'label' | 'url', value: string) {
    setLinks((prev) => prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)))
  }
  function removeLink(id: string) {
    setLinks((prev) => prev.filter((link) => link.id !== id))
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setSaveError(null)
    const errors: { repoUrl?: string; demoUrl?: string } = {}
    if (!isValidUrl(repoUrl.trim())) errors.repoUrl = 'Enter a valid repository url'
    if (demoUrl.trim() && !isValidUrl(demoUrl.trim())) errors.demoUrl = 'Enter a valid demo url'
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return
    if (!hackathon || !team) return

    setSaving(true)
    try {
      const files: Json = links
        .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
        .filter((link) => link.label.length > 0 || link.url.length > 0)
      const saved = await upsertSubmission({
        hackathon_id: hackathon.id,
        team_id: team.id,
        case_id: caseId || null,
        repo_url: repoUrl.trim(),
        demo_url: demoUrl.trim() || null,
        description: description.trim() || null,
        files,
      })
      setSubmission(saved)
      setSavedAt(saved.updated_at)
      setJustSaved(true)
      window.setTimeout(() => setJustSaved(false), 2500)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save the submission')
      if (deadline && new Date(deadline).getTime() <= Date.now()) setCountdownDone(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-4">
        <FormError message={loadError} />
        <Button variant="secondary" onClick={() => void load()}>
          Try again
        </Button>
      </div>
    )
  }

  if (!hackathon) {
    return <p className="text-sm text-muted">There is no active hackathon right now.</p>
  }

  if (!team) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <Users size={20} strokeWidth={2} aria-hidden="true" className="text-muted" />
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          A team is required to submit
        </h1>
        <p className="text-sm text-muted">
          Submissions belong to a team. Create or join a team, or compete on your own as a team of
          one.
        </p>
        <Link to="/team" className="text-sm font-medium text-accent">
          Go to teams
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Submission
        </h1>
        <p className="text-sm text-muted">
          One submission per team for {hackathon.title}. Any member can edit it until the deadline.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 rounded border border-border bg-surface px-6 py-8 text-center">
        {!deadline ? (
          <p className="text-sm text-muted">No submission deadline set.</p>
        ) : closed ? (
          <>
            <Lock size={20} strokeWidth={2} aria-hidden="true" className="text-muted" />
            <p className="font-display text-lg font-semibold text-foreground">
              Submissions are closed
            </p>
            <p className="text-sm text-muted">The deadline has passed. Your submission is now read only.</p>
          </>
        ) : (
          <>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              Time left to submit
            </p>
            <Countdown target={deadline} onComplete={() => setCountdownDone(true)} />
          </>
        )}
      </div>

      {saveError ? <FormError message={saveError} /> : null}

      <form onSubmit={handleSave} className="flex flex-col gap-6" noValidate>
        <Select
          label="Challenge"
          value={caseId}
          onChange={(event) => setCaseId(event.target.value)}
          disabled={closed}
        >
          <option value="">General submission</option>
          {cases.map((challenge) => (
            <option key={challenge.id} value={challenge.id}>
              {challenge.title}
            </option>
          ))}
        </Select>

        <Input
          label="Repository url"
          type="url"
          placeholder="https://github.com/team/project"
          value={repoUrl}
          onChange={(event) => setRepoUrl(event.target.value)}
          error={fieldErrors.repoUrl}
          disabled={closed}
        />

        <Input
          label="Demo url"
          type="url"
          placeholder="https://demo.example.com"
          value={demoUrl}
          onChange={(event) => setDemoUrl(event.target.value)}
          error={fieldErrors.demoUrl}
          disabled={closed}
        />

        <Textarea
          label="Description"
          placeholder="Describe what you built and how it works."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          disabled={closed}
        />

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Additional links</span>
          {links.length === 0 ? (
            <p className="text-sm text-muted">No additional links yet.</p>
          ) : null}
          {links.map((link) => (
            <div key={link.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(event) => updateLink(link.id, 'label', event.target.value)}
                disabled={closed}
                className="sm:flex-1"
              />
              <Input
                placeholder="https://example.com"
                value={link.url}
                onChange={(event) => updateLink(link.id, 'url', event.target.value)}
                disabled={closed}
                className="sm:flex-1"
              />
              {!closed ? (
                <button
                  type="button"
                  onClick={() => removeLink(link.id)}
                  aria-label="Remove link"
                  className="inline-flex h-10 w-10 items-center justify-center rounded text-muted transition-colors hover:text-foreground"
                >
                  <X size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))}
          {!closed ? (
            <div>
              <Button type="button" variant="ghost" size="sm" icon={Plus} onClick={addLink}>
                Add link
              </Button>
            </div>
          ) : null}
        </div>

        {!closed ? (
          <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
            <Button type="submit" loading={saving}>
              {submission ? 'Save changes' : 'Save submission'}
            </Button>
            {justSaved ? (
              <span className="inline-flex items-center gap-1 text-sm text-foreground">
                <Check size={16} strokeWidth={2} aria-hidden="true" />
                Saved
              </span>
            ) : savedAt ? (
              <span className="text-sm text-muted">Last updated {formatDateTime(savedAt)}</span>
            ) : null}
          </div>
        ) : (
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted">
              This submission is closed for editing.
              {savedAt ? ` Last updated ${formatDateTime(savedAt)}.` : ''}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}
