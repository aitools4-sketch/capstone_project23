import { useEffect, useRef, useState } from 'react'
import SeverityBadge from '../../components/app/SeverityBadge'
import { rowHover } from '../../components/interactive'
import { fetchMyScans, type MyScan } from '../../lib/scanHistoryApi'
import type { ScanBreach } from '../../lib/scanApi'

function BreachTable({ rows, emptyLabel }: { rows: ScanBreach[]; emptyLabel: string }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
        {emptyLabel}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/8">
      <table className="w-full min-w-175 text-left text-sm">
        <thead className="bg-white/3 text-xs uppercase tracking-wide text-ink-faint">
          <tr>
            <th className="px-6 py-3 font-medium">Source</th>
            <th className="px-6 py-3 font-medium">Date</th>
            <th className="px-6 py-3 font-medium">Exposed data</th>
            <th className="px-6 py-3 font-medium">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/6">
          {rows.map((b) => (
            <tr key={`${b.source}-${b.breach_name}`} className={rowHover}>
              <td className="px-6 py-4 font-medium text-ink">{b.breach_name}</td>
              <td className="px-6 py-4 text-ink-muted">{b.breach_date ?? 'Unknown'}</td>
              <td className="px-6 py-4 text-ink-muted">{b.exposed_fields.join(', ')}</td>
              <td className="px-6 py-4">
                <SeverityBadge severity={b.severity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BreachesPage() {
  const [scans, setScans] = useState<MyScan[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchMyScans()
      .then(setScans)
      .catch(() => setLoadError(true))
  }, [])

  const breaches = scans?.[0]?.breaches ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Breaches</h1>
        <p className="mt-1 text-sm text-ink-muted">Everywhere your monitored email has turned up.</p>
      </div>

      {loadError ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Couldn&apos;t load your scan results right now. Try refreshing the page.
        </p>
      ) : !scans ? (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Loading…
        </p>
      ) : (
        <BreachTable rows={breaches} emptyLabel="No breaches found in your most recent scan." />
      )}
    </div>
  )
}

export default BreachesPage
