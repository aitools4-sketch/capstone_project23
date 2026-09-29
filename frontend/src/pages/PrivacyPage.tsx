import MinimalNav from '../components/app/MinimalNav'
import LegalSection from '../components/app/LegalSection'
import { PRIVACY_INTRO, PRIVACY_LAST_UPDATED, PRIVACY_SECTIONS } from '../lib/privacyContent'

function PrivacyPage() {
  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Privacy Policy" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-ink-faint">Last updated {PRIVACY_LAST_UPDATED}</p>
        <p className="mt-6 max-w-xl text-ink-muted">{PRIVACY_INTRO}</p>

        <div className="mt-12">
          {PRIVACY_SECTIONS.map((section, i) => (
            <LegalSection key={section.title} id={`section-${i + 1}`} title={section.title}>
              {section.body}
            </LegalSection>
          ))}
        </div>
      </main>
    </div>
  )
}

export default PrivacyPage
