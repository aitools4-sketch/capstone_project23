import { useRef, useState, type UIEvent } from 'react'
import { LockIcon } from './icons'
import { cardHover, liftPrimary } from './interactive'
import { useAuth } from '../lib/useAuth'
import { TERMS_ACKNOWLEDGMENT, TERMS_IMPORTANT_NOTICE, TERMS_LAST_UPDATED, TERMS_SECTIONS } from '../lib/termsContent'
import { PRIVACY_INTRO, PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from '../lib/privacyContent'

const CONSENT_KEY = 'breached:consentGiven'
const CONSENT_COOKIE = 'breached_consent'
const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year, in seconds

// How close to the true bottom counts as "reached the bottom" — a couple of
// px of slack for sub-pixel scroll rounding, which differs by browser/zoom.
const SCROLL_BOTTOM_THRESHOLD = 4

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

function isScrolledToBottom(el: HTMLElement): boolean {
  return el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_BOTTOM_THRESHOLD
}

const DOC_PANEL_CLASS =
  'mt-4 max-h-[55vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/3 p-6 text-left text-sm leading-relaxed text-ink-muted sm:p-8 [&_a]:text-ink [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_p+p]:mt-2.5 [&_strong]:text-ink [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2'

function DocToggleButton({ read, shown, label, onClick }: { read: boolean; shown: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors duration-150 ${
        read
          ? 'border-white/15 bg-white/5 text-ink-muted'
          : 'border-accent bg-accent/15 text-accent hover:bg-accent/25'
      }`}
    >
      {shown ? `Hide ${label}` : read ? `✓ ${label} read — view again` : `Read our ${label} →`}
    </button>
  )
}

/** A consent notice — centered over a dimmed backdrop so it reads as the
 * page's primary focus before anything else. Shows once, the first time
 * someone reaches the site — persisted via localStorage, so agreeing once
 * skips it on every later page and visit from this browser. Signed-in users
 * are also skipped outright, covering the case where localStorage is
 * unavailable/cleared but the person has already been through this.
 *
 * Each checkbox is gated behind actually scrolling the matching document
 * (Terms of Use, Privacy Policy — both the same shared content the
 * standalone pages render) to its end inside this popup, not just opening
 * it. */
function ConsentBanner() {
  const { isAuthenticated, loading } = useAuth()
  const [dismissed, setDismissed] = useState(() => hasGivenConsent())

  const [showTerms, setShowTerms] = useState(false)
  const [termsRead, setTermsRead] = useState(false)
  const termsScrollRef = useRef<HTMLDivElement>(null)

  const [showPrivacy, setShowPrivacy] = useState(false)
  const [privacyRead, setPrivacyRead] = useState(false)
  const privacyScrollRef = useRef<HTMLDivElement>(null)

  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [scanningChecked, setScanningChecked] = useState(false)

  // While loading, we don't yet know if there's a session — wait rather
  // than flash the banner for a signed-in user before it disappears.
  if (loading || isAuthenticated || dismissed) return null

  const canContinue = termsRead && privacyRead && privacyChecked && scanningChecked

  // If a panel's short enough to show everything at once (a very tall
  // viewport), there's nothing to scroll past — don't leave someone stuck
  // on a scroll gesture that can't happen. Checked after the panel actually
  // paints, in an event handler (not during render, where refs aren't safe
  // to read).
  function handleToggleTerms() {
    setShowTerms((wasShown) => {
      const nowShown = !wasShown
      if (nowShown) {
        requestAnimationFrame(() => {
          const el = termsScrollRef.current
          if (el && isScrolledToBottom(el)) setTermsRead(true)
        })
      }
      return nowShown
    })
  }

  function handleTogglePrivacy() {
    setShowPrivacy((wasShown) => {
      const nowShown = !wasShown
      if (nowShown) {
        requestAnimationFrame(() => {
          const el = privacyScrollRef.current
          if (el && isScrolledToBottom(el)) setPrivacyRead(true)
        })
      }
      return nowShown
    })
  }

  function handleTermsScroll(e: UIEvent<HTMLDivElement>) {
    if (isScrolledToBottom(e.currentTarget)) setTermsRead(true)
  }

  function handlePrivacyScroll(e: UIEvent<HTMLDivElement>) {
    if (isScrolledToBottom(e.currentTarget)) setPrivacyRead(true)
  }

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
      <div
        className={`w-full rounded-3xl border border-white/10 bg-canvas p-8 text-center shadow-2xl transition-[max-width] duration-300 sm:p-10 ${
          showTerms || showPrivacy ? 'max-h-[90vh] max-w-2xl overflow-y-auto' : 'max-w-md'
        }`}
      >
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
          <LockIcon className="h-5 w-5 text-accent" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Before you continue</h1>
        <p className="mt-3 text-sm text-ink-muted">
          We collect your email, scan results, and account/session data as described in our Privacy Policy.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <DocToggleButton read={termsRead} shown={showTerms} label="Terms and Conditions" onClick={handleToggleTerms} />
          <DocToggleButton read={privacyRead} shown={showPrivacy} label="Privacy Policy" onClick={handleTogglePrivacy} />
        </div>

        {showTerms && (
          <div ref={termsScrollRef} onScroll={handleTermsScroll} className={DOC_PANEL_CLASS}>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-faint">Legal Agreement</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
                End User License Agreement &amp; Terms of Service
              </p>
              <p className="mt-1 text-xs text-ink-faint">Last updated {TERMS_LAST_UPDATED}</p>
            </div>

            <p className="mt-6 border-t border-white/8 pt-6">{TERMS_IMPORTANT_NOTICE}</p>

            {TERMS_SECTIONS.map((section) => (
              <div key={section.title} className="mt-6 border-t border-white/8 pt-6">
                <p className="text-base font-semibold text-ink">{section.title}</p>
                <div className="mt-2 flex flex-col gap-2.5">{section.body}</div>
              </div>
            ))}

            <p className="mt-6 border-t border-white/8 pt-6">{TERMS_ACKNOWLEDGMENT}</p>
          </div>
        )}

        {showPrivacy && (
          <div ref={privacyScrollRef} onScroll={handlePrivacyScroll} className={DOC_PANEL_CLASS}>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-faint">Legal Agreement</p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-ink">Privacy Policy</p>
              <p className="mt-1 text-xs text-ink-faint">Last updated {PRIVACY_LAST_UPDATED}</p>
            </div>

            <p className="mt-6 border-t border-white/8 pt-6">{PRIVACY_INTRO}</p>

            {PRIVACY_SECTIONS.map((section) => (
              <div key={section.title} className="mt-6 border-t border-white/8 pt-6">
                <p className="text-base font-semibold text-ink">{section.title}</p>
                <div className="mt-2 flex flex-col gap-2.5">{section.body}</div>
              </div>
            ))}
          </div>
        )}

        {(!termsRead || !privacyRead) && (
          <p className="mt-2 text-xs text-ink-faint">
            Read both documents in full (scroll each to the end) to unlock the checkboxes below.
          </p>
        )}

        <fieldset className="mt-4 flex flex-col gap-3 text-left">
          <label
            className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-ink-muted ${
              privacyRead ? cardHover : 'opacity-40'
            }`}
          >
            <input
              type="checkbox"
              disabled={!privacyRead}
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent disabled:cursor-not-allowed"
            />
            I agree to the Privacy Policy and understand how my data is collected and used.
          </label>

          <label
            className={`flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-ink-muted ${
              termsRead ? cardHover : 'opacity-40'
            }`}
          >
            <input
              type="checkbox"
              disabled={!termsRead}
              checked={scanningChecked}
              onChange={(e) => setScanningChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-accent disabled:cursor-not-allowed"
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
