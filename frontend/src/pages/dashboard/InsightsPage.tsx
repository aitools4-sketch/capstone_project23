import { useEffect, useRef, useState } from 'react'
import { SparkleIcon } from '../../components/icons'
import { cardHover } from '../../components/interactive'
import { ApiError } from '../../lib/apiClient'
import { fetchMyScans, fetchScanInsight, type ScanInsight } from '../../lib/scanHistoryApi'

type Status = 'loading' | 'no-scans' | 'not-configured' | 'failed' | 'ready'

function InsightsPage() {
  const [status, setStatus] = useState<Status>('loading')
  const [insight, setInsight] = useState<ScanInsight | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true

    fetchMyScans()
      .then((scans) => {
        const latest = scans[0]
        if (!latest) {
          setStatus('no-scans')
          return
        }
        return fetchScanInsight(latest.id)
          .then((result) => {
            setInsight(result)
            setStatus('ready')
          })
          .catch((err: unknown) => {
            setStatus(err instanceof ApiError && err.status === 503 ? 'not-configured' : 'failed')
          })
      })
      .catch(() => setStatus('failed'))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">AI insights</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Explainable recommendations generated from your current breach exposure.
        </p>
      </div>

      {status === 'loading' && (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Loading…
        </p>
      )}

      {status === 'no-scans' && (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Run a scan first. Insights are generated from your most recent result.
        </p>
      )}

      {status === 'not-configured' && (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          AI insights aren&apos;t configured in this environment yet.
        </p>
      )}

      {status === 'failed' && (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-ink-faint">
          Couldn&apos;t generate an insight right now. Try refreshing the page.
        </p>
      )}

      {status === 'ready' && insight && (
        <div className="flex flex-col gap-4">
          <div className={`rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
            <p className="text-sm leading-relaxed text-ink-muted">{insight.explanation}</p>
          </div>

          {insight.recommendations.map((r) => (
            <div key={r.title} className={`rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <SparkleIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{r.title}</p>
                    <p className="mt-1 max-w-lg text-sm text-ink-muted">{r.detail}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-accent">
                  {r.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InsightsPage
