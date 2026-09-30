import { useMemo, useState, type ComponentType, type KeyboardEvent } from 'react'
import { CloseIcon, SearchIcon } from '../icons'

export type PaletteItem = {
  label: string
  icon: ComponentType<{ className?: string }>
  /** Extra words this item should also match on (e.g. "password" for "Password check"). */
  keywords?: string
  to?: string
  onSelect?: () => void
}

function matches(item: PaletteItem, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return item.label.toLowerCase().includes(q) || Boolean(item.keywords?.toLowerCase().includes(q))
}

/** The dashboard's "Find" command palette — opened via the sidebar button or
 * the "F" shortcut. Lets you jump straight to any dashboard section or
 * action by typing a few letters, instead of hunting through the sidebar.
 *
 * The parent only renders this component while open (`{open && <CommandPalette
 * .../>}`), so every open is a fresh mount with fresh state — no reset
 * effects needed. */
function CommandPalette({
  onClose,
  items,
  onNavigate,
}: {
  onClose: () => void
  items: PaletteItem[]
  onNavigate: (to: string) => void
}) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const filtered = useMemo(() => items.filter((item) => matches(item, query)), [items, query])

  function handleQueryChange(value: string) {
    setQuery(value)
    setActiveIndex(0)
  }

  function selectItem(item: PaletteItem) {
    onClose()
    if (item.to) onNavigate(item.to)
    else item.onSelect?.()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filtered[activeIndex]
      if (item) selectItem(item)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh]"
      role="dialog"
      aria-label="Find"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-canvas shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-white/8 px-4 py-3">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Find a page or action…"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors duration-150 hover:bg-white/5 hover:text-ink"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-faint">No matches for &quot;{query}&quot;.</p>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => selectItem(item)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-100 ${
                i === activeIndex ? 'bg-white/8 text-ink' : 'text-ink-muted'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
