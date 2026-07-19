import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import { Badge, Button, Card, EmptyState, PageHeader, Spinner } from '../../ui'
import { FormError } from '../components/FormError'
import { getPublishedHackathon } from '../../backend/queries/hackathon'
import { getMyRegistration, registerForHackathon } from '../../backend/queries/registrations'
import type { Hackathon as HackathonRow, Registration } from '../../backend/types'

export default function Hackathon() {
  const navigate = useNavigate()

  const [hackathon, setHackathon] = useState<HackathonRow | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const current = await getPublishedHackathon()
      setHackathon(current)
      if (current) {
        setRegistration(await getMyRegistration(current.id))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the hackathon')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleRegister() {
    if (!hackathon) return
    setRegistering(true)
    setError(null)
    try {
      setRegistration(await registerForHackathon(hackathon.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register for the hackathon')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (!hackathon) {
    return (
      <EmptyState
        icon={Calendar}
        title="No hackathon yet"
        description="There is no published hackathon right now. Check back soon."
      />
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={hackathon.title} description={hackathon.description ?? undefined} />

      {error ? <FormError message={error} /> : null}

      <Card className="flex flex-col gap-4">
        {registration ? (
          <>
            <div>
              <Badge>Registered</Badge>
            </div>
            <p className="text-sm text-muted">
              You are registered for this hackathon. Head to your team space or start your
              submission.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" icon={ArrowRight} onClick={() => navigate('/team')}>
                Team
              </Button>
              <Button variant="secondary" icon={ArrowRight} onClick={() => navigate('/submit')}>
                Submit
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-display text-lg font-semibold text-foreground">Registration</h2>
            <p className="text-sm text-muted">
              Register to unlock your team space and submissions for this hackathon.
            </p>
            <div>
              <Button onClick={() => void handleRegister()} loading={registering}>
                Register for the hackathon
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
