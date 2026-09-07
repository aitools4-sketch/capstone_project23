import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { MailIcon } from '../components/icons'
import { liftPrimary } from '../components/interactive'
import { ApiError } from '../lib/apiClient'
import { verifyMonitoredEmail } from '../lib/monitoredEmailsApi'

const MISSING_TOKEN_ERROR = "This confirmation link is missing its token — it wasn't opened correctly."
const INVALID_TOKEN_ERROR = 'This confirmation link is invalid or has already been used.'

function MonitoredEmailVerifyPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'verifying' | 'done' | 'error'>(token ? 'verifying' : 'error')
  const [error, setError] = useState<string | null>(token ? null : MISSING_TOKEN_ERROR)
  const hasVerifiedRef = useRef(false)

  useEffect(() => {
    if (!token) return
    // Guards against React StrictMode's dev-mode double-invoke, which would
    // otherwise spend the same single-use token twice.
    if (hasVerifiedRef.current) return
    hasVerifiedRef.current = true

    verifyMonitoredEmail(token)
      .then(() => setStatus('done'))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : INVALID_TOKEN_ERROR)
        setStatus('error')
      })
    // Runs once for the one-time token in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <MinimalNav step="Confirm monitored email" />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <MailIcon className="h-5 w-5 text-accent" />
          </div>

          {status === 'verifying' && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Confirming…</h1>
              <p className="mt-3 text-ink-muted">This only takes a second.</p>
            </>
          )}

          {status === 'done' && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Email confirmed</h1>
              <p className="mt-3 text-ink-muted">
                This email is now monitored. We&apos;ll alert you the moment it turns up in a new breach.
              </p>
              <Link
                to="/dashboard/monitored-emails"
                className={`mt-8 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
              >
                Manage monitored emails
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Couldn&apos;t confirm this email</h1>
              <p className="mt-3 text-ink-muted">{error}</p>
              <Link
                to="/dashboard/monitored-emails"
                className={`mt-8 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
              >
                Manage monitored emails
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default MonitoredEmailVerifyPage
