import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import RiskGauge from '../../components/app/RiskGauge'
import SeverityBadge from '../../components/app/SeverityBadge'
import { SparkleIcon } from '../../components/icons'
import { cardHover, rowHover, underlineLink } from '../../components/interactive'
import { useAuth } from '../../lib/useAuth'
import { fetchMyScans, type MyScan } from '../../lib/scanHistoryApi'
import { fetchMyNotifications, type BreachNotification } from '../../lib/notificationsApi'

function SectionHeader({ title, action, to }: { title: string; action?: string; to?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-medium text-ink">{title}</h2>
      {action && to && (
        <Link to={to} className={`text-xs font-medium text-ink-muted ${underlineLink} hover:text-ink`}>
          {action}
        </Link>
      )}
    </div>
  )
}

function DashboardHome() {
  const { email } = useAuth()
  const [scans, setScans] = useState<MyScan[] | null>(null)
  const [scansError, setScansError] = useState(false)
  const [notifications, setNotifications] = useState<BreachNotification[] | null>(null)
  const [notificationsError, setNotificationsError] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchMyScans()
      .then(setScans)
      .catch(() => setScansError(true))
    fetchMyNotifications()
      .then(setNotifications)
      .catch(() => setNotificationsError(true))
  }, [])

  const latest = scans?.[0]
  const breaches = latest?.breaches ?? []
  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-muted">{email}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SectionHeader title="Risk score" />
          <div className={`mt-3 flex flex-col items-center justify-center rounded-xl border border-white/8 bg-white/3 p-8 ${cardHover}`}>
            {scansError ? (
              <p className="text-sm text-ink-faint">Couldn&apos;t load your risk score.</p>
            ) : !scans ? (
              <p className="text-sm text-ink-faint">Loading…</p>
            ) : latest ? (
              <RiskGauge score={latest.risk_score} />
            ) : (
              <p className="text-center text-sm text-ink-faint">Run a scan to see your risk score.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <SectionHeader title="Breaches" action="View all" to="/dashboard/breaches" />
          <div className={`mt-3 rounded-xl border border-white/8 bg-white/3 p-2 ${cardHover}`}>
            {scansError ? (
              <p className="px-4 py-6 text-sm text-ink-faint">Couldn&apos;t load your breaches right now.</p>
            ) : !scans ? (
              <p className="px-4 py-6 text-sm text-ink-faint">Loading…</p>
            ) : breaches.length === 0 ? (
              <p className="px-4 py-6 text-sm text-ink-faint">
                No breaches found in your most recent scan.
              </p>
            ) : (
              breaches.map((b) => (
                <div key={`${b.source}-${b.breach_name}`} className={`flex items-center justify-between rounded-lg px-4 py-3 ${rowHover}`}>
                  <div>
                    <p className="text-sm font-medium text-ink">{b.breach_name}</p>
                    <p className="text-xs text-ink-faint">{b.breach_date ?? 'Date unknown'}</p>
                  </div>
                  <SeverityBadge severity={b.severity} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <SectionHeader title="AI insight" action="See all" to="/dashboard/insights" />
          <div className={`mt-3 flex items-start gap-3 rounded-xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
            <SparkleIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
            <p className="text-sm text-ink-faint">
              See the AI-generated, plain-language breakdown of your latest scan on the full insights
              page.
            </p>
          </div>
        </div>

        <div>
          <SectionHeader title="Notifications" action="View all" to="/dashboard/notifications" />
          <div className={`mt-3 rounded-xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
            {notificationsError ? (
              <p className="text-sm text-ink-faint">Couldn&apos;t load notifications right now.</p>
            ) : !notifications ? (
              <p className="text-sm text-ink-faint">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-ink-faint">
                Nothing yet. We re-check your monitored email periodically and this fills in the moment a new
                breach turns up.
              </p>
            ) : unreadCount > 0 ? (
              <p className="text-sm text-ink-faint">
                {unreadCount} unread {unreadCount === 1 ? 'alert' : 'alerts'} about new breaches.
              </p>
            ) : (
              <p className="text-sm text-ink-faint">You&apos;re all caught up. No new breach alerts.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
