import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import Reveal from '../components/landing/Reveal'
import { ArrowRightIcon, LockIcon } from '../components/icons'
import { cardHover, liftPrimary } from '../components/interactive'
import { BRAND_NAME } from '../components/brand'

const PILLARS = [
  {
    title: 'Verified data, not guesses.',
    detail:
      'Every result traces back to a breach that DeHashed or Have I Been Pwned has documented and confirmed. Nothing here is estimated, predicted, or fabricated to look more alarming than it is.',
  },
  {
    title: 'Plain language over jargon.',
    detail:
      'A risk score and specific next steps, not a raw technical dump only a security professional could parse. Understanding your own exposure shouldn’t require a security background.',
  },
  {
    title: 'Your data stays yours.',
    detail:
      'Sensitive fields are masked before they ever leave the server. Nothing is sold, and nothing is shared beyond what actually running the check requires.',
  },
]

function MissionPage() {
  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Our mission" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="border-b border-white/8 pb-12">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <LockIcon className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Why {BRAND_NAME} exists</h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            Breach data already exists. DeHashed and Have I Been Pwned have compiled billions of records from
            verified security incidents. But that data was built for security researchers, not for the person
            whose email is actually in it. Most people never check, and if they did, wouldn&apos;t know what a
            hashed password or a stealer log actually means for them.
          </p>
          <p className="mt-3 max-w-xl text-ink-muted">
            {BRAND_NAME} exists to close that gap: to turn records only an expert could read into something
            anyone can understand and act on.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {PILLARS.map((p) => (
            <Reveal key={p.title}>
              <div className={`rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
                <p className="text-sm font-medium text-ink">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-white/8 bg-white/3 p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-sm text-ink-muted">
            In short: shorten the distance between a breach happening and you finding out about it.
          </p>
          <Link
            to="/scan"
            className={`flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas hover:bg-white ${liftPrimary}`}
          >
            Check your email
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </Reveal>
      </main>
    </div>
  )
}

export default MissionPage
