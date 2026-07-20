import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CircleCheckBig } from 'lucide-react'
import { Button } from '../../ui'
import { OAuthButtons } from '../../frontend/components/OAuthButtons'

const PERKS = [
  'Free to enter, every track',
  'Find teammates or bring your own',
  'Mentors and workshops all weekend',
]

export function RegisterCta() {
  const navigate = useNavigate()

  return (
    <section id="register" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-accent">
              Register
            </p>
            <h2 className="mb-6 max-w-md font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Claim your spot in the next hackathon.
            </h2>
            <p className="mb-8 max-w-md text-lg text-muted">
              One free account gets you into every event. Continue with Google
              or GitHub, or sign up with email.
            </p>
            <ul className="flex flex-col gap-4">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3 text-sm text-foreground">
                  <CircleCheckBig size={16} strokeWidth={2} className="shrink-0 text-accent" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded border border-border bg-surface p-7 sm:p-9">
            <h3 className="font-display text-lg font-semibold text-foreground">
              Create your account
            </h3>
            <p className="mt-1 text-sm text-muted">Takes less than a minute.</p>

            <div className="mt-6">
              <OAuthButtons />
            </div>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                or
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <Button className="w-full" onClick={() => navigate('/signup')}>
              Sign up with email
              <ArrowRight size={16} strokeWidth={2.5} />
            </Button>

            <p className="mt-4 text-center text-xs text-muted">
              Already have an account?{' '}
              <Link to="/signin" className="font-medium text-accent">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
