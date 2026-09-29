import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import LegalSection from '../components/app/LegalSection'
import { ShieldIcon } from '../components/icons'
import { underlineLink } from '../components/interactive'
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

function sectionId(index: number): string {
  return `section-${index + 1}`
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  )
}

function TermsPage() {
  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Terms of Use" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        {/* Document header — styled as a cover sheet, the way a formal
            agreement's title page is set apart from its body text. */}
        <div className="rounded-2xl border border-white/10 bg-white/3 px-6 py-8 text-center sm:px-10 sm:py-10">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/4">
            <ShieldIcon className="h-5 w-5 text-accent" />
          </div>
          <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-ink-faint">Legal Agreement</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            End User License Agreement &amp; Terms of Service
          </h1>
          <p className="mt-3 text-ink-muted">AI-Powered Digital Identity Leak Scanner and Risk Scoring Platform</p>

          <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-5 border-t border-white/8 pt-6 text-left sm:grid-cols-4">
            <MetaField label="Document version" value={TERMS_DOCUMENT_VERSION} />
            <MetaField label="Effective date" value={TERMS_EFFECTIVE_DATE} />
            <MetaField label="Jurisdiction" value={TERMS_JURISDICTION} />
            <MetaField label="Compliance standard" value={TERMS_COMPLIANCE_STANDARD} />
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-ink-faint">Last updated {TERMS_LAST_UPDATED}</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm leading-relaxed text-ink-muted">{TERMS_IMPORTANT_NOTICE}</p>
        </div>

        {/* Table of contents — a formal document is navigated by section,
            not read start to finish in one sitting. */}
        <nav aria-label="Table of contents" className="mt-8 rounded-2xl border border-white/8 bg-white/3 p-6 sm:p-8">
          <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">Table of contents</p>
          <ol className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {TERMS_SECTIONS.map((section, i) => (
              <li key={section.title}>
                <a
                  href={`#${sectionId(i)}`}
                  className={`text-sm text-ink-muted ${underlineLink} hover:text-ink`}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-4">
          {TERMS_SECTIONS.map((section, i) => (
            <LegalSection key={section.title} id={sectionId(i)} title={section.title}>
              {section.body}
            </LegalSection>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/4 p-6">
          <p className="text-sm leading-relaxed text-ink-muted">{TERMS_ACKNOWLEDGMENT}</p>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-white/8 pt-8 text-center">
          <p className="text-xs text-ink-faint">
            This Agreement is also referenced from the sign-up consent notice. See our{' '}
            <Link to="/privacy" className={`text-ink-muted ${underlineLink} hover:text-ink`}>
              Privacy Policy
            </Link>{' '}
            for how personal data is collected and used.
          </p>
        </div>
      </main>
    </div>
  )
}

export default TermsPage
