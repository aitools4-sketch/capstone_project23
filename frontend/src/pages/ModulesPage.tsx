import { useState } from 'react'
import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import ModuleCard from '../components/app/ModuleCard'
import { ArrowRightIcon, LayersIcon } from '../components/icons'
import { liftGhost } from '../components/interactive'
import { MODULES } from '../lib/modulesData'

function ModulesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggle(id: string) {
    setExpandedId((current) => (current === id ? null : id))
  }

  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Security basics" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="border-b border-white/8 pb-12">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <LayersIcon className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Learn the precautions</h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            General security knowledge anyone can use, no email or scan required. These modules cover what to do
            about password reuse, malware, financial exposure, and identity theft before they happen to you.
          </p>
          <p className="mt-3 max-w-xl text-sm text-ink-faint">
            Looking for guidance based on what&apos;s actually in your data? That&apos;s AI insights, and it needs a
            scan first.
          </p>
          <Link
            to="/scan"
            className={`mt-8 inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-ink ${liftGhost}`}
          >
            Check your exposure
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {MODULES.map((m) => (
            <ModuleCard key={m.id} module={m} expanded={expandedId === m.id} onToggle={() => toggle(m.id)} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default ModulesPage
