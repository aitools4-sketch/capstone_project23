import { LayersIcon } from '../icons'
import { cardHover } from '../interactive'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

const GROUPS = [
  {
    title: 'Individual users',
    description:
      'See whether your email has turned up in a breach without needing a security background to understand what it means. A clear score and next steps, not a wall of raw data.',
  },
  {
    title: 'Students & young professionals',
    description:
      'Job applications, school accounts, and social logins all run through the same email address. Catch exposure early, before it costs you an account or an opportunity.',
  },
  {
    title: 'IT developers',
    description:
      'A working reference for wiring DeHashed, Scikit-learn, and OpenAI into one risk-scoring pipeline: secure system design and API integration, not just theory.',
  },
  {
    title: 'Security practitioners',
    description:
      'Dashboards built to surface breach trends and commonly exposed identifiers at a glance. Built for individual use, not enterprise deployment, but the pattern adapts.',
  },
]

function Audience() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro
        icon={LayersIcon}
        title="Who this is for."
        description="Built for one person checking one email, useful well beyond that, too."
      />

      <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {GROUPS.map((group, i) => (
          <Reveal key={group.title} delay={i * 80}>
            <div className={`h-full rounded-2xl border border-white/8 bg-white/3 p-7 ${cardHover}`}>
              <h3 className="text-base font-semibold tracking-tight text-ink">{group.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{group.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Audience
