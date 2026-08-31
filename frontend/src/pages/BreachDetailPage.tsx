import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import SeverityBadge from '../components/app/SeverityBadge'
import Reveal from '../components/landing/Reveal'
import { ArrowRightIcon, ClockIcon, LockIcon, ShieldIcon, SparkleIcon } from '../components/icons'
import { formatCount, formatFullDate, formatMonthYear } from '../lib/format'
import { fetchBreachCatalogEntry, type CatalogBreach } from '../lib/breachCatalogApi'
import { BRAND_NAME } from '../components/brand'

const RECOMMENDED_ACTIONS = [
  'Change your password on any account tied to this email.',
  'Enable two-factor authentication where available.',
  'Check for reused passwords across other accounts.',
]

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '')
}

// Keyed by `name` from the parent below, so navigating between two breach
// detail pages remounts this with fresh state instead of briefly showing
// the previous breach's data while the new one loads.
function BreachDetailContent({ name }: { name: string }) {
  const [breach, setBreach] = useState<CatalogBreach | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchBreachCatalogEntry(name)
      .then(setBreach)
      .catch(() => setNotFound(true))
  }, [name])

  if (notFound) {
    return (
      <main className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Breach not found</h1>
        <p className="mt-3 text-ink-muted">This entry doesn&apos;t exist in the database.</p>
        <Link to="/breach-intelligence" className="mt-6 inline-block text-sm font-medium text-accent transition-colors duration-150 hover:text-ink">
          ← Back to Breach Intelligence
        </Link>
      </main>
    )
  }

  if (!breach) {
    return <main className="mx-auto max-w-lg px-6 py-24 text-center text-sm text-ink-muted">Loading…</main>
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <Link
        to="/breach-intelligence"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
      >
        ← Back to Breach Intelligence
      </Link>

      <Reveal className="mt-8 flex items-center gap-5">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/4 text-2xl font-semibold text-ink">
          {breach.title.charAt(0)}
        </span>
        <div>
          <div className="mb-2">
            <SeverityBadge severity={breach.severity} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{breach.title} Data Breach</h1>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <p className="mt-8 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {formatCount(breach.pwn_count)}
          <span className="ml-2 text-xl font-normal text-ink-muted">accounts exposed</span>
        </p>
      </Reveal>

      <Reveal delay={80} className="relative mt-10 border-y border-white/8 py-8">
        <div className="absolute bottom-8 left-6.5 top-8 w-px bg-white/8" />
        <div className="flex flex-col gap-7">
          <div className="flex items-start gap-4">
            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-canvas text-accent">
              <ClockIcon className="h-4 w-4" />
            </span>
            <div className="pt-1.5">
              <p className="text-sm font-medium text-ink">Breach occurred</p>
              <p className="mt-0.5 text-sm text-ink-muted">{formatMonthYear(breach.breach_date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-canvas text-accent">
              <ShieldIcon className="h-4 w-4" />
            </span>
            <div className="pt-1.5">
              <p className="text-sm font-medium text-ink">Verified &amp; added to {BRAND_NAME}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{formatFullDate(breach.added_date)}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-10 flex flex-col gap-6">
        <Reveal delay={120}>
          <div className="flex items-center gap-2.5">
            <LockIcon className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-ink">What happened</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">{stripHtml(breach.description)}</p>
        </Reveal>

        <Reveal delay={160}>
          <h2 className="text-lg font-semibold tracking-tight text-ink">Compromised data</h2>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {breach.data_classes.map((type) => (
              <li key={type} className="flex items-center gap-2.5 text-sm text-ink-muted">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
                {type}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={200} className="rounded-2xl border border-white/8 bg-white/3 p-8">
          <div className="flex items-center gap-2.5">
            <SparkleIcon className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight text-ink">Recommended actions</h2>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {RECOMMENDED_ACTIONS.map((action) => (
              <li key={action} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {action}
              </li>
            ))}
          </ul>
          <Link
            to="/scan"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors duration-150 hover:text-ink"
          >
            Check your own exposure
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </div>
    </main>
  )
}

function BreachDetailPage() {
  const { name } = useParams<{ name: string }>()

  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Breach Intelligence" />
      {name && <BreachDetailContent key={name} name={name} />}
    </div>
  )
}

export default BreachDetailPage
