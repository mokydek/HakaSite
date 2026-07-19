import { useNavigate } from 'react-router-dom'
import { Button, Container, PageHeader } from '../ui'

/** Public landing page. Placeholder content, real marketing arrives later. */
export default function LandingPage() {
  const navigate = useNavigate()
  return (
    <Container className="py-16">
      <PageHeader
        title="Hackathon platform"
        description="A global online hackathon. Register, form a team, wait for the case reveal, then build and submit a working product."
        actions={<Button onClick={() => navigate('/signin')}>Sign in</Button>}
      />
    </Container>
  )
}
