import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../ui'

interface PublicHeaderProps {
  name: string
  isLoggedIn: boolean
}

/** Header specific to the public landing. The authenticated Navbar is not used here. */
export function PublicHeader({ name, isLoggedIn }: PublicHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight text-foreground">
          {name}
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {isLoggedIn ? (
            <Button size="sm" onClick={() => navigate('/hackathon')}>
              Go to hackathon
            </Button>
          ) : (
            <>
              <Link
                to="/signin"
                className="inline-flex h-9 items-center rounded px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
              >
                Sign in
              </Link>
              <Button size="sm" onClick={() => navigate('/signup')}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
