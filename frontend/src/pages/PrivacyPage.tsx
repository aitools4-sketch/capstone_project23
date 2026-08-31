import MinimalNav from '../components/app/MinimalNav'
import LegalSection from '../components/app/LegalSection'
import { BRAND_NAME } from '../components/brand'

const LAST_UPDATED = 'August 27, 2026'

function PrivacyPage() {
  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Privacy Policy" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-sm text-ink-faint">Last updated {LAST_UPDATED}</p>
        <p className="mt-6 max-w-xl text-ink-muted">
          This explains what {BRAND_NAME} collects, why, who it&apos;s shared with, and the rights you have over
          it. Written to match, in plain language, what the Republic of the Philippines&apos; Data Privacy Act
          of 2012 (RA 10173) requires.
        </p>

        <div className="mt-12">
          <LegalSection title="1. What we collect">
            <ul>
              <li><strong>Email address</strong>: the one you scan, and the one you sign in with (usually the same).</li>
              <li><strong>Scan results</strong>: which breaches your email matched, the data types exposed in each (never the actual exposed values, see §4), and your computed risk score.</li>
              <li><strong>Account & session data</strong>: handled by our authentication provider (Supabase) to keep you signed in. We never see or store a password, because {BRAND_NAME} doesn&apos;t use one.</li>
              <li><strong>Optional feedback</strong>: if you rate a scan or leave a comment, that text is stored with your session.</li>
            </ul>
            <p>We do not collect payment information, government IDs, or any data beyond what&apos;s listed above.</p>
          </LegalSection>

          <LegalSection title="2. How we use it">
            <ul>
              <li>To run the breach check you asked for and show you the result.</li>
              <li>To link a scan you ran before signing in to your account, the first time you verify that same email address (so your history isn&apos;t lost).</li>
              <li>To send you the sign-in link you requested, and, if you&apos;ve set up monitoring, to alert you when a new breach involving your email appears.</li>
              <li>To generate the PDF report you explicitly choose to download.</li>
            </ul>
            <p>We do not use your data for advertising, and we do not sell it to anyone.</p>
          </LegalSection>

          <LegalSection title="3. Who we share it with">
            <p>Running a scan necessarily means sending the email address to the services that check it:</p>
            <ul>
              <li><strong>DeHashed</strong> and <strong>Have I Been Pwned</strong>: receive the email address you&apos;re checking, to search their breach records. They are independent services with their own privacy practices.</li>
              <li><strong>Supabase</strong>: our infrastructure provider, hosting the database and handling authentication. They process data on our behalf under their own security commitments.</li>
              <li><strong>Our email provider (Resend)</strong>: sends the sign-in links and breach-alert emails on our behalf; it sees the recipient address and message content, nothing more.</li>
            </ul>
            <p>
              We don&apos;t share your data with anyone else, and we don&apos;t share it for marketing purposes.
              As AI-generated insights are added to the service, they will call OpenAI&apos;s API with your scan
              data to generate an explanation. This policy will be updated when that&apos;s live.
            </p>
          </LegalSection>

          <LegalSection title="4. How we protect it">
            <ul>
              <li><strong>Sensitive fields are never surfaced in raw form.</strong> If a breach exposed a password, we tell you that fact, never the actual value. This masking happens on our server before a result is ever sent to your browser or written to storage.</li>
              <li><strong>Row-level access control</strong> is enabled on every table holding your data, so it&apos;s only readable by your own account even at the database level.</li>
              <li><strong>All traffic is encrypted in transit</strong> (HTTPS/TLS), including requests to DeHashed and Have I Been Pwned.</li>
              <li><strong>Server-side authorization</strong>: every request for your data independently re-verifies who you are; nothing is trusted just because a client claims it.</li>
            </ul>
          </LegalSection>

          <LegalSection title="5. Guest scans">
            <p>
              You can run a scan without an account. That result is stored, unlinked to any identity, until the
              same email address signs in and verifies for the first time, at which point it&apos;s
              automatically attached to that account. If you never sign in with that address, it stays unlinked
              and isn&apos;t tied to anyone.
            </p>
          </LegalSection>

          <LegalSection title="6. How long we keep it">
            <p>
              We keep your scan history and account data for as long as your account is active, so your
              dashboard and monitoring keep working. If you delete your account, we delete the associated scan
              history and personal data within a reasonable period, except where we&apos;re required to retain
              something for legal or security reasons.
            </p>
          </LegalSection>

          <LegalSection title="7. Your rights">
            <p>Under RA 10173, you have the right to:</p>
            <ul>
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Correct</strong> inaccurate or outdated data.</li>
              <li><strong>Object to or withdraw consent</strong> for processing, where applicable.</li>
              <li><strong>Erasure or blocking</strong> of data that&apos;s no longer necessary, unlawfully obtained, or used for an unauthorized purpose.</li>
              <li><strong>Data portability</strong>: get a copy of your data in a usable, portable format.</li>
              <li><strong>File a complaint</strong> with the National Privacy Commission if you believe your rights have been violated.</li>
            </ul>
            <p>To exercise any of these, contact us using the details below.</p>
          </LegalSection>

          <LegalSection title="8. Cookies and local storage">
            <p>
              We use your browser&apos;s local storage to keep you signed in between visits. This is
              functionally required for the service to work and isn&apos;t used for tracking or advertising. We
              don&apos;t use third-party analytics or ad-tracking cookies.
            </p>
          </LegalSection>

          <LegalSection title="9. Children's privacy">
            <p>
              {BRAND_NAME} isn&apos;t directed at children under 13, and we don&apos;t knowingly collect data
              from them. If you believe a child has used the service and provided personal data, contact us and
              we&apos;ll remove it.
            </p>
          </LegalSection>

          <LegalSection title="10. Changes to this policy">
            <p>
              If this policy changes materially, we&apos;ll update the date at the top of this page. We
              encourage checking back periodically, especially before signing in with a new email address.
            </p>
          </LegalSection>

          <LegalSection title="11. Contact us">
            <p>
              For privacy questions, data requests, or to exercise any of the rights above, reach us at{' '}
              <a href="mailto:claudeaisubscription04@gmail.com">claudeaisubscription04@gmail.com</a>.
            </p>
          </LegalSection>
        </div>
      </main>
    </div>
  )
}

export default PrivacyPage
