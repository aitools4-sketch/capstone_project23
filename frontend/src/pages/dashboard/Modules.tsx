import { useEffect, useRef, useState } from 'react'
import ModuleCard from '../../components/app/ModuleCard'
import { LayersIcon, SparkleIcon } from '../../components/icons'
import { MODULES, type LearningModule } from '../../lib/modulesData'
import { fetchMyScans, type MyScan } from '../../lib/scanHistoryApi'

/** Which module categories actually apply, based on what the user's most
 * recent scan found — not a fixed default. No scans or no matching
 * exposure means no "Recommended for you" section at all. */
function relevantCategories(scan: MyScan | undefined): Set<LearningModule['category']> {
  const categories = new Set<LearningModule['category']>()
  for (const b of scan?.breaches ?? []) {
    if (b.record_type === 'stealer_log') categories.add('malware')
    for (const field of b.exposed_fields) {
      if (field.toLowerCase().includes('password')) categories.add('password')
      if (field === 'Payment card exposed' || field === 'Bank account exposed') categories.add('financial')
      if (field === 'Government ID exposed') categories.add('identity')
    }
  }
  return categories
}

function Modules() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
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

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id))
  }

  const relevant = relevantCategories(scans?.[0])
  const recommended = MODULES.filter((m) => relevant.has(m.category))
  const rest = MODULES.filter((m) => !relevant.has(m.category))

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Learning modules</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Step-by-step guidance based on what&apos;s been found in your scans.
        </p>
      </div>

      {loadError && (
        <p className="rounded-2xl border border-white/8 bg-white/3 px-6 py-4 text-center text-sm text-ink-faint">
          Couldn&apos;t load your scan history, so recommendations below may be incomplete.
        </p>
      )}

      {recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-2">
            <SparkleIcon className="h-4 w-4 text-accent" />
            <h2 className="text-base font-medium text-ink">Recommended for you</h2>
          </div>
          <div className="mt-3 flex flex-col gap-4">
            {recommended.map((m) => (
              <ModuleCard key={m.id} module={m} expanded={expandedId === m.id} onToggle={() => toggle(m.id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2">
          <LayersIcon className="h-4 w-4 text-ink-faint" />
          <h2 className="text-base font-medium text-ink">All modules</h2>
        </div>
        <div className="mt-3 flex flex-col gap-4">
          {rest.map((m) => (
            <ModuleCard key={m.id} module={m} expanded={expandedId === m.id} onToggle={() => toggle(m.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Modules
