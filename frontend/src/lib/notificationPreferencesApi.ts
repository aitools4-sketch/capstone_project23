import { apiGetAuthed, apiPutAuthed } from './apiClient'

export type NotificationPreferences = {
  email_alerts_enabled: boolean
}

export function fetchMyNotificationPreferences(): Promise<NotificationPreferences> {
  return apiGetAuthed<NotificationPreferences>('/api/notification-preferences/me')
}

export function updateMyNotificationPreferences(
  prefs: NotificationPreferences,
): Promise<NotificationPreferences> {
  return apiPutAuthed<NotificationPreferences>('/api/notification-preferences/me', prefs)
}
