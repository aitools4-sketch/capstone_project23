import { apiDeleteAuthed, apiGetAuthed, apiPost, apiPostAuthed } from './apiClient'

export type MonitoredEmail = {
  id: string
  email: string
  verified_at: string | null
  created_at: string
}

export function fetchMyMonitoredEmails(): Promise<MonitoredEmail[]> {
  return apiGetAuthed<MonitoredEmail[]>('/api/monitored-emails/me')
}

export function addMonitoredEmail(email: string): Promise<MonitoredEmail> {
  return apiPostAuthed<MonitoredEmail>('/api/monitored-emails/me', { email })
}

export function removeMonitoredEmail(id: string): Promise<{ status: string }> {
  return apiDeleteAuthed<{ status: string }>(`/api/monitored-emails/${encodeURIComponent(id)}`)
}

/** No session needed or expected — the token in the confirmation link is
 * itself the proof of ownership, same trust model as the magic-link `code`
 * param AuthCallbackPage.tsx exchanges. */
export function verifyMonitoredEmail(token: string): Promise<{ status: string }> {
  return apiPost<{ status: string }>('/api/monitored-emails/verify', { token })
}
