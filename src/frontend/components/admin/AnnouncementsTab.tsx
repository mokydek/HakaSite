import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, ToggleLeft, ToggleRight } from 'lucide-react'
import { Badge, Button, Card, Input, Spinner, Textarea } from '../../../ui'
import { FormError } from '../FormError'
import { ConfirmAction } from '../ConfirmAction'
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
} from '../../../backend/queries/admin'
import type { Announcement } from '../../../backend/types'
import { formatDateTime } from '../../lib/format'

interface EditorProps {
  hackathonId: string
  initial: Announcement | null
  onSaved: () => void
  onCancel: () => void
}

function AnnouncementEditor({ hackathonId, initial, onSaved, onCancel }: EditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [isPublished, setIsPublished] = useState(initial?.is_published ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (title.trim().length === 0) {
      setError('Enter a title')
      return
    }
    setSaving(true)
    try {
      const fields = { title: title.trim(), body: body.trim() || null, is_published: isPublished }
      if (initial) {
        await updateAnnouncement(initial.id, fields)
      } else {
        await createAnnouncement({ hackathon_id: hackathonId, ...fields })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the announcement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {error ? <FormError message={error} /> : null}
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
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
            {initial ? 'Save announcement' : 'Post announcement'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function AnnouncementsTab({ hackathonId }: { hackathonId: string }) {
  const [items, setItems] = useState<Announcement[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setItems(await getAllAnnouncements(hackathonId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load announcements')
    }
  }, [hackathonId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteAnnouncement(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the announcement')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Announcements</h2>
        {!creating ? (
          <Button size="sm" icon={Plus} onClick={() => setCreating(true)}>
            New announcement
          </Button>
        ) : null}
      </div>

      {error ? <FormError message={error} /> : null}

      {creating ? (
        <AnnouncementEditor
          hackathonId={hackathonId}
          initial={null}
          onSaved={() => {
            setCreating(false)
            void load()
          }}
          onCancel={() => setCreating(false)}
        />
      ) : null}

      {items === null ? (
        <div className="flex justify-center py-8">
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No announcements yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) =>
            editing === item.id ? (
              <AnnouncementEditor
                key={item.id}
                hackathonId={hackathonId}
                initial={item}
                onSaved={() => {
                  setEditing(null)
                  void load()
                }}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <Card key={item.id} className="flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <Badge variant={item.is_published ? 'surface' : 'outline'}>
                    {item.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                {item.body ? (
                  <p className="whitespace-pre-line text-sm text-muted">{item.body}</p>
                ) : null}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="font-mono text-xs text-muted">
                    {formatDateTime(item.created_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(item.id)}>
                      Edit
                    </Button>
                    <ConfirmAction
                      label="Delete"
                      confirmLabel="Delete"
                      message="Delete this announcement?"
                      triggerVariant="ghost"
                      onConfirm={() => handleDelete(item.id)}
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
