import { useEffect, useRef, useState } from 'react'
import { BellIcon } from '../../components/icons'
import { cardHover } from '../../components/interactive'
import { formatRelativeTime } from '../../lib/format'
import { type BreachNotification, fetchMyNotifications, markNotificationRead } from '../../lib/notificationsApi'
import { fetchMyNotificationPreferences, updateMyNotificationPreferences } from '../../lib/notificationPreferencesApi'

// A single re-scan can turn up a large batch of newly-matched breaches at
// once (e.g. the first check against a heavily-exposed email) — joining
// every name into one sentence made a notification card an unreadable
// wall of text. Named a handful, the rest summarized as a count.
const NOTIFICATION_NAMES_SHOWN = 5

function describeBreaches(names: string[]): string {
  if (names.length <= NOTIFICATION_NAMES_SHOWN) return names.join(', ')
  const shown = names.slice(0, NOTIFICATION_NAMES_SHOWN).join(', ')
  return `${shown}, and ${names.length - NOTIFICATION_NAMES_SHOWN} more`
}

function EmailAlertsToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchMyNotificationPreferences()
      .then((p) => setEnabled(p.email_alerts_enabled))
      .catch(() => setEnabled(true)) // matches the backend's own default-on fallback
  }, [])

  function handleToggle() {
    if (enabled === null) return
    const next = !enabled
    setEnabled(next)
    updateMyNotificationPreferences({ email_alerts_enabled: next }).catch(() => setEnabled(!next))
  }

  return (
    <div className={`flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 p-5 ${cardHover}`}>
      <div>
        <p className="text-sm font-medium text-ink">Email me about new breaches</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          We still re-check your monitored email and fill in this list either way — this only controls the email.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled ?? false}
        disabled={enabled === null}
        onClick={handleToggle}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${
          enabled ? 'bg-accent' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-150 ${
            enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState<BreachNotification[] | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchMyNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
  }, [])

  function handleOpen(n: BreachNotification) {
    if (n.read) return
    setNotifications((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? prev)
    markNotificationRead(n.id).catch(() => {
      setNotifications((prev) => prev?.map((x) => (x.id === n.id ? { ...x, read: false } : x)) ?? prev)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink-muted">Alerts about new breaches found for your monitored email.</p>
      </div>

      <EmailAlertsToggle />

      {!notifications ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Loading…
        </p>
      ) : notifications.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Nothing yet. We re-check your monitored email periodically and this fills in the moment a new breach
          turns up.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleOpen(n)}
              className={`flex items-start gap-3 rounded-2xl border p-5 text-left ${cardHover} ${
                n.read ? 'border-white/6 bg-white/2' : 'border-white/8 bg-white/3'
              }`}
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <BellIcon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-ink">
                    {n.breach_names.length === 1 ? 'New breach found' : `${n.breach_names.length} new breaches found`}
                  </p>
                  <span className="shrink-0 text-xs text-ink-faint">{formatRelativeTime(n.created_at)}</span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {describeBreaches(n.breach_names)} now match{n.breach_names.length === 1 ? 'es' : ''} your monitored
                  email.
                </p>
              </div>
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage
