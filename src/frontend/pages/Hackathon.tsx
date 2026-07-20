import { useCallback, useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button, EmptyState, Spinner } from '../../ui'
import { FormError } from '../components/FormError'
import { getPublishedHackathon } from '../../backend/queries/hackathon'
import { getMyRegistration } from '../../backend/queries/registrations'
import type { Hackathon as HackathonRow, Registration } from '../../backend/types'
import { HackathonHeader } from '../components/HackathonHeader'
import { RevealCountdown } from '../components/RevealCountdown'
import { CasesShell } from '../components/CasesShell'
import { AnnouncementsFeed } from '../components/AnnouncementsFeed'
import { ScheduleList } from '../components/ScheduleList'
import { StatusPanel } from '../components/StatusPanel'
import { KeyDatesPanel } from '../components/KeyDatesPanel'
import { RegisterCta } from '../components/RegisterCta'

export default function Hackathon() {
  const [hackathon, setHackathon] = useState<HackathonRow | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countdownDone, setCountdownDone] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const current = await getPublishedHackathon()
      setHackathon(current)
      setRegistration(current ? await getMyRegistration(current.id) : null)
    } catch {
      setError('Could not load the hackathon')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // Revealed if the reveal time has already passed on load, or once the live
  // countdown reaches zero. This flips the cases area without a manual refresh.
  const revealPassed = hackathon?.cases_reveal_at
    ? new Date(hackathon.cases_reveal_at).getTime() <= Date.now()
    : false
  const revealed = revealPassed || countdownDone

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size={20} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-4">
        <FormError message={error} />
        <Button variant="secondary" onClick={() => void load()}>
          Try again
        </Button>
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

  if (!registration) {
    return <RegisterCta hackathon={hackathon} onRegistered={() => void load()} />
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="flex flex-col gap-8 lg:col-span-2">
        <HackathonHeader hackathon={hackathon} />
        {!revealed && hackathon.cases_reveal_at ? (
          <RevealCountdown
            target={hackathon.cases_reveal_at}
            onComplete={() => setCountdownDone(true)}
          />
        ) : null}
        <CasesShell revealed={revealed} revealAt={hackathon.cases_reveal_at} />
        <AnnouncementsFeed hackathonId={hackathon.id} />
        <ScheduleList hackathonId={hackathon.id} />
      </div>
      <div className="flex flex-col gap-8">
        <StatusPanel hackathonId={hackathon.id} />
        <KeyDatesPanel hackathon={hackathon} />
      </div>
    </div>
  )
}
