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

/** A first-visit consent notice — a small corner card, not a full-screen
 * backdrop, so the page underneath stays visible rather than being hidden
 * or dimmed. Anchored below the sticky header rather than to the bottom:
 * the hero's "Scan your email" CTA sits far enough down the page that a
 * top-anchored card clears it (measured, not assumed) on both mobile and
 * desktop viewports, where a bottom-anchored one — even narrowed to a
 * corner — still overlapped it. Shown once; the choice is remembered in
 * localStorage. */
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
      className="fixed inset-x-4 top-20 z-[100] sm:inset-x-auto sm:right-4 sm:w-80"
      role="dialog"
      aria-label="Cookie and data consent"
    >
      <div className="rounded-2xl border border-white/10 bg-canvas/95 p-4 shadow-2xl backdrop-blur">
        <p className="text-xs text-ink-muted">
          We collect your email, scan results, and account/session data as described in our{' '}
          <Link to="/privacy" className={`text-ink ${underlineLink}`}>
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-3 flex flex-col gap-2">
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

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className={`mt-3 w-full rounded-full bg-ink px-4 py-2 text-xs font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-40 ${liftPrimary}`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default ConsentBanner
