import { Link } from 'react-router-dom'
import { Container, PageHeader } from '../../ui'

/** Public sign up page. Placeholder only, the real form arrives in Phase 5. */
export default function SignUp() {
  return (
    <Container className="py-16">
      <PageHeader
        title="Create account"
        description="Placeholder sign up screen. The real form arrives in the next phase."
      />
      <p className="mt-6 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/signin" className="font-medium text-accent">
          Sign in
        </Link>
      </p>
    </Container>
  )
}
