import { Link } from 'react-router-dom'
import { liftPrimary } from './interactive'

/** Blocks the sign-in form for anyone who lands on it without having scanned
 * an email this session — same centered-card-over-dimmed-backdrop treatment
 * as ConsentBanner. See AuthPage.tsx for the session check that decides
 * whether this renders.
 *
 * z-[110]: ConsentBanner (z-[100]) is mounted app-wide and can also be
 * showing on this same route for a first-time visitor who lands directly on
 * /auth — both are full-viewport overlays, so this needs to win the stack
 * explicitly rather than by incidental DOM order. */
function ScanGateModal() {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-label="Scan required before sign-in"
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-canvas p-8 text-center shadow-2xl sm:p-10">
        <p className="text-base text-ink-muted">You need to scan your email address first before you sign in.</p>

        <div className="mt-8 flex justify-center">
          <Link
            to="/scan"
            className={`w-full rounded-full bg-ink px-6 py-3.5 text-base font-medium text-canvas sm:w-auto ${liftPrimary}`}
          >
            Scan first
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ScanGateModal
