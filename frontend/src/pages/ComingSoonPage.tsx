import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { ClockIcon } from '../components/icons'
import { underlineLink } from '../components/interactive'

function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <MinimalNav />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <ClockIcon className="h-5 w-5 text-accent" />
          </div>
          <p className="text-xs uppercase tracking-widest text-ink-faint">Coming soon</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{title}</h1>
          <p className="mt-3 text-ink-muted">{description}</p>
          <Link to="/" className={`mt-8 text-sm font-medium text-ink-muted ${underlineLink} hover:text-ink`}>
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}

export default ComingSoonPage
