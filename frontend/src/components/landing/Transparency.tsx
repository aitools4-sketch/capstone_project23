import { LockIcon } from '../icons'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

const LIMITS = [
  {
    term: 'Email addresses only, for now.',
    detail: "Usernames, phone numbers, and social accounts like X, Facebook, and Instagram aren't scanned yet.",
  },
  {
    term: 'Historical data, not real-time.',
    detail:
      "Results come from breaches security researchers have already documented and verified, not the instant one happens.",
  },
  {
    term: 'Verified sources only.',
    detail: "If a breach hasn't been publicly disclosed or confirmed, it won't show up in your results.",
  },
  {
    term: 'One identifier per search.',
    detail: 'Each scan checks a single email address, by design.',
  },
  {
    term: 'Passwords are never shown to you.',
    detail: 'Sensitive fields like passwords are masked or stripped out before any result reaches your screen.',
  },
]

function Transparency() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro
        icon={LockIcon}
        title="What this can (and can't) do."
        description="No tool is all-seeing. Here's exactly where the line is."
      />

      <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-x-12 gap-y-10 sm:grid-cols-2">
        {LIMITS.map((item, i) => (
          <Reveal key={item.term} delay={i * 60}>
            <dt className="text-base font-medium text-ink">{item.term}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink-faint">{item.detail}</dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}

export default Transparency
