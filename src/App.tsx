import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './backend/auth/AuthProvider'
import { ProtectedRoute } from './backend/auth/ProtectedRoute'
import { RequireProfile } from './backend/auth/RequireProfile'
import { RequireRegistration } from './backend/auth/RequireRegistration'
import { RequireRole } from './backend/auth/RequireRole'
import { AppLayout } from './frontend/components/AppLayout'
import { Spinner } from './ui'

// Lazy load every page for code splitting and a fast initial load.
const LandingPage = lazy(() => import('./landing/LandingPage'))
const SignIn = lazy(() => import('./frontend/pages/SignIn'))
const SignUp = lazy(() => import('./frontend/pages/SignUp'))
const Onboarding = lazy(() => import('./frontend/pages/Onboarding'))
const Hackathon = lazy(() => import('./frontend/pages/Hackathon'))
const CaseDetail = lazy(() => import('./frontend/pages/CaseDetail'))
const Team = lazy(() => import('./frontend/pages/Team'))
const Submit = lazy(() => import('./frontend/pages/Submit'))
const Admin = lazy(() => import('./frontend/pages/Admin'))
const NotFound = lazy(() => import('./frontend/pages/NotFound'))

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size={20} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Authenticated, inside the app shell */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Reachable with an incomplete profile so onboarding can be finished */}
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Everything below requires a complete profile */}
              <Route element={<RequireProfile />}>
                {/* Registration happens here */}
                <Route path="/hackathon" element={<Hackathon />} />

                {/* These require an active registration */}
                <Route element={<RequireRegistration />}>
                  <Route path="/hackathon/cases/:caseId" element={<CaseDetail />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/submit" element={<Submit />} />
                </Route>

                {/* Organizer only */}
                <Route element={<RequireRole role="organizer" />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}
