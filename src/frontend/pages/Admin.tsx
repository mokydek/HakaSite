import { useEffect, useState } from 'react'
import { cn, Spinner } from '../../ui'
import { FormError } from '../components/FormError'
import { getAdminHackathon } from '../../backend/queries/admin'
import type { Hackathon } from '../../backend/types'
import { EventTab } from '../components/admin/EventTab'
import { CasesTab } from '../components/admin/CasesTab'
import { AnnouncementsTab } from '../components/admin/AnnouncementsTab'
import { ScheduleTab } from '../components/admin/ScheduleTab'
import { PeopleTab } from '../components/admin/PeopleTab'
import { SubmissionsTab } from '../components/admin/SubmissionsTab'

type AdminTabKey = 'event' | 'cases' | 'announcements' | 'schedule' | 'people' | 'submissions'

const TABS: Array<{ key: AdminTabKey; label: string }> = [
  { key: 'event', label: 'Event' },
  { key: 'cases', label: 'Cases' },
  { key: 'announcements', label: 'Announcements' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'people', label: 'People' },
  { key: 'submissions', label: 'Submissions' },
]

export default function Admin() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<AdminTabKey>('event')

  useEffect(() => {
    let active = true
    getAdminHackathon()
      .then((row) => {
        if (active) setHackathon(row)
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load the hackathon')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (error) {
    return <FormError message={error} />
  }

  if (!hackathon) {
    return <p className="text-sm text-muted">No hackathon found to administer.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">Admin</h1>
        <p className="text-sm text-muted">Manage {hackathon.title}.</p>
      </div>

      <div className="overflow-x-auto border-b border-border">
        <div className="flex min-w-max gap-1">
          {TABS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setTab(entry.key)}
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors',
                tab === entry.key
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted hover:text-foreground',
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'event' ? <EventTab hackathon={hackathon} onSaved={setHackathon} /> : null}
      {tab === 'cases' ? <CasesTab hackathonId={hackathon.id} /> : null}
      {tab === 'announcements' ? <AnnouncementsTab hackathonId={hackathon.id} /> : null}
      {tab === 'schedule' ? <ScheduleTab hackathonId={hackathon.id} /> : null}
      {tab === 'people' ? <PeopleTab hackathonId={hackathon.id} /> : null}
      {tab === 'submissions' ? <SubmissionsTab hackathonId={hackathon.id} /> : null}
    </div>
  )
}
