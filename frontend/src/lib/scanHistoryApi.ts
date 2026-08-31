import { apiGetAuthed } from './apiClient'
import type { ScanBreach } from './scanApi'

export type MyScan = {
  id: string
  email: string
  breaches: ScanBreach[]
  risk_score: number
  created_at: string
}

export type ScanInsight = {
  explanation: string
  recommendations: { title: string; detail: string; impact: string }[]
}

// Every dashboard page (Home, Breaches, Insights, Modules, Scan records)
// independently fetches the same scan list on mount, and React Router
// unmounts/remounts each one on navigation — without this, clicking
// between them re-hits the network for identical data every single time.
// Short enough that a fresh scan still shows up quickly on the next
// natural re-fetch, long enough to smooth over normal page-to-page
// navigation within the dashboard.
const _CACHE_TTL_MS = 15_000
let _cache: { data: MyScan[]; fetchedAt: number } | null = null
let _inFlight: Promise<MyScan[]> | null = null

/** Called by authProvider.tsx on every sign-in/sign-out. The cache has no
 * concept of "whose" data it's holding, so the only safe thing to do when
 * the session identity changes is drop it — otherwise a second user
 * signing in on the same tab within the TTL window would see the first
 * user's breach data. */
export function clearScanCache() {
  _cache = null
  _inFlight = null
}

/** The signed-in user's scan history, most recent first. Requires a real
 * Supabase session — apiGetAuthed attaches it automatically. */
export function fetchMyScans(): Promise<MyScan[]> {
  if (_cache && Date.now() - _cache.fetchedAt < _CACHE_TTL_MS) {
    return Promise.resolve(_cache.data)
  }
  // Two pages mounting in the same tick (e.g. DashboardShell + a child
  // page) shouldn't fire two requests for the same thing.
  if (_inFlight) return _inFlight

  _inFlight = apiGetAuthed<MyScan[]>('/api/scans/me')
    .then((data) => {
      _cache = { data, fetchedAt: Date.now() }
      return data
    })
    .finally(() => {
      _inFlight = null
    })
  return _inFlight
}

/** Generate-or-fetch-cached. The first call for a given scan pays the AI
 * generation cost server-side; every call after that is a cached read. */
export function fetchScanInsight(scanId: string): Promise<ScanInsight> {
  return apiGetAuthed<ScanInsight>(`/api/scans/${encodeURIComponent(scanId)}/insights`)
}
