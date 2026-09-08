import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AmbientBackground from './components/AmbientBackground'
import RequireAuth from './components/app/RequireAuth'
import DashboardShell from './components/dashboard/DashboardShell'
import { AuthProvider } from './lib/authProvider'
import { warmBackend } from './lib/apiClient'
import HomePage from './pages/HomePage'

const AccountPage = lazy(() => import('./pages/dashboard/AccountPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const BreachDetailPage = lazy(() => import('./pages/BreachDetailPage'))
const BreachIntelligencePage = lazy(() => import('./pages/BreachIntelligencePage'))
const BreachesPage = lazy(() => import('./pages/dashboard/BreachesPage'))
const ComingSoonPage = lazy(() => import('./pages/ComingSoonPage'))
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const InsightsPage = lazy(() => import('./pages/dashboard/InsightsPage'))
const MissionPage = lazy(() => import('./pages/MissionPage'))
const Modules = lazy(() => import('./pages/dashboard/Modules'))
const ModulesPage = lazy(() => import('./pages/ModulesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const NotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'))
const PasswordCheckPage = lazy(() => import('./pages/dashboard/PasswordCheckPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))
const ScanRecordsPage = lazy(() => import('./pages/dashboard/ScanRecordsPage'))
const ResultsPage = lazy(() => import('./pages/ResultsPage'))
const ScanPage = lazy(() => import('./pages/ScanPage'))
const TermsPage = lazy(() => import('./pages/TermsPage'))
const VisionPage = lazy(() => import('./pages/VisionPage'))

function RouteFallback() {
  return <div className="flex min-h-dvh items-center justify-center text-sm text-ink-faint">Loading…</div>
}

function App() {
  // Once per full page load (not per route change — App itself never
  // remounts across client-side navigation), fired as early as possible
  // regardless of which page someone lands on. See warmBackend()'s own
  // comment for why this matters on Render's free tier.
  useEffect(() => {
    warmBackend()
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <AmbientBackground />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/scan/results" element={<ResultsPage />} />
            <Route path="/breach-intelligence" element={<BreachIntelligencePage />} />
            <Route path="/breach-intelligence/:name" element={<BreachDetailPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <DashboardShell />
                </RequireAuth>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="insights" element={<InsightsPage />} />
              <Route path="breaches" element={<BreachesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="scans" element={<ScanRecordsPage />} />
              <Route path="modules" element={<Modules />} />
              <Route path="password-check" element={<PasswordCheckPage />} />
              <Route path="account" element={<AccountPage />} />
            </Route>

            <Route
              path="/developer"
              element={
                <ComingSoonPage
                  title="Meet the team"
                  description="We're putting together a proper introduction to the people building Breached."
                />
              }
            />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="/vision" element={<VisionPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route
              path="/contact"
              element={
                <ComingSoonPage
                  title="Contact us"
                  description="A dedicated contact page is on the way. Check back soon."
                />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
