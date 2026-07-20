import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button, Card, Input, Spinner, Textarea } from '../../../ui'
import { FormError } from '../FormError'
import { ConfirmAction } from '../ConfirmAction'
import {
  createScheduleItem,
  deleteScheduleItem,
  getAllScheduleItems,
  updateScheduleItem,
} from '../../../backend/queries/admin'
import type { ScheduleItem } from '../../../backend/types'
import { formatDateTime } from '../../lib/format'
import { isoToLocalInput, localInputToIso, localTimezoneLabel } from '../../lib/datetime'

interface EditorProps {
  hackathonId: string
  initial: ScheduleItem | null
  onSaved: () => void
  onCancel: () => void
}

function ScheduleEditor({ hackathonId, initial, onSaved, onCancel }: EditorProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [startsAt, setStartsAt] = useState(isoToLocalInput(initial?.starts_at))
  const [endsAt, setEndsAt] = useState(isoToLocalInput(initial?.ends_at))
  const [orderIndex, setOrderIndex] = useState(String(initial?.order_index ?? 0))
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
      const fields = {
        title: title.trim(),
        description: description.trim() || null,
        starts_at: localInputToIso(startsAt),
        ends_at: localInputToIso(endsAt),
        order_index: Number.parseInt(orderIndex, 10) || 0,
      }
      if (initial) {
        await updateScheduleItem(initial.id, fields)
      } else {
        await createScheduleItem({ hackathon_id: hackathonId, ...fields })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the schedule item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {error ? <FormError message={error} /> : null}
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Starts at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
          <Input
            label="Ends at"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
        <Input
          label="Order index"
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button type="submit" loading={saving}>
            {initial ? 'Save item' : 'Add item'}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  )
}

export function ScheduleTab({ hackathonId }: { hackathonId: string }) {
  const [items, setItems] = useState<ScheduleItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      setItems(await getAllScheduleItems(hackathonId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the schedule')
    }
  }, [hackathonId])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(id: string) {
    setError(null)
    try {
      await deleteScheduleItem(id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the item')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Schedule</h2>
        {!creating ? (
          <Button size="sm" icon={Plus} onClick={() => setCreating(true)}>
            New item
          </Button>
        ) : null}
      </div>

      <p className="text-sm text-muted">Times are shown in your local time, {localTimezoneLabel()}.</p>

      {error ? <FormError message={error} /> : null}

      {creating ? (
        <ScheduleEditor
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
        <p className="text-sm text-muted">No schedule items yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) =>
            editing === item.id ? (
              <ScheduleEditor
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
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted">
                        {String(item.order_index).padStart(2, '0')}
                      </span>
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {item.title}
                      </h3>
                    </div>
                    {item.description ? (
                      <p className="text-sm text-muted">{item.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="font-mono text-xs text-muted">
                    {formatDateTime(item.starts_at)}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(item.id)}>
                      Edit
                    </Button>
                    <ConfirmAction
                      label="Delete"
                      confirmLabel="Delete"
                      message="Delete this item?"
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
