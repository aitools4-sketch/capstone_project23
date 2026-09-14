const SCAN_COMPLETED_KEY = 'breached:scanCompleted'

/** Marks that a scan finished (live or sample) in this tab's session — used
 * to gate the sign-in page behind the scan flow. sessionStorage rather than
 * localStorage: it should reset for a new visit, not persist indefinitely. */
export function markScanCompleted() {
  try {
    sessionStorage.setItem(SCAN_COMPLETED_KEY, '1')
  } catch {
    // Storage unavailable (e.g. private browsing) — the read side below
    // defaults to false, so the gate simply shows, which is the safe side
    // to fail on.
  }
}

export function hasScannedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SCAN_COMPLETED_KEY) === '1'
  } catch {
    return false
  }
}
