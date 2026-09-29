import MinimalNav from '../components/app/MinimalNav'
import LegalSection from '../components/app/LegalSection'
import {
  TERMS_ACKNOWLEDGMENT,
  TERMS_COMPLIANCE_STANDARD,
  TERMS_DOCUMENT_VERSION,
  TERMS_EFFECTIVE_DATE,
  TERMS_IMPORTANT_NOTICE,
  TERMS_JURISDICTION,
  TERMS_LAST_UPDATED,
  TERMS_SECTIONS,
} from '../lib/termsContent'

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="mt-1 text-sm text-ink">{value}</p>
    </div>
  )
}

function TermsPage() {
  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Terms of Use" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          End User License Agreement &amp; Terms of Service
        </h1>
        <p className="mt-4 max-w-xl text-ink-muted">
          AI-Powered Digital Identity Leak Scanner and Risk Scoring Platform
        </p>
        <p className="mt-2 text-sm text-ink-faint">Last updated {TERMS_LAST_UPDATED}</p>

        <div className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-white/8 bg-white/3 p-6 sm:grid-cols-4">
          <MetaField label="Document version" value={TERMS_DOCUMENT_VERSION} />
          <MetaField label="Effective date" value={TERMS_EFFECTIVE_DATE} />
          <MetaField label="Jurisdiction" value={TERMS_JURISDICTION} />
          <MetaField label="Compliance standard" value={TERMS_COMPLIANCE_STANDARD} />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm leading-relaxed text-ink-muted">{TERMS_IMPORTANT_NOTICE}</p>
        </div>

        <div className="mt-12">
          {TERMS_SECTIONS.map((section) => (
            <LegalSection key={section.title} title={section.title}>
              {section.body}
            </LegalSection>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm leading-relaxed text-ink-muted">{TERMS_ACKNOWLEDGMENT}</p>
        </div>
      </main>
    </div>
  )
}

export default TermsPage
