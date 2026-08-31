import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import Reveal from '../components/landing/Reveal'
import { ArrowRightIcon, RadarIcon } from '../components/icons'
import { cardHover, liftPrimary } from '../components/interactive'
import { BRAND_NAME } from '../components/brand'

const MILESTONES = [
  {
    title: 'From a score to an explanation.',
    detail:
      'Today, a risk score tells you how exposed you are. Next: an AI-generated, plain-language explanation of what each breach actually means for you and specific steps to take, not just a static checklist.',
  },
  {
    title: 'From checking to watching.',
    detail:
      'Right now, checking is something you have to remember to do. The next step is monitoring: an alert the moment a new breach involving your email surfaces, delivered straight to your inbox.',
  },
  {
    title: 'Beyond a single email.',
    detail:
      'Today, one email address per search. Usernames, phone numbers, and social handles are the natural next identifiers once that foundation holds up.',
  },
  {
    title: 'Built for one person, adaptable beyond it.',
    detail:
      'The way detection, scoring, and alerting are separated already means the same pattern could serve a security team watching a whole organization, not just one inbox. That’s not the current focus, but the architecture doesn’t rule it out.',
  },
]

function VisionPage() {
  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Our vision" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <div className="border-b border-white/8 pb-12">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <RadarIcon className="h-5 w-5 text-accent" />
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Where this is going</h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            Today, {BRAND_NAME} does one thing well: check a single email against verified breach records and
            turn the result into a risk score anyone can act on. Everything below builds on that foundation.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {MILESTONES.map((m) => (
            <Reveal key={m.title}>
              <div className={`rounded-2xl border border-white/8 bg-white/3 p-6 ${cardHover}`}>
                <p className="text-sm font-medium text-ink">{m.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{m.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-white/8 bg-white/3 p-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm text-sm text-ink-muted">
            All of this depends on the foundation being right first. See what that looks like today.
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

export default VisionPage
