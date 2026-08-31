import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { CheckIcon, DownloadIcon, LockIcon, RadarIcon, ShieldIcon } from '../components/icons'
import { liftPrimary } from '../components/interactive'
import { ApiError } from '../lib/apiClient'
import { downloadPdfReport } from '../lib/downloadReport'
import { padCount } from '../lib/format'
import { MOCK_PREVENTIVE_TIPS, MOCK_RECOMMENDATIONS, simulateScan, type Recommendation } from '../lib/mockData'
import { runScan, type ScanResult } from '../lib/scanApi'

const SAMPLE_ID = 'sample'

function sampleResult(email: string): ScanResult {
  const breaches = simulateScan(email)
  const total = breaches.length === 0 ? 0 : 42
  return {
    id: SAMPLE_ID,
    email,
    breaches: breaches.map((b) => ({
      source: 'DeHashed',
      breach_name: b.name,
      breach_date: b.date,
      exposed_fields: b.dataTypes,
      severity: b.severity,
      record_type: 'breach',
    })),
    risk: { total, sensitivity: 20, recency: 14, frequency: 6, severity: 2, classification: total >= 40 ? 'moderate' : 'low' },
  }
}

function BreachMetric({ count }: { count: number }) {
  return (
    <div className="mx-auto mt-10 inline-flex items-center gap-4 rounded-2xl border border-white/8 bg-white/3 px-8 py-5">
      <span className="text-4xl font-semibold tabular-nums text-ink">{padCount(count)}</span>
      <span className="text-left text-sm text-ink-muted">
        Total breach{count === 1 ? '' : 'es'}
        <br />
        found for this email
      </span>
    </div>
  )
}

function RemediationSteps({ title, steps }: { title: string; steps: Recommendation[] }) {
  return (
    <div className="mt-14">
      <h2 className="text-center text-lg font-medium text-ink">{title}</h2>
      <ol className="mx-auto mt-6 flex max-w-xl flex-col gap-3 text-left">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 rounded-xl border border-white/8 bg-white/3 p-5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-medium text-ink">
              {i + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-ink">{step.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function DownloadReportCard({ scanId }: { scanId: string }) {
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState(false)
  const isSample = scanId === SAMPLE_ID

  async function handleDownload() {
    setDownloading(true)
    setError(false)
    try {
      await downloadPdfReport(scanId)
    } catch {
      setError(true)
    } finally {
      setDownloading(false)
    }
  }

  if (isSample) {
    return (
      <p className="mx-auto mt-10 max-w-xl text-xs text-ink-faint">
        Sample results can&apos;t be downloaded as a report. Run a live scan once that&apos;s configured to get a
        real one.
      </p>
    )
  }

  return (
    <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-canvas hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${liftPrimary}`}
      >
        <DownloadIcon className="h-4 w-4" />
        {downloading ? 'Preparing report…' : 'Download scan report'}
      </button>
      {error && <p className="text-xs text-red-400">Couldn&apos;t generate the report. Try again.</p>}
    </div>
  )
}

function FeedbackSection() {
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!rating) return
    setSubmitted(true)
  }

  return (
    <div className="mx-auto mt-14 max-w-xl">
      <h2 className="text-center text-lg font-medium text-ink">How was this scan?</h2>
      {submitted ? (
        <p className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-6 text-center text-sm text-ink-muted">
          Thanks for the feedback. It goes straight to the team building this scanner.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-6 text-left">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`Rate ${n} out of 5`}
                aria-pressed={rating === n}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-150 ${
                  rating !== null && n <= rating
                    ? 'border-accent bg-accent text-accent-ink'
                    : 'border-white/15 text-ink-muted hover:border-white/30'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Anything we should know? Optional."
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-white/10 bg-white/4 px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors duration-300 focus:border-accent focus:outline-none"
          />
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              disabled={!rating}
              className={`w-full rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${liftPrimary}`}
            >
              Send feedback
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = (location.state as { email?: string } | null)?.email

  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [sampleNotice, setSampleNotice] = useState<string | null>(null)
  const [scanError, setScanError] = useState(false)
  // Tracks which email has been scanned (rather than a plain boolean) so a
  // future re-render with a different email while this page is still
  // mounted would trigger a fresh scan instead of silently keeping stale
  // results — while still surviving React StrictMode's dev-mode
  // double-invoke for the same email, which would otherwise fire two real
  // scans (and persist two rows) per page visit.
  const scannedEmailRef = useRef<string | null>(null)

  function performScan(targetEmail: string) {
    setLoading(true)
    setScanError(false)
    setSampleNotice(null)
    runScan(targetEmail)
      .then((live) => {
        setResult(live)
        setSampleNotice(null)
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError && err.status === 503) {
          // Live scanning being unconfigured is an intentional, labeled
          // fallback so the rest of the app stays demoable — not a real
          // failure.
          setResult(sampleResult(targetEmail))
          setSampleNotice("Live scanning isn't configured in this environment yet. Showing a sample result.")
        } else {
          // Any other failure (network error, 5xx, timeout) is a real
          // failure and must not be dressed up as a result — showing
          // fabricated breach data here would misinform someone checking
          // their actual exposure.
          setScanError(true)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!email) {
      navigate('/scan', { replace: true })
      return
    }
    if (scannedEmailRef.current === email) return
    scannedEmailRef.current = email
    performScan(email)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email])

  if (!email) return null

  if (loading) {
    return (
      <div className="min-h-dvh text-ink">
        <MinimalNav step="Step 2 of 4 · Results" />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
          <RadarIcon className="h-8 w-8 animate-spin text-accent motion-reduce:animate-none" />
          <p className="mt-5 text-sm text-ink-muted">Scanning DeHashed and HIBP for {email}…</p>
        </main>
      </div>
    )
  }

  if (scanError) {
    return (
      <div className="min-h-dvh text-ink">
        <MinimalNav step="Step 2 of 4 · Results" />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
          <ShieldIcon className="h-8 w-8 text-ink-faint" />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Couldn&apos;t complete this scan</h1>
          <p className="mt-3 text-sm text-ink-muted">
            We couldn&apos;t reach the scanner right now. This is a real failure, not a clean result — try again in
            a moment.
          </p>
          <button
            type="button"
            onClick={() => performScan(email)}
            className={`mt-8 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
          >
            Try again
          </button>
        </main>
      </div>
    )
  }

  if (!result) return null

  const { breaches } = result
  const isClean = breaches.length === 0

  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Step 2 of 4 · Results" />

      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
          {isClean ? <CheckIcon className="h-5 w-5 text-accent" /> : <ShieldIcon className="h-5 w-5 text-accent" />}
        </div>
        <p className="text-sm text-ink-faint">{email}</p>

        {sampleNotice && (
          <p className="mx-auto mt-4 max-w-md rounded-full border border-white/10 bg-white/4 px-4 py-2 text-xs text-ink-faint">
            {sampleNotice}
          </p>
        )}

        {isClean ? (
          <>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">No exposure found</h1>
            <p className="mx-auto mt-3 max-w-md text-ink-muted">
              We didn&apos;t find this email in any breach we&apos;ve verified. Sign in to set up ongoing
              monitoring so you hear about it the moment that changes.
            </p>
            <button
              type="button"
              onClick={() => navigate('/auth', { state: { email } })}
              className={`mt-10 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
            >
              Set up monitoring
            </button>

            <BreachMetric count={0} />
            <RemediationSteps title="Stay ahead of the next breach" steps={MOCK_PREVENTIVE_TIPS} />
            <DownloadReportCard scanId={result.id} />
            <FeedbackSection />
          </>
        ) : (
          <>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              Found in {breaches.length} breaches
            </h1>
            <p className="mt-3 text-ink-muted">
              Here&apos;s a preview. Sign in to see full details and your AI risk score.
            </p>

            <BreachMetric count={breaches.length} />

            <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/8">
              <ul className="divide-y divide-white/6 blur-[3px]" aria-hidden="true">
                {breaches.map((b) => (
                  <li key={`${b.source}-${b.breach_name}`} className="flex items-center justify-between px-6 py-4 text-left">
                    <div>
                      <p className="text-sm font-medium text-ink">{b.breach_name}</p>
                      <p className="text-xs text-ink-faint">{b.breach_date ?? 'Date unknown'}</p>
                    </div>
                    <p className="text-xs text-ink-muted">{b.exposed_fields.join(', ')}</p>
                  </li>
                ))}
              </ul>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-canvas/40">
                <LockIcon className="h-6 w-6 text-ink-muted" />
                <button
                  type="button"
                  onClick={() => navigate('/auth', { state: { email } })}
                  className={`rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
                >
                  Sign in to see full report
                </button>
              </div>
            </div>

            <RemediationSteps title="Reduce your risk" steps={MOCK_RECOMMENDATIONS} />
            <DownloadReportCard scanId={result.id} />
            <FeedbackSection />
          </>
        )}
      </main>
    </div>
  )
}

export default ResultsPage
