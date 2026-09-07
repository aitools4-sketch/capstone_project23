import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ClockIcon, CheckIcon, TrashIcon } from '../../components/icons'
import { cardHover, liftPrimary, rowHover } from '../../components/interactive'
import { ApiError } from '../../lib/apiClient'
import {
  addMonitoredEmail,
  fetchMyMonitoredEmails,
  removeMonitoredEmail,
  type MonitoredEmail,
} from '../../lib/monitoredEmailsApi'

const MAX_MONITORED_EMAILS = 5

function MonitoredEmailsPage() {
  const [emails, setEmails] = useState<MonitoredEmail[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [justAddedId, setJustAddedId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchMyMonitoredEmails()
      .then(setEmails)
      .catch(() => setLoadError(true))
  }, [])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    try {
      const created = await addMonitoredEmail(newEmail.trim())
      setEmails((prev) => (prev ? [...prev, created] : [created]))
      setJustAddedId(created.id)
      setNewEmail('')
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.detail ?? err.message : "Couldn't add that email right now.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id)
    const prev = emails
    setEmails((current) => current?.filter((e) => e.id !== id) ?? current)
    try {
      await removeMonitoredEmail(id)
    } catch {
      setEmails(prev) // couldn't remove it server-side — put it back
    } finally {
      setRemovingId(null)
    }
  }

  const atLimit = (emails?.length ?? 0) >= MAX_MONITORED_EMAILS

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Monitored emails</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Every email being watched for new breaches, alongside your account&apos;s own.
        </p>
      </div>

      {loadError ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Couldn&apos;t load your monitored emails right now. Try refreshing the page.
        </p>
      ) : !emails ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Loading…
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {emails.map((m) => (
            <div
              key={m.id}
              className={`flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 p-5 ${cardHover}`}
            >
              <div className="flex items-center gap-3">
                {m.verified_at ? (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <CheckIcon className="h-4 w-4" />
                  </span>
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/6 text-ink-muted">
                    <ClockIcon className="h-4 w-4" />
                  </span>
                )}
                <div>
                  <p className="text-sm font-medium text-ink">{m.email}</p>
                  <p className="text-xs text-ink-faint">
                    {m.verified_at
                      ? 'Monitored'
                      : justAddedId === m.id
                        ? 'Check that inbox for a confirmation link'
                        : 'Pending confirmation'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(m.id)}
                disabled={removingId === m.id}
                aria-label={`Stop monitoring ${m.email}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-ink-faint disabled:cursor-not-allowed disabled:opacity-60 ${rowHover} hover:text-ink`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {emails && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-white/8 bg-white/3 p-5">
          <label htmlFor="new-monitored-email" className="text-sm font-medium text-ink">
            Add another email
          </label>
          <p className="mt-1 text-xs text-ink-muted">
            We&apos;ll send a confirmation link — it only starts monitoring once that&apos;s clicked.
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              id="new-monitored-email"
              type="email"
              required
              disabled={atLimit || submitting}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-xl border border-white/10 bg-white/4 px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint transition-colors duration-300 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={atLimit || submitting || !newEmail.trim()}
              className={`rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${liftPrimary}`}
            >
              {submitting ? 'Sending…' : 'Send confirmation'}
            </button>
          </div>
          {atLimit && (
            <p className="mt-2 text-xs text-ink-faint">
              You&apos;re monitoring the maximum of {MAX_MONITORED_EMAILS} emails.
            </p>
          )}
          {submitError && <p className="mt-2 text-xs text-red-400">{submitError}</p>}
        </form>
      )}
    </div>
  )
}

export default MonitoredEmailsPage
