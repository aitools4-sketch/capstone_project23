import { ShieldIcon } from '../icons'
import { cardHover } from '../interactive'
import type { LearningModule } from '../../lib/modulesData'

function ModuleCard({
  module,
  expanded,
  onToggle,
}: {
  module: LearningModule
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/3 ${cardHover}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-4 p-6 text-left"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <ShieldIcon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-ink">{module.title}</p>
            <p className="mt-1 max-w-lg text-sm text-ink-muted">{module.description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-xs font-medium text-ink-muted">
          {module.steps.length} steps
        </span>
      </button>

      {expanded && (
        <ol className="flex flex-col gap-3 border-t border-white/8 px-6 py-5">
          {module.steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
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
      )}
    </div>
  )
}

export default ModuleCard
