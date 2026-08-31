import { apiGetAuthed, apiPostAuthed } from './apiClient'

export type BreachNotification = {
  id: string
  scan_id: string
  breach_names: string[]
  read: boolean
  created_at: string
}

type Listener = () => void
const _listeners = new Set<Listener>()

/** DashboardShell's header/sidebar unread badge subscribes here so it stays
 * in sync when a notification is marked read from NotificationsPage —
 * without this, the badge only ever reflected whatever was unread at the
 * moment DashboardShell first mounted, since it never remounts across
 * dashboard navigation. */
export function subscribeToNotificationChanges(listener: Listener): () => void {
  _listeners.add(listener)
  return () => _listeners.delete(listener)
}

function notifyChanged() {
  _listeners.forEach((listener) => listener())
}

/** Written by the backend's periodic re-scan worker (see
 * backend/app/services/notifier.py) whenever a monitored email turns up
 * in a breach that wasn't there on the previous scan. Never client-written. */
export function fetchMyNotifications(): Promise<BreachNotification[]> {
  return apiGetAuthed<BreachNotification[]>('/api/notifications/me')
}

export async function markNotificationRead(id: string): Promise<{ status: string }> {
  const result = await apiPostAuthed<{ status: string }>(`/api/notifications/${encodeURIComponent(id)}/read`, {})
  notifyChanged()
  return result
}
