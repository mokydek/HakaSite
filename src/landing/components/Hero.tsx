import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../ui'
import { HeroArt } from './HeroArt'

interface HeroProps {
  isLoggedIn: boolean
}

const HERO_STATS = [
  { value: '12K+', label: 'Builders' },
  { value: '240', label: 'Hackathons' },
  { value: '$2.4M', label: 'In prizes' },
]

export function Hero({ isLoggedIn }: HeroProps) {
  const navigate = useNavigate()

  return (
    <section id="top" className="border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
        <div>
          <p className="mb-6 inline-flex items-center gap-2 rounded border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Global online hackathons
          </p>

          <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-6xl">
            Build something
            <br />
            <span className="text-accent">worth shipping.</span>
          </h1>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Pick a track, team up with builders worldwide, and turn a weekend
            into a real product. Register once and join every event.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="md" onClick={() => navigate(isLoggedIn ? '/hackathon' : '/signup')}>
              {isLoggedIn ? 'Go to hackathon' : 'Register now'}
              <ArrowRight size={16} strokeWidth={2.5} />
            </Button>
            <a
              href="#tracks"
              className="inline-flex h-10 items-center justify-center gap-2 rounded border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground"
            >
              Explore tracks
            </a>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-widest text-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hidden lg:block">
          <HeroArt className="w-full" />
        </div>
      </div>
    </section>
  )
}
