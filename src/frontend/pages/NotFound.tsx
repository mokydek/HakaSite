import { Link } from 'react-router-dom'
import { Container, PageHeader } from '../../ui'
import { usePageTitle } from '../hooks/usePageTitle'

/** Catch all not found page. */
export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <Container className="py-16">
      <PageHeader
        title="Page not found"
        description="The page you are looking for does not exist."
      />
      <p className="mt-6 text-sm text-muted">
        <Link to="/" className="font-medium text-accent">
          Return home
        </Link>
      </p>
    </Container>
  )
}
