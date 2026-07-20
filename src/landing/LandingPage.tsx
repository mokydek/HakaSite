import { useEffect, useState } from 'react'
import { Spinner } from '../ui'
import { useAuth } from '../backend/auth/useAuth'
import { getPublishedHackathon } from '../backend/queries/hackathon'
import type { Hackathon } from '../backend/types'
import { PublicHeader } from './components/PublicHeader'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { KeyDates } from './components/KeyDates'
import { Prizes } from './components/Prizes'
import { About } from './components/About'
import { PublicFooter } from './components/PublicFooter'
import { usePageTitle } from '../frontend/hooks/usePageTitle'

const PRODUCT_NAME = 'Hackathon platform'

/** Public, anonymous landing page at the / route. */
export default function LandingPage() {
  usePageTitle()
  const { session } = useAuth()
  const isLoggedIn = Boolean(session)

  const [hackathon, setHackathon] = useState<Hackathon | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getPublishedHackathon()
      .then((row) => {
        if (active) setHackathon(row)
      })
      .catch(() => {
        if (active) setHackathon(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const year = new Date().getFullYear()

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader name={PRODUCT_NAME} isLoggedIn={isLoggedIn} />

      <main className="flex-1">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <Spinner size={20} />
          </div>
        ) : hackathon ? (
          <>
            <Hero hackathon={hackathon} isLoggedIn={isLoggedIn} />
            <HowItWorks />
            <KeyDates hackathon={hackathon} />
            {hackathon.prizes ? <Prizes prizes={hackathon.prizes} /> : null}
            <About longDescription={hackathon.long_description} rules={hackathon.rules} />
          </>
        ) : (
          <section className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-6 text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
              Registration is opening soon
            </h1>
            <p className="mt-4 max-w-md text-sm text-muted">
              There is no published hackathon right now. Check back shortly to register.
            </p>
          </section>
        )}
      </main>

      <PublicFooter name={PRODUCT_NAME} year={year} />
    </div>
  )
}
