import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Avatar from '../app/Avatar'
import { BRAND_NAME } from '../brand'
import {
  BellIcon,
  ChevronDownIcon,
  ClockIcon,
  DownloadIcon,
  GaugeIcon,
  LayersIcon,
  LockIcon,
  LogOutIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
} from '../icons'
import { liftPrimary } from '../interactive'
import { downloadPdfReport } from '../../lib/downloadReport'
import { useAuth } from '../../lib/useAuth'
import { fetchMyNotifications, subscribeToNotificationChanges } from '../../lib/notificationsApi'
import { fetchMyScans } from '../../lib/scanHistoryApi'

const NAV_ITEMS = [
  { label: 'Overview', to: '/dashboard', icon: GaugeIcon, end: true },
  { label: 'Breaches', to: '/dashboard/breaches', icon: ShieldIcon },
  { label: 'AI insights', to: '/dashboard/insights', icon: SparkleIcon },
  { label: 'Notifications', to: '/dashboard/notifications', icon: BellIcon },
  { label: 'Scan records', to: '/dashboard/scans', icon: ClockIcon },
  { label: 'Modules', to: '/dashboard/modules', icon: LayersIcon },
  { label: 'Password check', to: '/dashboard/password-check', icon: LockIcon },
]

function DashboardShell() {
  const { email, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState(false)

  useEffect(() => {
    function refreshUnread() {
      fetchMyNotifications()
        .then((rows) => setUnread(rows.filter((n) => !n.read).length))
        .catch(() => setUnread(0))
    }
    refreshUnread()
    // Re-fetches whenever a notification is marked read anywhere (e.g. from
    // NotificationsPage), since DashboardShell itself never remounts across
    // dashboard navigation and would otherwise show a stale count for the
    // rest of the session.
    return subscribeToNotificationChanges(refreshUnread)
  }, [])
  const currentPage =
    [...NAV_ITEMS].reverse().find((item) => location.pathname.startsWith(item.to))?.label ?? 'Overview'

  async function handleSignOut() {
    // Navigate off the RequireAuth-protected route BEFORE the session
    // actually clears — otherwise the auth listener's state update lands
    // while RequireAuth is still mounted here, and it redirects to
    // /auth?redirect=... (this route, now unauthenticated) instead of
    // honoring this navigate to '/'. Signing out is still awaited, just
    // after we're already somewhere RequireAuth doesn't apply.
    navigate('/')
    await signOut()
  }

  async function handleDownload() {
    setDownloading(true)
    setDownloadError(false)
    try {
      const scans = await fetchMyScans()
      const latest = scans[0]
      if (!latest) throw new Error('No scans yet')
      await downloadPdfReport(latest.id)
    } catch {
      setDownloadError(true)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-dvh text-ink">
      <header className="flex h-14 items-center gap-3 border-b border-white/6 px-4">
        <NavLink
          to="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-ink transition-colors duration-150 hover:bg-white/5"
        >
          <ShieldIcon className="h-4 w-4" />
          <span className="hidden text-sm font-semibold tracking-tight sm:block">{BRAND_NAME}</span>
        </NavLink>

        <NavLink
          to="/dashboard/account"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-white/5"
        >
          <Avatar email={email ?? 'A'} />
          <span className="hidden max-w-32 truncate text-ink sm:block md:max-w-40">{email}</span>
          <ChevronDownIcon className="hidden h-3.5 w-3.5 text-ink-faint sm:block" />
        </NavLink>

        <span className="hidden text-sm font-medium text-ink sm:block">{currentPage}</span>

        <div className="ml-auto flex items-center gap-2">
          <NavLink
            to="/dashboard/notifications"
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
          >
            <BellIcon className="h-4 w-4" />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ink" />}
          </NavLink>
          <div className="flex items-center gap-2">
            {downloadError && (
              <span className="max-w-20 truncate text-xs text-red-400 sm:max-w-none">Couldn&apos;t generate report</span>
            )}
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className={`flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-xs font-medium text-canvas hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 ${liftPrimary}`}
            >
              <DownloadIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{downloading ? 'Preparing…' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-white/6 px-4 py-2 lg:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
                isActive ? 'bg-white/10 text-ink' : 'text-ink-muted'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="lg:flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-white/6 px-3 py-4 lg:flex">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/4 px-3 py-2 text-left text-sm text-ink-faint transition-colors duration-150 hover:border-white/20"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="flex-1">Find</span>
            <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-ink-faint">F</span>
          </button>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                    isActive ? 'bg-white/8 text-ink' : 'text-ink-muted hover:bg-white/3 hover:text-ink'
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {item.label === 'Notifications' && unread > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/10 text-[10px] font-medium text-ink">
                    {unread}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-muted transition-colors duration-150 hover:bg-white/3 hover:text-ink"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardShell
