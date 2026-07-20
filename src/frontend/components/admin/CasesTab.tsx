import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, ToggleLeft, ToggleRight, X } from 'lucide-react'
import { Badge, Button, Card, Input, Spinner, Textarea } from '../../../ui'
import { FormError } from '../FormError'
import { ConfirmAction } from '../ConfirmAction'
import { createCase, deleteCase, getAllCases, updateCase } from '../../../backend/queries/admin'
import type { Case, Json } from '../../../backend/types'
import { formatDateTime } from '../../lib/format'
import { isoToLocalInput, localInputToIso } from '../../lib/datetime'

interface LinkItem {
  id: string
  label: string
  url: string
}

function parseAttachments(value: Json): LinkItem[] {
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

interface CaseEditorProps {
  hackathonId: string
  initial: Case | null
  onSaved: () => void
  onCancel: () => void
}

function CaseEditor({ hackathonId, initial, onSaved, onCancel }: CaseEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [fullDescription, setFullDescription] = useState(initial?.full_description ?? '')
  const [orderIndex, setOrderIndex] = useState(String(initial?.order_index ?? 0))
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? false)
  const [revealAt, setRevealAt] = useState(isoToLocalInput(initial?.reveal_at))
  const [attachments, setAttachments] = useState<LinkItem[]>(parseAttachments(initial?.attachments ?? []))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (title.trim().length === 0) {
      setError('Enter a case title')
      return
    }
    setSaving(true)
    try {
      const files: Json = attachments
        .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
        .filter((link) => link.label.length > 0 || link.url.length > 0)
      const fields = {
        title: title.trim(),
        summary: summary.trim() || null,
        full_description: fullDescription.trim() || null,
        order_index: Number.parseInt(orderIndex, 10) || 0,
        is_published: isPublished,
        reveal_at: localInputToIso(revealAt),
        attachments: files,
      }
      if (initial) {
        await updateCase(initial.id, fields)
      } else {
        await createCase({ hackathon_id: hackathonId, ...fields })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the case')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {error ? <FormError message={error} /> : null}
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
        <div className="flex flex-col gap-1.5">
          <Textarea
            label="Full description"
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            rows={6}
            className="font-mono"
          />
          <p className="text-sm text-muted">Written as markdown. Participants see it rendered.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Order index"
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(e.target.value)}
          />
          <Input
            label="Reveal time"
            type="datetime-local"
            value={revealAt}
            onChange={(e) => setRevealAt(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Attachments</span>
          {attachments.map((link) => (
            <div key={link.id} className="flex flex-col gap-2 sm:flex-row sm:items-start">
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(e) =>
                  setAttachments((prev) =>
                    prev.map((l) => (l.id === link.id ? { ...l, label: e.target.value } : l)),
                  )
                }
                className="sm:flex-1"
              />
              <Input
                placeholder="https://example.com"
                value={link.url}
                onChange={(e) =>
                  setAttachments((prev) =>
                    prev.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)),
                  )
                }
                className="sm:flex-1"
              />
              <button
                type="button"
                aria-label="Remove attachment"
                onClick={() => setAttachments((prev) => prev.filter((l) => l.id !== link.id))}
                className="inline-flex h-10 w-10 items-center justify-center rounded text-muted transition-colors hover:text-foreground"
              >
                <X size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          ))}
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon={Plus}
              onClick={() =>
                setAttachments((prev) => [...prev, { id: crypto.randomUUID(), label: '', url: '' }])
              }
            >
              Add attachment
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-foreground">Visibility</span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublished}
            onClick={() => setIsPublished((prev) => !prev)}
            className="inline-flex w-fit items-center gap-2 text-sm text-foreground transition-colors hover:text-muted"
          >
            {isPublished ? (
              <ToggleRight size={20} strokeWidth={2} aria-hidden="true" />
            ) : (
              <ToggleLeft size={20} strokeWidth={2} aria-hidden="true" />
            )}
            <span>{isPublished ? 'Published' : 'Draft'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button type="submit" loading={saving}>
            {initial ? 'Save case' : 'Create case'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function CasesTab({ hackathonId }: { hackathonId: string }) {
  const [cases, setCases] = useState<Case[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setCases(await getAllCases(hackathonId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the cases')
    }
  }, [hackathonId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteCase(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the case')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Cases</h2>
        {!creating ? (
          <Button size="sm" icon={Plus} onClick={() => setCreating(true)}>
            New case
          </Button>
        ) : null}
      </div>

      {error ? <FormError message={error} /> : null}

      {creating ? (
        <CaseEditor
          hackathonId={hackathonId}
          initial={null}
          onSaved={() => {
            setCreating(false)
            void load()
          }}
          onCancel={() => setCreating(false)}
        />
      ) : null}

      {cases === null ? (
        <div className="flex justify-center py-8">
          <Spinner size={20} />
        </div>
      ) : cases.length === 0 ? (
        <p className="text-sm text-muted">No cases yet. Create the first one.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {cases.map((caseItem) =>
            editing === caseItem.id ? (
              <CaseEditor
                key={caseItem.id}
                hackathonId={hackathonId}
                initial={caseItem}
                onSaved={() => {
                  setEditing(null)
                  void load()
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <Card key={caseItem.id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted">
                        {String(caseItem.order_index).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {caseItem.title}
                      </h3>
                    </div>
                    {caseItem.summary ? (
                      <p className="text-sm text-muted">{caseItem.summary}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={caseItem.is_published ? 'surface' : 'outline'}>
                      {caseItem.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="font-mono text-xs text-muted">
                    Reveals {formatDateTime(caseItem.reveal_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(caseItem.id)}>
                      Edit
                    </Button>
                    <ConfirmAction
                      label="Delete"
                      confirmLabel="Delete"
                      message="Delete this case?"
                      triggerVariant="ghost"
                      onConfirm={() => handleDelete(caseItem.id)}
                    />
                  </div>
                </div>
              </Card>
            ),
          )}
        </div>
      )}
    </div>
  )
}
