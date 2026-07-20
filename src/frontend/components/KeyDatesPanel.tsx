import { Card } from '../../ui'
import type { Hackathon } from '../../backend/types'
import { formatDateTime } from '../lib/format'

export function KeyDatesPanel({ hackathon }: { hackathon: Hackathon }) {
  const dates: Array<{ label: string; value: string | null }> = [
    { label: 'Kickoff', value: hackathon.start_at },
    { label: 'Cases unlock', value: hackathon.cases_reveal_at },
    { label: 'Submission deadline', value: hackathon.submission_deadline },
    { label: 'Event ends', value: hackathon.end_at },
  ]

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="font-display text-base font-semibold text-foreground">Key dates</h2>
      <div className="border-t border-border">
        {dates.map((entry) => (
          <div key={entry.label} className="flex flex-col gap-0.5 border-b border-border py-3">
            <span className="text-sm font-medium text-foreground">{entry.label}</span>
            <span className="font-mono text-xs text-muted">{formatDateTime(entry.value)}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
