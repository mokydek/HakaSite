import type { Hackathon } from '../../backend/types'
import { formatDate } from '../format'

interface KeyDatesProps {
  hackathon: Hackathon
}

export function KeyDates({ hackathon }: KeyDatesProps) {
  const milestones: Array<{ label: string; value: string | null }> = [
    { label: 'Registration deadline', value: hackathon.registration_deadline },
    { label: 'Kickoff', value: hackathon.start_at },
    { label: 'Cases unlock', value: hackathon.cases_reveal_at },
    { label: 'Submission deadline', value: hackathon.submission_deadline },
    { label: 'Event ends', value: hackathon.end_at },
  ]

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        Key dates
      </h2>
      <div className="mt-8 border-t border-border">
        {milestones.map((milestone) => (
          <div
            key={milestone.label}
            className="flex flex-col gap-1 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium text-foreground">{milestone.label}</span>
            <span className="font-mono text-sm text-muted">{formatDate(milestone.value)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
