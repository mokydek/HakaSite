import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, Container, Input, PageHeader } from '../../ui'
import { FormError } from '../components/FormError'
import { useAuth } from '../../backend/auth/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FieldErrors {
  email?: string
  password?: string
}

interface FromState {
  from?: { pathname?: string }
}

export default function SignIn() {
  usePageTitle('Sign in')
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = (location.state as FromState | null)?.from?.pathname ?? '/hackathon'

  function validate(): boolean {
    const next: FieldErrors = {}
    if (!EMAIL_PATTERN.test(email)) next.email = 'Enter a valid email address'
    if (password.length === 0) next.password = 'Enter your password'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not sign you in'
      if (/invalid login credentials|invalid credentials/i.test(message)) {
        setFormError('Those credentials are not correct. Check your email and password.')
      } else {
        setFormError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md">
        <PageHeader title="Sign in" description="Welcome back. Sign in to continue." />
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
          {formError ? <FormError message={formError} /> : null}
          <Button type="submit" loading={submitting}>
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Need an account?{' '}
          <Link to="/signup" className="font-medium text-accent">
            Create one
          </Link>
        </p>
      </div>
    </Container>
  )
}
