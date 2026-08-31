import { cardHover } from '../interactive'
import { BellIcon, MailIcon, TagIcon } from '../icons'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

function RadarVisual() {
  return (
    <div className="relative mt-8 flex h-40 items-center justify-center overflow-hidden rounded-xl border border-white/8 bg-black/40">
      <div className="relative h-28 w-28 rounded-full border border-accent/20">
        <div className="absolute inset-3 rounded-full border border-accent/20" />
        <div className="absolute inset-8 rounded-full border border-accent/20" />
        <div
          className="absolute inset-0 origin-center animate-[radar-spin_5s_linear_infinite] rounded-full motion-reduce:animate-none"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, transparent 300deg, var(--color-accent) 360deg)',
          }}
        />
        <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
      </div>
    </div>
  )
}

function GaugeVisual() {
  return (
    <div className="mt-8 flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-white/8 bg-black/40">
      <div
        className="h-16 w-32 rounded-t-full"
        style={{
          background:
            'conic-gradient(from 270deg at 50% 100%, var(--color-accent) 0deg, var(--color-accent) 75.6deg, rgba(255,255,255,0.08) 75.6deg, rgba(255,255,255,0.08) 180deg)',
        }}
      />
      <span className="text-xl font-semibold text-ink">42<span className="text-sm font-normal text-ink-faint">/100</span></span>
    </div>
  )
}

function BarsVisual() {
  const heights = [40, 65, 30, 80, 50]
  return (
    <div className="mt-8 flex h-40 items-end justify-center gap-2 rounded-xl border border-white/8 bg-black/40 p-6">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-4 rounded-full bg-accent"
          style={{ height: `${h}%`, opacity: 0.4 + i * 0.12 }}
        />
      ))}
    </div>
  )
}

function AlertsVisual() {
  return (
    <div className="mt-8 flex h-40 items-center justify-center gap-6 rounded-xl border border-white/8 bg-black/40">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <span className="absolute h-12 w-12 animate-ping rounded-full bg-accent/20 motion-reduce:animate-none" />
        <BellIcon className="h-5 w-5" />
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-ink-faint">
        <MailIcon className="h-5 w-5" />
      </div>
    </div>
  )
}

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro
        icon={TagIcon}
        title="Built to keep you ahead."
        description="Real exposure data, turned into a score you can actually act on."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 md:grid-cols-3">
        <Reveal className="md:col-span-2">
          <div className={`h-full rounded-2xl border border-white/8 bg-white/3 p-9 ${cardHover}`}>
            <h3 className="text-2xl font-semibold tracking-tight text-ink">24 billion+ records, checked in seconds.</h3>
            <p className="mt-3 max-w-md text-base text-ink-muted">
              Every scan queries DeHashed&apos;s index of verified breach records, cross-checked
              against Have I Been Pwned for independent confirmation.
            </p>
            <RadarVisual />
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className={`h-full rounded-2xl border border-white/8 bg-white/3 p-9 ${cardHover}`}>
            <h3 className="text-2xl font-semibold tracking-tight text-ink">A score, not a guess.</h3>
            <p className="mt-3 text-base text-ink-muted">
              A Scikit-learn model weighs data sensitivity, breach recency, and repeat
              exposure into one risk score from 0–100.
            </p>
            <GaugeVisual />
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className={`h-full rounded-2xl border border-white/8 bg-white/3 p-9 ${cardHover}`}>
            <h3 className="text-2xl font-semibold tracking-tight text-ink">Take it with you.</h3>
            <p className="mt-3 text-base text-ink-muted">
              Export any result as a portable PDF you keep on your own device: your
              record, on your terms.
            </p>
            <BarsVisual />
          </div>
        </Reveal>

        <Reveal delay={200} className="md:col-span-2">
          <div className={`h-full rounded-2xl border border-white/8 bg-white/3 p-9 ${cardHover}`}>
            <h3 className="text-2xl font-semibold tracking-tight text-ink">Plain language, not a security degree.</h3>
            <p className="mt-3 max-w-md text-base text-ink-muted">
              OpenAI turns each breach&apos;s technical detail into a clear explanation of
              how you were exposed, plus specific steps to reduce the damage.
            </p>
            <AlertsVisual />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default Features
