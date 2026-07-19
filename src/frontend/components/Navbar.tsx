import { Link, useNavigate } from 'react-router-dom'
import { LogIn, LogOut } from 'lucide-react'
import { Button } from '../../ui'
import { useAuth } from '../../backend/auth/useAuth'

/** Top bar with the product name and a session aware auth action. */
export function Navbar() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await signOut()
    } finally {
      navigate('/')
    }
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight text-foreground"
        >
          Hackathon platform
        </Link>
        {session ? (
          <Button variant="ghost" size="sm" icon={LogOut} onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        ) : (
          <Link
            to="/signin"
            className="inline-flex h-8 items-center gap-2 rounded px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            <LogIn size={16} strokeWidth={2} aria-hidden="true" />
            Sign in
          </Link>
        )}
      </div>
    </header>
  )
}
