import { useState, type FormEvent } from 'react'
import { Button, Input, Select, Textarea } from '../../../ui'
import { FormError } from '../FormError'
import { SavedFlash } from './SavedFlash'
import { updateHackathon } from '../../../backend/queries/admin'
import type { Hackathon, HackathonStatus } from '../../../backend/types'
import { isoToLocalInput, localInputToIso, localTimezoneLabel } from '../../lib/datetime'

interface EventTabProps {
  hackathon: Hackathon
  onSaved: (hackathon: Hackathon) => void
}

interface EventForm {
  title: string
  slug: string
  description: string
  long_description: string
  prizes: string
  rules: string
  cover_url: string
  status: HackathonStatus
  registration_deadline: string
  start_at: string
  cases_reveal_at: string
  submission_deadline: string
  end_at: string
}

function toForm(hackathon: Hackathon): EventForm {
  return {
    title: hackathon.title,
    slug: hackathon.slug,
    description: hackathon.description ?? '',
    long_description: hackathon.long_description ?? '',
    prizes: hackathon.prizes ?? '',
    rules: hackathon.rules ?? '',
    cover_url: hackathon.cover_url ?? '',
    status: hackathon.status,
    registration_deadline: isoToLocalInput(hackathon.registration_deadline),
    start_at: isoToLocalInput(hackathon.start_at),
    cases_reveal_at: isoToLocalInput(hackathon.cases_reveal_at),
    submission_deadline: isoToLocalInput(hackathon.submission_deadline),
    end_at: isoToLocalInput(hackathon.end_at),
  }
}

export function EventTab({ hackathon, onSaved }: EventTabProps) {
  const [form, setForm] = useState<EventForm>(() => toForm(hackathon))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof EventForm>(field: K, value: EventForm[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (form.title.trim().length === 0) {
      setError('Enter a title')
      return
    }
    if (form.slug.trim().length === 0) {
      setError('Enter a slug')
      return
    }
    setSaving(true)
    try {
      const updated = await updateHackathon(hackathon.id, {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        long_description: form.long_description.trim() || null,
        prizes: form.prizes.trim() || null,
        rules: form.rules.trim() || null,
        cover_url: form.cover_url.trim() || null,
        status: form.status,
        registration_deadline: localInputToIso(form.registration_deadline),
        start_at: localInputToIso(form.start_at),
        cases_reveal_at: localInputToIso(form.cases_reveal_at),
        submission_deadline: localInputToIso(form.submission_deadline),
        end_at: localInputToIso(form.end_at),
      })
      onSaved(updated)
      setForm(toForm(updated))
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the hackathon')
    } finally {
      setSaving(false)
    }
  }

  const timezone = localTimezoneLabel()

  return (
    <form onSubmit={handleSave} className="flex max-w-3xl flex-col gap-6">
      {error ? <FormError message={error} /> : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <Input label="Title" value={form.title} onChange={(e) => set('title', e.target.value)} />
        <Input label="Slug" value={form.slug} onChange={(e) => set('slug', e.target.value)} />
      </div>

      <Select
        label="Status"
        value={form.status}
        onChange={(e) => set('status', e.target.value as HackathonStatus)}
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="live">Live</option>
        <option value="ended">Ended</option>
      </Select>

      <Input
        label="Short description"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
      />
      <Textarea
        label="Long description"
        value={form.long_description}
        onChange={(e) => set('long_description', e.target.value)}
        rows={4}
      />
      <Textarea
        label="Prizes"
        value={form.prizes}
        onChange={(e) => set('prizes', e.target.value)}
        rows={3}
      />
      <Textarea
        label="Rules"
        value={form.rules}
        onChange={(e) => set('rules', e.target.value)}
        rows={3}
      />
      <Input
        label="Cover url"
        type="url"
        value={form.cover_url}
        onChange={(e) => set('cover_url', e.target.value)}
      />

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-lg font-semibold text-foreground">Timing</h2>
          <p className="text-sm text-muted">
            Times are shown and edited in your local time, {timezone}, and stored in UTC.
          </p>
        </div>

        <div className="rounded border border-foreground bg-surface p-4">
          <Input
            label="Cases unlock time"
            type="datetime-local"
            value={form.cases_reveal_at}
            onChange={(e) => set('cases_reveal_at', e.target.value)}
          />
          <p className="mt-2 text-sm font-medium text-foreground">
            This drives the timed case reveal for every participant.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Input
            label="Registration deadline"
            type="datetime-local"
            value={form.registration_deadline}
            onChange={(e) => set('registration_deadline', e.target.value)}
          />
          <Input
            label="Kickoff start"
            type="datetime-local"
            value={form.start_at}
            onChange={(e) => set('start_at', e.target.value)}
          />
          <Input
            label="Submission deadline"
            type="datetime-local"
            value={form.submission_deadline}
            onChange={(e) => set('submission_deadline', e.target.value)}
          />
          <Input
            label="Event ends"
            type="datetime-local"
            value={form.end_at}
            onChange={(e) => set('end_at', e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
        <Button type="submit" loading={saving}>
          Save event
        </Button>
        <SavedFlash show={saved} />
      </div>
    </form>
  )
}
