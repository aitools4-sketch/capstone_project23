import { ActivityIcon, LayersIcon, LockIcon, MailIcon, ShieldIcon, SparkleIcon } from '../icons'
import Reveal from './Reveal'

const SOURCES = [
  { name: 'DeHashed', icon: ShieldIcon },
  { name: 'Have I Been Pwned', icon: LockIcon },
  { name: 'Scikit-learn', icon: LayersIcon },
  { name: 'OpenAI', icon: SparkleIcon },
  { name: 'FastAPI', icon: ActivityIcon },
  { name: 'Supabase', icon: MailIcon },
]

function DataSources() {
  return (
    <section className="border-y border-white/6 bg-white/2 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-widest text-ink-faint">Trusted data &amp; infrastructure</p>
        </Reveal>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {SOURCES.map((source, i) => (
            <Reveal key={source.name} delay={i * 60}>
              <span className="flex items-center gap-2 text-ink-faint grayscale transition hover:text-ink-muted hover:grayscale-0">
                <source.icon className="h-5 w-5" />
                <span className="text-base font-medium">{source.name}</span>
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DataSources
