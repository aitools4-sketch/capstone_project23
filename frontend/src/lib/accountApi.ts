import { apiDeleteAuthed, apiGetAuthed } from './apiClient'

/** Downloads everything the account holds (scans, insights, notify
 * subscriptions) as a single JSON file the user can keep or hand to
 * someone else. Privacy Policy §7's portability right. */
export async function exportAccountData(): Promise<void> {
  const data = await apiGetAuthed<unknown>('/api/account/export')
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'breached-account-data.json'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** Deletes the Supabase Auth user server-side. Every row that references
 * this account (scans, insights, notify subscriptions) cascades away with
 * it — nothing left to clean up client-side beyond signing out. */
export async function deleteAccount(): Promise<void> {
  await apiDeleteAuthed('/api/account')
}
