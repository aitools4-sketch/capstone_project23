import { apiPostAuthed } from './apiClient'

export type ScanBreach = {
  source: string
  breach_name: string
  breach_date: string | null
  exposed_fields: string[]
  severity: 'low' | 'medium' | 'high'
}

export type ScanRisk = {
  total: number
  sensitivity: number
  recency: number
  frequency: number
  severity: number
  classification: string
}

export type ScanResult = {
  id: string
  email: string
  breaches: ScanBreach[]
  /** The true number of breaches found — may exceed breaches.length for a
   * guest (not signed in) response, which the server caps to a preview. */
  total_breach_count: number
  risk: ScanRisk
}

/** The only place that calls POST /api/scans. Sends the email only — the
 * server runs the live DeHashed/HIBP lookup and computes the risk score;
 * nothing about the result originates on this side. Uses the authed
 * variant so a signed-in caller's scan is linked to their account instead
 * of recording as an unclaimed guest row — the endpoint stays reachable
 * without a session too, since authHeader() omits the header when there
 * isn't one. */
export function runScan(email: string): Promise<ScanResult> {
  return apiPostAuthed<ScanResult>('/api/scans', { email })
}
