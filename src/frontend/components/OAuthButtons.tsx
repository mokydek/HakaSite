import { useState } from 'react'
import { signInWithOAuth, type OAuthProvider } from '../../backend/queries/auth'
import { GoogleIcon, GitHubIcon } from './BrandIcons'
import { FormError } from './FormError'

const buttonClasses =
  'inline-flex h-10 select-none items-center justify-center gap-2 whitespace-nowrap rounded border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground disabled:pointer-events-none disabled:opacity-50'

/**
 * Continue with Google or GitHub. Clicking redirects the browser to the
 * provider through Supabase, so there is no local success state to render.
 */
export function OAuthButtons() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<OAuthProvider | null>(null)

  async function start(provider: OAuthProvider) {
    setError(null)
    setPending(provider)
    try {
      await signInWithOAuth(provider)
      // On success the browser navigates away to the provider.
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not start sign in')
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => start('google')}
          disabled={pending !== null}
          aria-busy={pending === 'google' || undefined}
          className={buttonClasses}
        >
          <GoogleIcon size={16} />
          Google
        </button>
        <button
          type="button"
          onClick={() => start('github')}
          disabled={pending !== null}
          aria-busy={pending === 'github' || undefined}
          className={buttonClasses}
        >
          <GitHubIcon size={16} />
          GitHub
        </button>
      </div>
      {error ? <FormError message={error} /> : null}
    </div>
  )
}
