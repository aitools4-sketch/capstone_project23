import { useRef, useState } from 'react'
import { LockIcon, ShieldIcon } from '../../components/icons'
import { cardHover, liftPrimary } from '../../components/interactive'
import { formatCount } from '../../lib/format'
import { checkPasswordExposure } from '../../lib/pwnedPasswordApi'

type Status = 'idle' | 'checking' | 'safe' | 'exposed' | 'error'

function PasswordCheckPage() {
  const [password, setPassword] = useState('')
  const [reveal, setReveal] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [count, setCount] = useState(0)
  // Bumped on every edit and every check, so a response for a password the
  // user has since changed can't land and overwrite the result shown for
  // the current one.
  const requestIdRef = useRef(0)

  function handleChange(value: string) {
    setPassword(value)
    setStatus('idle')
    requestIdRef.current += 1
  }

  async function handleCheck() {
    if (!password) return
    const requestId = (requestIdRef.current += 1)
    setStatus('checking')
    try {
      const hits = await checkPasswordExposure(password)
      if (requestIdRef.current !== requestId) return
      setCount(hits)
      setStatus(hits > 0 ? 'exposed' : 'safe')
    } catch {
      if (requestIdRef.current !== requestId) return
      setStatus('error')
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Password check</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Check whether a password has turned up in a known breach, powered by Have I Been Pwned.
        </p>
      </div>

      <div className={`rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
            <LockIcon className="h-4 w-4" />
          </span>
          <p className="text-sm text-ink-muted">
            This password is hashed in your browser and never sent to our servers. Only the first five characters
            of that hash go to Have I Been Pwned, which is enough to check for a match without ever revealing the
            actual password.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type={reveal ? 'text' : 'password'}
            value={password}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            placeholder="Enter a password to check"
            autoComplete="off"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-ink outline-none focus:border-accent/40"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              className="rounded-lg border border-white/10 px-3 py-2.5 text-xs font-medium text-ink-muted transition-colors duration-150 hover:text-ink"
            >
              {reveal ? 'Hide' : 'Show'}
            </button>
            <button
              type="button"
              onClick={handleCheck}
              disabled={!password || status === 'checking'}
              className={`rounded-lg bg-ink px-4 py-2.5 text-sm font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-60 ${liftPrimary}`}
            >
              {status === 'checking' ? 'Checking…' : 'Check'}
            </button>
          </div>
        </div>

        {status === 'safe' && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
            <ShieldIcon className="h-4 w-4 shrink-0 text-green-400" />
            <p className="text-sm text-ink">Not found in any known breach.</p>
          </div>
        )}

        {status === 'exposed' && (
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <p className="text-sm text-ink">
              Seen in known breaches <strong>{formatCount(count)}</strong> {count === 1 ? 'time' : 'times'}. Stop
              using this password anywhere, including any account it&apos;s reused on.
            </p>
          </div>
        )}

        {status === 'error' && (
          <p className="mt-5 text-sm text-red-400">Couldn&apos;t reach Have I Been Pwned. Try again in a moment.</p>
        )}
      </div>
    </div>
  )
}

export default PasswordCheckPage
