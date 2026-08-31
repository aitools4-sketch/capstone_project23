import { useEffect, useRef, useState } from 'react'
import { DownloadIcon } from '../../components/icons'
import { liftGhost, rowHover } from '../../components/interactive'
import { downloadPdfReport } from '../../lib/downloadReport'
import { fetchMyScans, type MyScan } from '../../lib/scanHistoryApi'

function ScanRecordsPage() {
  const [scans, setScans] = useState<MyScan[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [errorId, setErrorId] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchMyScans()
      .then(setScans)
      .catch(() => setLoadError(true))
  }, [])

  async function handleDownload(scan: MyScan) {
    setDownloadingId(scan.id)
    setErrorId(null)
    try {
      await downloadPdfReport(scan.id)
    } catch {
      setErrorId(scan.id)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Scan records</h1>
        <p className="mt-1 text-sm text-ink-muted">Your scan history, with a PDF export for each run.</p>
      </div>

      {loadError ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Couldn&apos;t load your scan history right now. Try refreshing the page.
        </p>
      ) : !scans ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Loading…
        </p>
      ) : scans.length === 0 ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          No scans yet. Run one from the scan page and it'll show up here once you're signed in.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-150 text-left text-sm">
            <thead className="bg-white/3 text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="px-6 py-3 font-medium">Scan</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Breaches found</th>
                <th className="px-6 py-3 font-medium">Risk score</th>
                <th className="px-6 py-3 font-medium">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {scans.map((s) => (
                <tr key={s.id} className={rowHover}>
                  <td className="px-6 py-4 font-medium text-ink">#{s.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-ink-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-ink-muted">{s.breaches.length}</td>
                  <td className="px-6 py-4 text-ink-muted">{s.risk_score}/100</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => handleDownload(s)}
                      disabled={downloadingId === s.id}
                      className={`flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-60 ${liftGhost}`}
                    >
                      <DownloadIcon className="h-3.5 w-3.5" />
                      {downloadingId === s.id ? 'Preparing…' : errorId === s.id ? 'Failed, retry' : 'PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ScanRecordsPage
