import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CloseIcon, LockIcon } from './icons'
import { cardHover, liftGhost, liftPrimary, underlineLink } from './interactive'
import { useAuth } from '../lib/useAuth'

const CONSENT_KEY = 'breached:consentGiven'
const CONSENT_COOKIE = 'breached_consent'
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year, in seconds

function hasGivenConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === '1'
  } catch {
    return false
  }
}

// A visible, standard browser cookie alongside the localStorage flag below —
// localStorage alone decides whether to show the banner, this is purely so
// the site actually has a real cookie a user (or a scanner) can find in
// DevTools' Application > Cookies panel. Secure is conditional: the browser
// silently refuses to set a Secure cookie over plain http://, which would
// otherwise make this untestable on localhost dev.
function setConsentCookie() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=1; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

function persistConsent() {
  try {
    localStorage.setItem(CONSENT_KEY, '1')
  } catch {
    // Storage unavailable — it just won't persist across visits/tabs,
    // not worth blocking the dismissal on.
  }
  setConsentCookie()
}

/** A consent notice — centered over a dimmed backdrop so it reads as the
 * page's primary focus before anything else. Shows once, the first time
 * someone reaches the site — persisted via localStorage, so agreeing once
 * skips it on every later page and visit from this browser. Signed-in users
 * are also skipped outright, covering the case where localStorage is
 * unavailable/cleared but the person has already been through this.
 *
 * Two views: the default one offers one-click Accept (agrees to
 * everything) or Preferences (reviews the two items individually before
 * saving). Closing with the X dismisses for this visit only, without
 * persisting anything — it'll show again next time since nothing was
 * agreed to. */
function ConsentBanner() {
  const { isAuthenticated, loading } = useAuth()
  const [dismissed, setDismissed] = useState(() => hasGivenConsent())
  const [view, setView] = useState<'main' | 'preferences'>('main')
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [scanningChecked, setScanningChecked] = useState(false)

  // While loading, we don't yet know if there's a session — wait rather
  // than flash the banner for a signed-in user before it disappears.
  if (loading || isAuthenticated || dismissed) return null

  function handleAccept() {
    persistConsent()
    setDismissed(true)
  }

  function handleClose() {
    setDismissed(true)
  }

  const canSavePreferences = privacyChecked && scanningChecked

  function handleSavePreferences() {
    if (!canSavePreferences) return
    persistConsent()
    setDismissed(true)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-label="Cookie and data consent"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-canvas p-8 text-center shadow-2xl sm:p-10">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className={`absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:text-ink ${liftGhost}`}
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
          <LockIcon className="h-5 w-5 text-accent" />
        </div>

        {view === 'main' ? (
          <>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Cookie settings</h1>
            <p className="mt-3 text-sm text-ink-muted">
              We collect your email, scan results, and account/session data as described in our{' '}
              <Link to="/privacy" className={`text-ink ${underlineLink}`}>
                Privacy Policy
              </Link>
              . Accept to continue, or open Preferences to review each item first.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleAccept}
                className={`w-full rounded-full bg-ink px-6 py-3.5 text-base font-medium text-canvas hover:bg-white sm:w-auto ${liftPrimary}`}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setView('preferences')}
                className={`w-full rounded-full border border-white/10 px-6 py-3.5 text-base font-medium text-ink-muted sm:w-auto ${liftGhost}`}
              >
                Preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Choose what to allow</h1>
            <p className="mt-3 text-sm text-ink-muted">Review and agree to each item below.</p>

            <div className="mt-6 flex flex-col gap-3 text-left">
              <label
                className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-ink-muted ${cardHover}`}
              >
                <input
                  type="checkbox"
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                />
                I agree to the Privacy Policy and understand how my data is collected and used.
              </label>

              <label
                className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-ink-muted ${cardHover}`}
              >
                <input
                  type="checkbox"
                  checked={scanningChecked}
                  onChange={(e) => setScanningChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                />
                I agree to have my email checked against third-party breach databases (HIBP, DeHashed) to generate my
                risk score.
              </label>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={!canSavePreferences}
                className={`w-full rounded-full bg-ink px-6 py-3.5 text-base font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white sm:w-auto ${liftPrimary}`}
              >
                Save preferences
              </button>
              <button
                type="button"
                onClick={() => setView('main')}
                className={`w-full rounded-full border border-white/10 px-6 py-3.5 text-base font-medium text-ink-muted sm:w-auto ${liftGhost}`}
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ConsentBanner
