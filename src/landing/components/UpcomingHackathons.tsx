import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Wifi, MapPin, Trophy, ArrowRight } from 'lucide-react'
import { Button, cn } from '../../ui'

interface EventItem {
  name: string
  date: string
  duration: string
  format: string
  online: boolean
  prize: string
  track: string
  status: string
  open: boolean
}

const EVENTS: EventItem[] = [
  {
    name: 'Autumn AI Sprint',
    date: 'Oct 18, 2026',
    duration: '48 hours',
    format: 'Online',
    online: true,
    prize: '$40,000',
    track: 'AI / ML',
    status: 'Registration open',
    open: true,
  },
  {
    name: 'ChainForge',
    date: 'Nov 8, 2026',
    duration: '72 hours',
    format: 'Hybrid · Berlin',
    online: false,
    prize: '$60,000',
    track: 'Blockchain',
    status: 'Registration open',
    open: true,
  },
  {
    name: 'Pixel Jam',
    date: 'Nov 22, 2026',
    duration: '48 hours',
    format: 'Online',
    online: true,
    prize: '$25,000',
    track: 'Gamedev',
    status: 'Early access',
    open: false,
  },
  {
    name: 'Frontier Hardware',
    date: 'Dec 6, 2026',
    duration: '60 hours',
    format: 'Hybrid · Tokyo',
    online: false,
    prize: '$50,000',
    track: 'Hardware / IoT',
    status: 'Registration open',
    open: true,
  },
]

export function UpcomingHackathons() {
  const navigate = useNavigate()

  return (
    <section id="events" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
              Upcoming
            </p>
            <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              The next builds start soon.
            </h2>
          </div>
          <p className="max-w-xs text-sm text-muted">
            Reserve your spot before registration closes. One account gets you
            into every event.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {EVENTS.map((event) => (
            <article
              key={event.name}
              className="flex flex-col gap-6 rounded border border-border bg-background p-7 transition-colors hover:border-foreground"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded border border-border px-2.5 py-1 font-mono text-xs text-accent">
                  {event.track}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-xs font-medium',
                    event.open ? 'text-foreground' : 'text-muted',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      event.open ? 'bg-accent' : 'bg-muted',
                    )}
                  />
                  {event.status}
                </span>
              </div>

              <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                {event.name}
              </h3>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2.5 text-muted">
                  <Calendar size={16} strokeWidth={1.75} className="shrink-0" />
                  <span className="font-mono text-foreground">{event.date}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <Clock size={16} strokeWidth={1.75} className="shrink-0" />
                  <span>{event.duration}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  {event.online ? (
                    <Wifi size={16} strokeWidth={1.75} className="shrink-0" />
                  ) : (
                    <MapPin size={16} strokeWidth={1.75} className="shrink-0" />
                  )}
                  <span>{event.format}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted">
                  <Trophy size={16} strokeWidth={1.75} className="shrink-0" />
                  <span className="font-mono font-semibold text-foreground">
                    {event.prize}
                  </span>
                </div>
              </dl>

              <Button
                variant="secondary"
                className="mt-auto w-full"
                onClick={() => navigate('/signup')}
              >
                Register
                <ArrowRight size={15} strokeWidth={2.5} />
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
