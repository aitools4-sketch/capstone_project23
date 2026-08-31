import { BRAND_NAME } from '../brand'
import { ListIcon } from '../icons'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

const STEPS = [
  {
    number: '01',
    title: 'Enter your email',
    description: 'No account needed. Just the address you want checked.',
  },
  {
    number: '02',
    title: 'We scan everything',
    description: 'DeHashed and HIBP, queried against billions of records.',
  },
  {
    number: '03',
    title: 'Get your risk score',
    description: 'Weighted, explained, and easy to act on.',
  },
  {
    number: '04',
    title: 'Stay ahead of it',
    description: 'Sign in to track your score and get alerted first.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro
        icon={ListIcon}
        title={`How ${BRAND_NAME} works`}
        description="A single email. A full picture. Under a minute."
      />

      <div className="mt-16 divide-y divide-white/8 border-y border-white/8">
        {STEPS.map((step, i) => (
          <Reveal key={step.number} delay={i * 80}>
            <div className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:gap-12">
              <span className="text-6xl font-semibold text-white/10 sm:w-24 sm:text-7xl">{step.number}</span>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{step.title}</h3>
                <p className="mt-1.5 max-w-md text-base text-ink-muted">{step.description}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default HowItWorks
