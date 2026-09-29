import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LockIcon } from './icons'
import { cardHover, liftPrimary, underlineLink } from './interactive'
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

// A visible, standard browser cookie alongside the localStorage flag above —
// localStorage alone decides whether to show the banner (unchanged), this is
// purely so the site actually has a real cookie a user (or a scanner) can
// find in DevTools' Application > Cookies panel. Secure is conditional: the
// browser silently refuses to set a Secure cookie over plain http://, which
// would otherwise make this untestable on localhost dev.
function setConsentCookie() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=1; path=/; max-age=${CONSENT_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

/** A consent notice — centered over a dimmed backdrop so it reads as the
 * page's primary focus before anything else. Shows once, the first time
 * someone reaches the site — persisted via localStorage, so agreeing once
 * skips it on every later page and visit from this browser. Signed-in users
 * are also skipped outright, covering the case where localStorage is
 * unavailable/cleared but the person has already been through this. */
function ConsentBanner() {
  const { isAuthenticated, loading } = useAuth()
  const [dismissed, setDismissed] = useState(() => hasGivenConsent())
  const [termsOpened, setTermsOpened] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [scanningChecked, setScanningChecked] = useState(false)

  // While loading, we don't yet know if there's a session — wait rather
  // than flash the banner for a signed-in user before it disappears.
  if (loading || isAuthenticated || dismissed) return null

  const canContinue = termsOpened && privacyChecked && scanningChecked

  function handleContinue() {
    if (!canContinue) return
    try {
      localStorage.setItem(CONSENT_KEY, '1')
    } catch {
      // Storage unavailable — it just won't persist across visits/tabs,
      // not worth blocking the dismissal on.
    }
    setConsentCookie()
    setDismissed(true)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-label="Cookie and data consent"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-canvas p-8 text-center shadow-2xl sm:p-10">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
          <LockIcon className="h-5 w-5 text-accent" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Before you continue</h1>
        <p className="mt-3 text-sm text-ink-muted">
          We collect your email, scan results, and account/session data as described in our{' '}
          <Link to="/privacy" className={`text-ink ${underlineLink}`}>
            Privacy Policy
          </Link>
          .
        </p>

        <Link
          to="/terms"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setTermsOpened(true)}
          className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-colors duration-150 ${
            termsOpened
              ? 'border-accent/30 bg-accent/10 text-accent'
              : 'border-white/15 text-ink hover:border-white/30'
          }`}
        >
          {termsOpened ? '✓ Terms of Use opened' : 'Read our Terms of Use first →'}
        </Link>
        {!termsOpened && (
          <p className="mt-2 text-xs text-ink-faint">Open and read the Terms of Use to unlock the checkboxes below.</p>
        )}

        <fieldset disabled={!termsOpened} className="mt-4 flex flex-col gap-3 text-left disabled:opacity-40">
          <label
            className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-ink-muted ${
              termsOpened ? cardHover : ''
            }`}
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
            className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-ink-muted ${
              termsOpened ? cardHover : ''
            }`}
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
        </fieldset>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className={`w-full rounded-full bg-ink px-6 py-3.5 text-base font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto ${liftPrimary}`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsentBanner
