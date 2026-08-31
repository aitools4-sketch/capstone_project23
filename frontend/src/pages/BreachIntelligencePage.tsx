
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import SeverityBadge from '../components/app/SeverityBadge'
import Reveal from '../components/landing/Reveal'
import { ArrowRightIcon, ChevronDownIcon, GaugeIcon, LayersIcon, SearchIcon } from '../components/icons'
import { liftGhost, rowHover } from '../components/interactive'
import { formatCount, formatFullDate, formatMonthYear } from '../lib/format'
import { fetchBreachCatalog, type CatalogBreach } from '../lib/breachCatalogApi'

type SortField = 'title' | 'pwn_count' | 'added_date' | 'breach_date'

// 1,030+ breaches is too many rows to put in the DOM at once — rendering
// them all measurably slowed both the initial load and every sort click
// (~650ms of pure re-render, no network involved). Paginating keeps the
// number of rendered rows constant regardless of catalog size.
const PAGE_SIZE = 25

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className="inline-flex flex-col -space-y-1">
      <ChevronDownIcon className={`h-2.5 w-2.5 rotate-180 ${active && dir === 'asc' ? 'text-accent' : 'text-ink-faint'}`} />
      <ChevronDownIcon className={`h-2.5 w-2.5 ${active && dir === 'desc' ? 'text-accent' : 'text-ink-faint'}`} />
    </span>
  )
}

function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onSort,
}: {
  label: string
  field: SortField
  sortField: SortField
  sortDir: 'asc' | 'desc'
  onSort: (field: SortField) => void
}) {
  return (
    <th className="px-6 py-3 font-medium">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-1.5 text-ink-faint transition-colors duration-150 hover:text-ink"
      >
        {label}
        <SortIcon active={sortField === field} dir={sortDir} />
      </button>
    </th>
  )
}

function BreachIntelligencePage() {
  const [breaches, setBreaches] = useState<CatalogBreach[] | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [sortField, setSortField] = useState<SortField>('added_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    if (hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetchBreachCatalog()
      .then(setBreaches)
      .catch(() => setLoadError(true))
  }, [])

  function updateScrollHints() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  // On narrow screens the table is wider than its container — this tracks
  // scroll position so we can hint (via the fades below) that there's more
  // to see, since overflow-x-auto alone gives no visual sign it's scrollable.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollHints()
    const observer = new ResizeObserver(updateScrollHints)
    observer.observe(el)
    return () => observer.disconnect()
  }, [breaches])

  function handleSort(field: SortField) {
    setPage(0)
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sorted = useMemo(() => {
    if (!breaches) return []
    const copy = [...breaches]
    copy.sort((a, b) => {
      let cmp: number
      if (sortField === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortField === 'pwn_count') cmp = a.pwn_count - b.pwn_count
      else cmp = new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime()
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [breaches, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const pageItems = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPwned = breaches?.reduce((sum, b) => sum + b.pwn_count, 0) ?? 0

  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Breach Intelligence" />

      <main className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-10 border-b border-white/8 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-lg">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
              <SearchIcon className="h-5 w-5 text-accent" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Breach Intelligence</h1>
            <p className="mt-4 text-ink-muted">
              Every breach Have I Been Pwned has verified and added to their database. Browse the full catalog,
              independent of any single email.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:w-96">
            <div className="rounded-2xl border border-white/8 bg-white/3 px-6 py-6">
              <LayersIcon className="h-4 w-4 text-ink-faint" />
              <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">{breaches?.length ?? '…'}</p>
              <p className="mt-1 text-xs text-ink-muted">Total breaches</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/3 px-6 py-6">
              <GaugeIcon className="h-4 w-4 text-ink-faint" />
              <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">{formatCount(totalPwned)}</p>
              <p className="mt-1 text-xs text-ink-muted">Exposed accounts</p>
            </div>
          </div>
        </div>

        <Reveal
          delay={80}
          className="mt-10 flex flex-col gap-6 rounded-2xl border border-white/8 bg-white/3 p-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">About this database</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
              A breach is an incident where a site&apos;s data was accessed without authorization and later exposed.
              Entries here are sourced from Have I Been Pwned&apos;s verified, publicly disclosed incidents, not
              real-time reports, and added to this database once confirmed.
            </p>
          </div>
          <Link
            to="/scan"
            className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-ink ${liftGhost}`}
          >
            Check your email
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <h2 className="mt-14 text-sm font-medium uppercase tracking-widest text-ink-faint">Browse all breaches</h2>

        {loadError ? (
          <p className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-8 text-center text-sm text-ink-muted">
            Couldn&apos;t load the breach catalog right now. Try again shortly.
          </p>
        ) : !breaches ? (
          <p className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-8 text-center text-sm text-ink-muted">
            Loading breach catalog…
          </p>
        ) : (
          <Reveal delay={120} className="relative mt-4 rounded-2xl border border-white/8">
            <div ref={scrollRef} onScroll={updateScrollHints} className="overflow-x-auto rounded-2xl">
              <table className="w-full min-w-195 text-left text-sm">
                <thead className="bg-white/3 text-xs uppercase tracking-wide text-ink-faint">
                  <tr>
                    <SortableHeader label="Breach name" field="title" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableHeader label="Pwn count" field="pwn_count" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableHeader label="Added" field="added_date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <SortableHeader label="Breach date" field="breach_date" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                    <th className="px-6 py-3 font-medium">Severity</th>
                    <th className="px-6 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {pageItems.map((b) => (
                    <tr key={b.name} className={rowHover}>
                      <td className="px-6 py-4 font-medium text-ink">{b.title}</td>
                      <td className="px-6 py-4 text-ink-muted">{formatCount(b.pwn_count)}</td>
                      <td className="px-6 py-4 text-ink-muted">{formatFullDate(b.added_date)}</td>
                      <td className="px-6 py-4 text-ink-muted">{formatMonthYear(b.breach_date)}</td>
                      <td className="px-6 py-4">
                        <SeverityBadge severity={b.severity} />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/breach-intelligence/${encodeURIComponent(b.name)}`}
                          aria-label={`View details for ${b.title}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-colors duration-150 hover:border-white/25 hover:text-ink"
                        >
                          <ArrowRightIcon className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 left-0 w-10 rounded-l-2xl bg-gradient-to-r from-canvas to-transparent transition-opacity duration-200 ${
                canScrollLeft ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 w-10 rounded-r-2xl bg-gradient-to-l from-canvas to-transparent transition-opacity duration-200 ${
                canScrollRight ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </Reveal>
        )}

        {breaches && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-ink-faint">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className={`flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40 ${liftGhost}`}
              >
                <ArrowRightIcon className="h-3 w-3 rotate-180" />
                Previous
              </button>
              <span className="text-xs text-ink-faint">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className={`flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40 ${liftGhost}`}
              >
                Next
                <ArrowRightIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default BreachIntelligencePage
