import type { ComponentType } from 'react'
import Reveal from './Reveal'

type SectionIntroProps = {
  icon: ComponentType<{ className?: string }>
  title: string
  description: string
}

function SectionIntro({ icon: Icon, title, description }: SectionIntroProps) {
  return (
    <Reveal className="mx-auto max-w-xl text-center">
      <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <h2 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{title}</h2>
      <p className="mt-5 text-lg text-ink-muted">{description}</p>
    </Reveal>
  )
}

export default SectionIntro
