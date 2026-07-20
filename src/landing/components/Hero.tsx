import { Link, useNavigate } from 'react-router-dom'
import { Button, Countdown } from '../../ui'
import type { Hackathon } from '../../backend/types'
import { formatDateShort, isFuture } from '../format'

interface HeroProps {
  hackathon: Hackathon
  isLoggedIn: boolean
}

export function Hero({ hackathon, isLoggedIn }: HeroProps) {
  const navigate = useNavigate()
  const kickerDate = hackathon.start_at ?? hackathon.registration_deadline
  const showCountdown = isFuture(hackathon.start_at)

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <div className="flex flex-col gap-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted sm:text-sm">
          {kickerDate ? `Starts ${formatDateShort(kickerDate)}` : 'Dates to be announced'}
        </p>

        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          {hackathon.title}
        </h1>

        {hackathon.description ? (
          <p className="max-w-2xl text-base text-muted sm:text-lg">{hackathon.description}</p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button onClick={() => navigate(isLoggedIn ? '/hackathon' : '/signup')}>
            {isLoggedIn ? 'Go to hackathon' : 'Sign up'}
          </Button>
          {!isLoggedIn ? (
            <Link to="/signin" className="text-sm font-medium text-foreground hover:text-muted">
              Sign in
            </Link>
          ) : null}
        </div>

        {showCountdown && hackathon.start_at ? (
          <div className="mt-6">
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">Starts in</p>
            <Countdown target={hackathon.start_at} />
          </div>
        ) : null}

        {hackathon.cover_url ? (
          <div className="mt-8 overflow-hidden rounded border border-border">
            <img src={hackathon.cover_url} alt="" className="block w-full" />
          </div>
        ) : null}
      </div>
    </section>
  )
}
