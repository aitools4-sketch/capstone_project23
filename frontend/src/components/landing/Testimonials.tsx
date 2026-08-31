import { cardHover } from '../interactive'
import { QuoteIcon } from '../icons'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

const FEATURED = {
  quote: 'Three breaches I never knew about. The score made it obvious what to fix first.',
  name: 'J. Rivera',
  role: 'Early access user',
}

const SMALL_QUOTES = [
  {
    quote: 'It tells you why a breach matters, not just that it happened.',
    name: 'M. Okafor',
    role: 'Early access user',
  },
  {
    quote: 'Set it up once. Forgot about it until an alert actually mattered.',
    name: 'S. Novak',
    role: 'Early access user',
  },
  {
    quote: 'Cleaner than anything else I’ve used.',
    name: 'A. Bianchi',
    role: 'Early access user',
  },
]

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-medium text-accent">
      {name.charAt(0)}
    </span>
  )
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro icon={QuoteIcon} title="What early users say" description="Real people, real exposure." />

      <Reveal className="mx-auto mt-14 max-w-2xl text-center">
        <blockquote className="text-2xl font-medium leading-snug tracking-tight text-ink sm:text-3xl">
          &ldquo;{FEATURED.quote}&rdquo;
        </blockquote>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Avatar name={FEATURED.name} />
          <div className="text-left text-sm">
            <p className="font-medium text-ink">{FEATURED.name}</p>
            <p className="text-ink-faint">{FEATURED.role}</p>
          </div>
        </div>
      </Reveal>

      <div className="mt-14 flex flex-wrap justify-center gap-4">
        {SMALL_QUOTES.map((t, i) => (
          <Reveal key={t.name} delay={i * 80} className="w-full max-w-xs sm:w-72">
            <div className={`h-full rounded-2xl border border-white/8 bg-white/3 p-7 ${cardHover}`}>
              <p className="text-base leading-relaxed text-ink-muted">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-2.5">
                <Avatar name={t.name} />
                <div className="text-xs">
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="text-ink-faint">{t.role}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Testimonials
