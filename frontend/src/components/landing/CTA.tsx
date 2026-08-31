import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiPost } from '../../lib/apiClient'
import { liftPrimary } from '../interactive'
import Reveal from './Reveal'

function CTA() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    // Fire-and-forget: records the notify subscription for linking to an
    // account on first verified login. Never blocks navigation.
    apiPost('/api/notify', { email }).catch(() => {})
    navigate('/scan/results', { state: { email } })
  }

  return (
    <section id="notify" className="mx-auto max-w-6xl px-6 pb-16 sm:pb-32 lg:pb-36">
      <Reveal className="rounded-3xl border border-white/8 bg-white/3 px-6 py-12 text-center sm:px-16 sm:py-20">
        <h2 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Ready to see what&apos;s exposed?
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-ink-muted">
          One email. A few seconds. No account needed.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex w-full max-w-md flex-col items-center gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-full border border-white/10 bg-white/4 px-5 py-3.5 text-sm text-ink placeholder:text-ink-faint transition-colors duration-300 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className={`w-full shrink-0 rounded-full bg-ink px-8 py-3.5 text-base font-medium text-canvas hover:bg-white sm:w-auto ${liftPrimary}`}
          >
            Get notified
          </button>
        </form>
      </Reveal>
    </section>
  )
}

export default CTA
