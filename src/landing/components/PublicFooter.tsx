import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { GitHubIcon, XIcon, DiscordIcon } from '../../frontend/components/BrandIcons'

interface PublicFooterProps {
  name: string
  year: number
}

const PLATFORM = [
  { label: 'Tracks', href: '#tracks' },
  { label: 'Events', href: '#events' },
  { label: 'How it works', href: '#how' },
  { label: 'Stats', href: '#stats' },
]

const SOCIALS = [
  { label: 'GitHub', Icon: GitHubIcon },
  { label: 'X', Icon: XIcon },
  { label: 'Discord', Icon: DiscordIcon },
]

export function PublicFooter({ name, year }: PublicFooterProps) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded bg-accent text-accent-foreground">
                <Zap size={15} strokeWidth={2.5} />
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                {name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              The home for global online hackathons. Build, ship, and win with
              builders everywhere.
            </p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
              Platform
            </p>
            <ul className="flex flex-col gap-3">
              {PLATFORM.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
              Account
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <Link
                  to="/signin"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="font-mono text-xs text-muted">
            {name} {year}
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map(({ label, Icon }) => (
              <a
                key={label}
                href="#top"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded border border-border text-muted transition-colors hover:border-foreground hover:text-foreground"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
