import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Lock, Paperclip } from 'lucide-react'
import { Button, Countdown, Spinner } from '../../ui'
import { Markdown } from '../components/Markdown'
import { getCaseById } from '../../backend/queries/cases'
import { getPublishedHackathon } from '../../backend/queries/hackathon'
import type { Case, Json } from '../../backend/types'

interface Attachment {
  name: string
  url: string
}

/** The attachments column is free form jsonb, so normalize it defensively. */
function parseAttachments(value: Json): Attachment[] {
  if (!Array.isArray(value)) return []
  const result: Attachment[] = []
  for (const item of value) {
    if (typeof item === 'string') {
      result.push({ name: item, url: item })
    } else if (item && typeof item === 'object' && !Array.isArray(item)) {
      const url = typeof item.url === 'string' ? item.url : null
      if (url) {
        result.push({ name: typeof item.name === 'string' ? item.name : url, url })
      }
    }
  }
  return result
}

export default function CaseDetail() {
  const { caseId } = useParams()
  const navigate = useNavigate()

  const [caseRow, setCaseRow] = useState<Case | null>(null)
  const [revealAt, setRevealAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const [row, hackathon] = await Promise.all([
          caseId ? getCaseById(caseId) : Promise.resolve(null),
          getPublishedHackathon(),
        ])
        if (!active) return
        setCaseRow(row)
        setRevealAt(hackathon?.cases_reveal_at ?? null)
      } catch {
        if (active) setError('Could not load the case')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [caseId])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (error) {
    return <p className="text-sm font-semibold text-foreground">{error}</p>
  }

  // Null means not revealed yet or the case does not exist. Both show calmly.
  if (!caseRow) {
    const revealFuture = revealAt ? new Date(revealAt).getTime() > Date.now() : false
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <Lock size={20} strokeWidth={2} aria-hidden="true" className="text-muted" />
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          This case is not available yet
        </h1>
        <p className="text-sm text-muted">
          Cases unlock at the reveal time for registered participants.
        </p>
        {revealFuture && revealAt ? <Countdown target={revealAt} /> : null}
        <Link to="/hackathon" className="text-sm font-medium text-accent">
          Back to the dashboard
        </Link>
      </div>
    )
  }

  const attachments = parseAttachments(caseRow.attachments)

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          to="/hackathon"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back to the dashboard
        </Link>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {caseRow.title}
        </h1>
        {caseRow.summary ? <p className="text-base text-muted">{caseRow.summary}</p> : null}
      </div>

      {caseRow.full_description ? <Markdown>{caseRow.full_description}</Markdown> : null}

      {attachments.length > 0 ? (
        <div className="flex flex-col gap-3 border-t border-border pt-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Attachments</h2>
          <ul className="flex flex-col gap-2">
            {attachments.map((attachment, index) => (
              <li key={`${attachment.url}-${index}`}>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent"
                >
                  <Paperclip size={16} strokeWidth={2} aria-hidden="true" />
                  {attachment.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-border pt-6">
        <Button onClick={() => navigate('/submit')}>Submit for this case</Button>
      </div>
    </article>
  )
}
