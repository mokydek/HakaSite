import { useEffect, useState } from 'react'
import { Spinner } from '../../ui'
import { getScheduleItems } from '../../backend/queries/schedule'
import type { ScheduleItem } from '../../backend/types'
import { formatDateTime } from '../lib/format'

export function ScheduleList({ hackathonId }: { hackathonId: string }) {
  const [items, setItems] = useState<ScheduleItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setItems(null)
    setError(null)
    getScheduleItems(hackathonId)
      .then((rows) => {
        if (active) setItems(rows)
      })
      .catch(() => {
        if (active) setError('Could not load the schedule')
      })
    return () => {
      active = false
    }
  }, [hackathonId])

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">Schedule</h2>
      {error ? (
        <p className="text-sm font-semibold text-foreground">{error}</p>
      ) : items === null ? (
        <div className="flex justify-center py-8">
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">The schedule will be published soon.</p>
      ) : (
        <div className="border-t border-border">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">{item.title}</span>
                {item.description ? (
                  <span className="text-sm text-muted">{item.description}</span>
                ) : null}
              </div>
              <span className="shrink-0 font-mono text-xs text-muted">
                {formatDateTime(item.starts_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
