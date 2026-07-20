import { useEffect, useState } from 'react'
import { Card, Spinner } from '../../ui'
import { getAnnouncements } from '../../backend/queries/announcements'
import type { Announcement } from '../../backend/types'
import { formatDateTime } from '../lib/format'

export function AnnouncementsFeed({ hackathonId }: { hackathonId: string }) {
  const [items, setItems] = useState<Announcement[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setItems(null)
    setError(null)
    getAnnouncements(hackathonId)
      .then((rows) => {
        if (active) setItems(rows)
      })
      .catch(() => {
        if (active) setError('Could not load announcements')
      })
    return () => {
      active = false
    }
  }, [hackathonId])

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
        Announcements
      </h2>
      {error ? (
        <p className="text-sm font-semibold text-foreground">{error}</p>
      ) : items === null ? (
        <div className="flex justify-center py-8">
          <Spinner size={20} />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No announcements yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((announcement) => (
            <Card key={announcement.id} className="flex flex-col gap-2">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h3 className="font-display text-base font-semibold text-foreground">
                  {announcement.title}
                </h3>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {formatDateTime(announcement.created_at)}
                </span>
              </div>
              {announcement.body ? (
                <p className="whitespace-pre-line text-sm text-muted">{announcement.body}</p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
