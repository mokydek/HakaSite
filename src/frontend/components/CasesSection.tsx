import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Lock, Unlock } from 'lucide-react'
import { Card, Countdown, EmptyState, Spinner } from '../../ui'
import { getCases } from '../../backend/queries/cases'
import type { Case } from '../../backend/types'
import { useRealtimeRefetch } from '../hooks/useRealtimeRefetch'

interface CasesSectionProps {
  hackathonId: string
  revealAt: string | null
}

const POLL_INTERVAL_MS = 5000
const POLL_MAX_MS = 120_000

/**
 * Timed reveal of the cases. The database RLS is the source of truth: getCases
 * returns nothing until the server clock passes reveal_at. The countdown and
 * the bounded polling only decide when to refetch, never whether to show.
 */
export function CasesSection({ hackathonId, revealAt }: CasesSectionProps) {
  const [cases, setCases] = useState<Case[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [countdownDone, setCountdownDone] = useState(false)
  const [polling, setPolling] = useState(false)

  // Display only. RLS decides what getCases actually returns.
  const revealPassed = revealAt ? new Date(revealAt).getTime() <= Date.now() : false
  const showCases = revealPassed || countdownDone

  const refetch = useCallback(async (): Promise<Case[] | null> => {
    try {
      const rows = await getCases(hackathonId)
      setCases(rows)
      setError(null)
      return rows
    } catch {
      setError('Could not load the cases')
      return null
    }
  }, [hackathonId])

  // On reveal, fetch immediately, then poll for up to two minutes until rows
  // appear. This absorbs a client clock that is ahead of the server.
  useEffect(() => {
    if (!showCases) return
    let active = true
    let intervalId: number | null = null
    const startedAt = Date.now()

    const stopPolling = () => {
      if (intervalId !== null) {
        clearInterval(intervalId)
        intervalId = null
      }
      if (active) setPolling(false)
    }

    void (async () => {
      const rows = await refetch()
      if (!active) return
      if (rows && rows.length > 0) return
      setPolling(true)
      intervalId = window.setInterval(() => {
        void (async () => {
          const next = await refetch()
          if (!active) return
          if ((next && next.length > 0) || Date.now() - startedAt > POLL_MAX_MS) {
            stopPolling()
          }
        })()
      }, POLL_INTERVAL_MS)
    })()

    return () => {
      active = false
      if (intervalId !== null) clearInterval(intervalId)
    }
  }, [showCases, refetch])

  // Live organizer edits during the event, and a reveal path if the client
  // clock was behind the server.
  useRealtimeRefetch({
    table: 'cases',
    filter: `hackathon_id=eq.${hackathonId}`,
    onChange: () => {
      void refetch()
    },
  })

  // Cheap safety net when the tab regains focus.
  useEffect(() => {
    const onFocus = () => {
      void refetch()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [refetch])

  if (!showCases) {
    return (
      <section className="flex flex-col items-center gap-6 rounded border border-border bg-surface px-6 py-10 text-center">
        <Lock size={20} strokeWidth={2} aria-hidden="true" className="text-muted" />
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Cases unlock in</p>
        {revealAt ? (
          <Countdown target={revealAt} onComplete={() => setCountdownDone(true)} />
        ) : (
          <p className="font-mono text-sm text-muted">Reveal time to be announced</p>
        )}
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Unlock size={20} strokeWidth={2} aria-hidden="true" className="text-foreground" />
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">Cases</h2>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-foreground">{error}</p>
      ) : cases === null ? (
        <div className="flex justify-center py-8">
          <Spinner size={20} />
        </div>
      ) : cases.length === 0 ? (
        polling ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Spinner size={20} />
            <p className="text-sm text-muted">Cases are unlocking. This updates automatically.</p>
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No cases yet"
            description="The cases will appear here once they are published."
          />
        )
      ) : (
        <div className="flex flex-col gap-4">
          {cases.map((caseItem) => (
            <Link key={caseItem.id} to={`/hackathon/cases/${caseItem.id}`} className="block">
              <Card className="flex flex-col gap-2 transition-colors hover:border-foreground">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    {String(caseItem.order_index).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {caseItem.title}
                  </h3>
                </div>
                {caseItem.summary ? <p className="text-sm text-muted">{caseItem.summary}</p> : null}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
