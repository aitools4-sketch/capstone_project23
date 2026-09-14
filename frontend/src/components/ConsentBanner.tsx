import { useState } from 'react'
import { Link } from 'react-router-dom'
import { liftPrimary, underlineLink } from './interactive'

const CONSENT_STORAGE_KEY = 'breached-consent-given'

/** Whether the banner should render at all, decided once at module load
 * (not per-render) — a visitor who already consented shouldn't see a
 * flash of the banner before this check runs. Defaults to "show it" if
 * localStorage throws (private browsing, storage disabled, etc.): when
 * we can't tell whether consent was already given, asking again is the
 * safe default, not skipping it. */
function hasAlreadyConsented(): boolean {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

function saveConsent(): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'true')
  } catch {
    // Nothing we can do if storage is unavailable — worst case the
    // banner shows again next visit, which is safe, just repetitive.
  }
}

/** A first-visit consent notice — centered over a dimmed backdrop so it
 * reads as the page's primary focus before anything else. Shown once;
 * the choice is remembered in localStorage. */
function ConsentBanner() {
  const [dismissed, setDismissed] = useState(hasAlreadyConsented())
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [scanningChecked, setScanningChecked] = useState(false)

  if (dismissed) return null

  const canContinue = privacyChecked && scanningChecked

  function handleContinue() {
    if (!canContinue) return
    saveConsent()
    setDismissed(true)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-label="Cookie and data consent"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-canvas p-8 shadow-2xl sm:p-10">
        <p className="text-base text-ink-muted">
          We collect your email, scan results, and account/session data as described in our{' '}
          <Link to="/privacy" className={`text-ink ${underlineLink}`}>
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex items-start gap-3 text-base text-ink-muted">
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-accent"
            />
            I agree to the Privacy Policy and understand how my data is collected and used.
          </label>

          <label className="flex items-start gap-3 text-base text-ink-muted">
            <input
              type="checkbox"
              checked={scanningChecked}
              onChange={(e) => setScanningChecked(e.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-accent"
            />
            I agree to have my email checked against third-party breach databases (HIBP, DeHashed) to generate my
            risk score.
          </label>
        </div>

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
