import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CloseIcon } from './icons'
import { liftGhost, liftPrimary, underlineLink } from './interactive'
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

/** A consent notice — a compact, non-blocking card anchored to the bottom
 * left corner (no full-screen backdrop; the rest of the page stays usable
 * underneath it), similar to Vercel's own cookie notice. Shows once, the
 * first time someone reaches the site — persisted via localStorage, so
 * agreeing once skips it on every later page and visit from this browser.
 * Signed-in users are also skipped outright, covering the case where
 * localStorage is unavailable/cleared but the person has already been
 * through this.
 *
 * Two views: the default one offers one-click Accept (agrees to
 * everything) or Preferences (reveals the two items individually before
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
      className="fixed bottom-4 left-4 z-[100] w-[calc(100%-2rem)] max-w-sm sm:bottom-6 sm:left-6"
      role="dialog"
      aria-label="Cookie and data consent"
    >
      <div className="relative rounded-2xl border border-white/10 bg-canvas p-4 shadow-2xl sm:p-5">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className={`absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full text-ink-muted hover:text-ink ${liftGhost}`}
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </button>

        {view === 'main' ? (
          <>
            <p className="pr-6 text-xs leading-snug text-ink-muted">
              We use cookies and collect scan data as described in our{' '}
              <Link to="/privacy" className={`text-ink ${underlineLink}`}>
                Privacy Policy
              </Link>
              .
            </p>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className={`flex-1 rounded-full bg-ink px-4 py-2 text-xs font-medium text-canvas hover:bg-white ${liftPrimary}`}
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setView('preferences')}
                className={`flex-1 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-ink-muted ${liftGhost}`}
              >
                Preferences
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="pr-6 text-xs font-medium text-ink">Choose what to allow</p>

            <div className="mt-2.5 flex flex-col gap-2 text-left">
              <label className="flex items-start gap-2 text-xs text-ink-muted">
                <input
                  type="checkbox"
                  checked={privacyChecked}
                  onChange={(e) => setPrivacyChecked(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-accent"
                />
                I agree to the Privacy Policy and understand how my data is collected and used.
              </label>

              <label className="flex items-start gap-2 text-xs text-ink-muted">
                <input
                  type="checkbox"
                  checked={scanningChecked}
                  onChange={(e) => setScanningChecked(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-accent"
                />
                I agree to have my email checked against third-party breach databases (HIBP, DeHashed) to generate my
                risk score.
              </label>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={!canSavePreferences}
                className={`flex-1 rounded-full bg-ink px-4 py-2 text-xs font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white ${liftPrimary}`}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setView('main')}
                className={`flex-1 rounded-full border border-white/10 px-4 py-2 text-xs font-medium text-ink-muted ${liftGhost}`}
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
