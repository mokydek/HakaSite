import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Container, Input, PageHeader } from '../../ui'
import { FormError } from '../components/FormError'
import { OAuthButtons } from '../components/OAuthButtons'
import { useAuth } from '../../backend/auth/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  email?: string
  password?: string
  confirm?: string
}

export default function SignUp() {
  usePageTitle('Create account')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!EMAIL_PATTERN.test(email)) next.email = 'Enter a valid email address'
    if (password.length < 8) next.password = 'Use at least 8 characters'
    if (confirm !== password) next.confirm = 'Passwords do not match'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      const data = await signUp(email, password)
      // Supabase returns a user with an empty identities array when the email
      // already exists and confirmations are on, to avoid leaking accounts.
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setFormError('An account with this email already exists. Try signing in instead.')
        return
      }
      if (data.session) {
        navigate('/onboarding', { replace: true })
        return
      }
      setCheckEmail(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create your account'
      if (/already registered|already exists|already been registered/i.test(message)) {
        setFormError('An account with this email already exists. Try signing in instead.')
      } else {
        setFormError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (checkEmail) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-md">
          <PageHeader
            title="Check your email"
            description="We sent a confirmation link to your email address. Open it to finish creating your account."
          />
          <p className="mt-6 text-sm text-muted">
            Already confirmed?{' '}
            <Link to="/signin" className="font-medium text-accent">
              Sign in
            </Link>
          </p>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <PageHeader title="Create account" description="Sign up to join the hackathon." />
        <div className="mt-8">
          <OAuthButtons />
        </div>
        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs uppercase tracking-widest text-muted">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            error={fieldErrors.confirm}
          />
          {formError ? <FormError message={formError} /> : null}
          <Button type="submit" loading={submitting}>
            Create account
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/signin" className="font-medium text-accent">
            Sign in
          </Link>
        </p>
      </div>
    </Container>
  )
}
