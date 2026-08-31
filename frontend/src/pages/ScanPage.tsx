import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { ArrowRightIcon, RadarIcon } from '../components/icons'
import { liftPrimary, underlineLink } from '../components/interactive'

function ScanPage() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    navigate('/scan/results', { state: { email } })
  }

  return (
    <div className="flex min-h-dvh flex-col text-ink">
      <MinimalNav step="Step 1 of 4 · Scan" />

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-lg flex-col items-center text-center">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <RadarIcon className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Check your exposure</h1>
          <p className="mt-3 text-ink-muted">
            Enter the email you want to check. We&apos;ll scan DeHashed and Have I Been Pwned right away.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 flex w-full flex-col gap-3">
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
              className={`flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
            >
              Scan for free
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-4 text-xs text-ink-faint">No credit card required · Results in seconds</p>
          <Link to="/modules" className={`mt-6 text-xs text-ink-muted ${underlineLink} hover:text-ink`}>
            Not sure what to look for? Browse security basics first
          </Link>
        </div>
      </main>
    </div>
  )
}

export default ScanPage
