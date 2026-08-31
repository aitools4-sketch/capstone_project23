import { Link } from 'react-router-dom'
import { BRAND_NAME } from '../brand'
import { ShieldIcon } from '../icons'

function MinimalNav({ step }: { step?: string }) {
  return (
    <header className="border-b border-white/6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 text-ink">
          <ShieldIcon className="h-5 w-5 text-accent" />
          <span className="text-base font-semibold tracking-tight">{BRAND_NAME}</span>
        </Link>
        {step && <span className="text-xs uppercase tracking-widest text-ink-faint">{step}</span>}
      </nav>
    </header>
  )
}

export default MinimalNav
