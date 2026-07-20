import { Badge } from '../../ui'
import type { Hackathon, HackathonStatus } from '../../backend/types'

const STATUS_LABEL: Record<HackathonStatus, string> = {
  draft: 'Draft',
  published: 'Open',
  live: 'Live',
  ended: 'Ended',
}

export function HackathonHeader({ hackathon }: { hackathon: Hackathon }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          {hackathon.title}
        </h1>
        <Badge>{STATUS_LABEL[hackathon.status]}</Badge>
      </div>
      {hackathon.description ? (
        <p className="max-w-2xl text-sm text-muted sm:text-base">{hackathon.description}</p>
      ) : null}
    </div>
  )
}
