import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, SparkleIcon } from '../../components/icons'
import { cardHover, underlineLink } from '../../components/interactive'
import { ApiError } from '../../lib/apiClient'
import { fetchMyScans, fetchScanInsight, type ScanInsight } from '../../lib/scanHistoryApi'

type Status = 'loading' | 'no-scans' | 'not-configured' | 'failed' | 'ready'
type ScanInsightRecommendation = ScanInsight['recommendations'][number]

/** Long AI-generated text needs a clamp on mobile — otherwise a single
 * explanation or recommendation can run the card (and the page) well past
 * one screen. Clamped by default, with the full text one tap away instead
 * of just cut off. */
const CLAMP_THRESHOLD = 180

function ClampedText({ text, className = '' }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > CLAMP_THRESHOLD

  return (
    <div>
      <p className={`${className} ${expanded || !isLong ? '' : 'line-clamp-3'}`}>{text}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-accent hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

function RecommendationCard({ r }: { r: ScanInsightRecommendation }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/3 p-5 sm:p-6 ${cardHover}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
          <SparkleIcon className="h-4 w-4" />
        </span>
        {/* min-w-0 is load-bearing: without it, a flex child won't shrink
            below its content's natural width, so long text pushes the row
            past the screen instead of wrapping. */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-ink">{r.title}</p>
            <span className="max-w-full break-words rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-accent">
              {r.impact}
            </span>
          </div>
          <ClampedText text={r.detail} className="mt-1.5 text-sm text-ink-muted" />
          <Link
            to="/dashboard/modules"
            className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent ${underlineLink}`}
          >
            See related learning module
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}

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
          <div className={`rounded-2xl border border-white/8 bg-white/3 p-5 sm:p-6 ${cardHover}`}>
            <ClampedText text={insight.explanation} className="text-sm leading-relaxed text-ink-muted" />
          </div>

          {insight.recommendations.map((r) => (
            <RecommendationCard key={r.title} r={r} />
          ))}
        </div>
      )}
    </div>
  )
}

export default InsightsPage
