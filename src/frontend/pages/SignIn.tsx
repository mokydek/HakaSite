import { Link } from 'react-router-dom'
import { Container, PageHeader } from '../../ui'

/** Public sign in page. Placeholder only, the real form arrives in Phase 5. */
export default function SignIn() {
  return (
    <Container className="py-16">
      <PageHeader
        title="Sign in"
        description="Placeholder sign in screen. The real form arrives in the next phase."
      />
      <p className="mt-6 text-sm text-muted">
        Need an account?{' '}
        <Link to="/signup" className="font-medium text-accent">
          Create one
        </Link>
      </p>
    </Container>
  )
}
