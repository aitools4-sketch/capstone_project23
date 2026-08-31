import type { ReactNode } from 'react'

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-white/8 py-8 first:border-t-0 first:pt-0">
      <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-ink-muted [&_a]:text-ink [&_a]:underline [&_a]:decoration-white/20 [&_a]:underline-offset-2 hover:[&_a]:decoration-white/40 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
        {children}
      </div>
    </section>
  )
}

export default LegalSection
