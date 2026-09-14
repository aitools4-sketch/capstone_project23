import { useState, type FormEvent } from 'react'
import { QuoteIcon } from '../icons'
import { liftGhost, liftPrimary } from '../interactive'
import { submitFeedback } from '../../lib/feedbackApi'

/** Floating feedback trigger, mounted once in DashboardShell so it's
 * available from every dashboard page without being part of any one of
 * them. Opens a small modal reusing the same 1-5 rating pattern as the
 * (separate, scan-specific) feedback prompt on the results page. */
function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)

  function handleClose() {
    setOpen(false)
    setRating(null)
    setComment('')
    setSubmitted(false)
    setError(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!rating || submitting) return
    setSubmitting(true)
    setError(false)
    try {
      await submitFeedback(rating, comment)
      setSubmitted(true)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Give feedback"
        className={`fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-ink text-canvas shadow-2xl hover:bg-white ${liftPrimary}`}
      >
        <QuoteIcon className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-label="Give feedback"
        >
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-canvas p-8 text-center shadow-2xl sm:p-10">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
              <QuoteIcon className="h-5 w-5 text-accent" />
            </div>

            {submitted ? (
              <>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Thanks for the feedback</h1>
                <p className="mt-3 text-sm text-ink-muted">It goes straight to the team building this.</p>
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={handleClose}
                    className={`rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">How&apos;s it going?</h1>
                <p className="mt-3 text-sm text-ink-muted">
                  Rate your experience so far, and tell us anything we should know.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 text-left">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        aria-label={`Rate ${n} out of 5`}
                        aria-pressed={rating === n}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-150 ${
                          rating !== null && n <= rating
                            ? 'border-accent bg-accent text-accent-ink'
                            : 'border-white/15 text-ink-muted hover:border-white/30'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Anything we should know? Optional."
                    rows={3}
                    className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors duration-300 focus:border-accent focus:outline-none"
                  />

                  {error && <p className="mt-3 text-xs text-red-400">Couldn&apos;t send that. Try again.</p>}

                  <div className="mt-6 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className={`rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-ink-muted ${liftGhost}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!rating || submitting}
                      className={`rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 ${liftPrimary}`}
                    >
                      {submitting ? 'Sending…' : 'Send feedback'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default FeedbackWidget
