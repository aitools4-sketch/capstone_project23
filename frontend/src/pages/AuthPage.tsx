import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { CheckIcon, MailIcon } from '../components/icons'
import { liftPrimary, underlineLink } from '../components/interactive'
import { useAuth } from '../lib/useAuth'

const RESEND_COOLDOWN_SECONDS = 30

function AuthPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { requestMagicLink } = useAuth()

  const redirectTo = searchParams.get('redirect') ?? undefined
  const [email, setEmail] = useState((location.state as { email?: string } | null)?.email ?? '')
  const [mode, setMode] = useState<'form' | 'sent'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function sendLink(targetEmail: string) {
    setSubmitting(true)
    setError(null)
    const { error: sendError } = await requestMagicLink(targetEmail, redirectTo)
    setSubmitting(false)

    if (sendError) {
      setError(sendError)
      return
    }
    setMode('sent')
    setCooldown(RESEND_COOLDOWN_SECONDS)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || submitting) return
    void sendLink(email)
  }

  function handleResend() {
    if (cooldown > 0 || submitting) return
    void sendLink(email)
  }

  function handleUseDifferentEmail() {
    setMode('form')
    setError(null)
    setCooldown(0)
  }

  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <MinimalNav step="Step 3 of 4 · Sign in" />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            {mode === 'sent' ? (
              <CheckIcon className="h-5 w-5 text-accent" />
            ) : (
              <MailIcon className="h-5 w-5 text-accent" />
            )}
          </div>

          {mode === 'form' ? (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Sign up or sign in</h1>
              <p className="mt-3 text-ink-muted">We&apos;ll email you a magic link, no password needed.</p>

              <form onSubmit={handleSubmit} className="mt-8 flex w-full flex-col gap-3">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors duration-300 focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${liftPrimary}`}
                >
                  {submitting ? 'Sending…' : 'Send magic link'}
                </button>
              </form>

              {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-semibold tracking-tight text-ink">Check your email</h1>
              <p className="mt-3 text-ink-muted">
                We sent a sign-in link to <span className="text-ink">{email}</span>. Open it on this device to
                continue.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || submitting}
                  className={`rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 ${liftPrimary}`}
                >
                  {cooldown > 0 ? `Resend link in ${cooldown}s` : submitting ? 'Sending…' : 'Resend link'}
                </button>
                <button
                  type="button"
                  onClick={handleUseDifferentEmail}
                  className={`text-sm text-ink-muted hover:text-ink ${underlineLink}`}
                >
                  Use a different email
                </button>
              </div>

              {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default AuthPage
