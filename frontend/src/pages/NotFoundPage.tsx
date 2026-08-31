import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { SearchIcon } from '../components/icons'
import { liftPrimary } from '../components/interactive'

function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <MinimalNav />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <SearchIcon className="h-5 w-5 text-accent" />
          </div>
          <p className="text-sm text-ink-faint">404</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Page not found</h1>
          <p className="mt-3 text-ink-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <Link
            to="/"
            className={`mt-8 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}

export default NotFoundPage
