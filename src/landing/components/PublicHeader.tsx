import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Zap } from 'lucide-react'
import { Button } from '../../ui'
import { ThemeToggle } from '../../frontend/components/ThemeToggle'

interface PublicHeaderProps {
  name: string
  isLoggedIn: boolean
}

const NAV = [
  { label: 'Tracks', href: '#tracks' },
  { label: 'Events', href: '#events' },
  { label: 'How it works', href: '#how' },
  { label: 'Stats', href: '#stats' },
]

/** Header for the public landing. The authenticated Navbar is not used here. */
export function PublicHeader({ name, isLoggedIn }: PublicHeaderProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <a href="#top" className="flex items-center gap-2.5" aria-label={`${name} home`}>
          <span className="grid h-7 w-7 place-items-center rounded bg-accent text-accent-foreground">
            <Zap size={15} strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            {name}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {isLoggedIn ? (
            <Button size="sm" onClick={() => navigate('/hackathon')}>
              Go to hackathon
            </Button>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-sm font-medium text-foreground transition-colors hover:text-muted"
              >
                Sign in
              </Link>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-border text-foreground transition-colors hover:bg-surface"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded px-2 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2">
              {isLoggedIn ? (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setOpen(false)
                    navigate('/hackathon')
                  }}
                >
                  Go to hackathon
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setOpen(false)
                      navigate('/signin')
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setOpen(false)
                      navigate('/signup')
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
