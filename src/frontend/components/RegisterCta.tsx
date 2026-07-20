import { useState } from 'react'
import { Button, Card, PageHeader } from '../../ui'
import { FormError } from './FormError'
import { registerForHackathon } from '../../backend/queries/registrations'
import type { Hackathon } from '../../backend/types'

interface RegisterCtaProps {
  hackathon: Hackathon
  onRegistered: () => void
}

/** Shown at /hackathon to a profiled but unregistered user. */
export function RegisterCta({ hackathon, onRegistered }: RegisterCtaProps) {
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRegister() {
    setRegistering(true)
    setError(null)
    try {
      await registerForHackathon(hackathon.id)
      onRegistered()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not register for the hackathon')
      setRegistering(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title={hackathon.title} description={hackathon.description ?? undefined} />
      <Card className="flex max-w-xl flex-col gap-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Registration</h2>
        <p className="text-sm text-muted">
          Register to unlock your team space, the cases, and submissions.
        </p>
        {error ? <FormError message={error} /> : null}
        <div>
          <Button onClick={() => void handleRegister()} loading={registering}>
            Register for the hackathon
          </Button>
        </div>
      </Card>
    </div>
  )
}
