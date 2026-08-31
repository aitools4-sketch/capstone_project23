import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { MailIcon } from '../components/icons'
import { liftPrimary } from '../components/interactive'
import { supabase } from '../lib/supabaseClient'

const MISSING_CODE_ERROR = 'This sign-in link is missing its code. Request a new one to continue.'
const EXPIRED_LINK_ERROR = 'This sign-in link has expired or was already used. Request a new one to continue.'

// Must be a same-site path: a single leading slash, and not a
// protocol-relative URL (`//evil.com`, which browsers resolve as a
// different host despite starting with '/').
function isSafeRedirect(path: string | null): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//')
}

function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const code = searchParams.get('code')
  const [error, setError] = useState<string | null>(() => (code ? null : MISSING_CODE_ERROR))
  const hasExchangedRef = useRef(false)

  useEffect(() => {
    if (!code) return
    // Guards against React StrictMode's dev-mode double-invoke, which would
    // otherwise exchange the same one-time code twice — the second call
    // always fails since the first already consumed it.
    if (hasExchangedRef.current) return
    hasExchangedRef.current = true
    const redirect = searchParams.get('redirect')

    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (exchangeError) {
        setError(EXPIRED_LINK_ERROR)
        return
      }
      navigate(isSafeRedirect(redirect) ? redirect : '/dashboard', { replace: true })
    })
    // Runs once for the one-time code in the URL — re-running on param identity
    // changes would try to exchange an already-consumed code.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <MinimalNav step="Step 4 of 4 · Verifying" />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <MailIcon className="h-5 w-5 text-accent" />
          </div>

          {error ? (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Link expired</h1>
              <p className="mt-3 text-ink-muted">{error}</p>
              <Link
                to="/auth"
                className={`mt-8 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Signing you in…</h1>
              <p className="mt-3 text-ink-muted">Verifying your link. This only takes a second.</p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default AuthCallbackPage
