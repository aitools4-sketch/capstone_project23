import { apiPostForBlobAuthed } from './apiClient'

/** Downloads the PDF report for a scan the signed-in user owns. The
 * request body is just the scan_id — the server re-fetches everything
 * else from the database itself, so a downloaded report can never contain
 * numbers the server didn't compute (see breached-architecture blueprint
 * §6's recommended contract change, now implemented). */
export async function downloadPdfReport(scanId: string, filename = 'identity-risk-report.pdf'): Promise<void> {
  const blob = await apiPostForBlobAuthed('/api/reports/pdf', { scan_id: scanId })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
