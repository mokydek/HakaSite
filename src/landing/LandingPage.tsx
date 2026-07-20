import { usePageTitle } from '../frontend/hooks/usePageTitle'
import { useAuth } from '../backend/auth/useAuth'
import { PublicHeader } from './components/PublicHeader'
import { Hero } from './components/Hero'
import { HackathonTypes } from './components/HackathonTypes'
import { UpcomingHackathons } from './components/UpcomingHackathons'
import { HowItWorks } from './components/HowItWorks'
import { Stats } from './components/Stats'
import { RegisterCta } from './components/RegisterCta'
import { PublicFooter } from './components/PublicFooter'

const PRODUCT_NAME = 'Hackathon platform'

/** Public, anonymous landing page at the / route. */
export default function LandingPage() {
  usePageTitle()
  const { session } = useAuth()
  const isLoggedIn = Boolean(session)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader name={PRODUCT_NAME} isLoggedIn={isLoggedIn} />

      <main className="flex-1">
        <Hero isLoggedIn={isLoggedIn} />
        <HackathonTypes />
        <UpcomingHackathons />
        <HowItWorks />
        <Stats />
        <RegisterCta />
      </main>

      <PublicFooter name={PRODUCT_NAME} year={new Date().getFullYear()} />
    </div>
  )
}
