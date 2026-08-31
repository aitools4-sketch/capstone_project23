import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import LegalSection from '../components/app/LegalSection'
import { BRAND_NAME } from '../components/brand'

const LAST_UPDATED = 'August 27, 2026'

function TermsPage() {
  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="Terms of Use" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Terms of Use</h1>
        <p className="mt-4 text-sm text-ink-faint">Last updated {LAST_UPDATED}</p>
        <p className="mt-6 max-w-xl text-ink-muted">
          These terms govern your use of {BRAND_NAME}. By scanning an email address, creating an account, or
          otherwise using the service, you agree to them.
        </p>

        <div className="mt-12">
          <LegalSection title="1. What this service is">
            <p>
              {BRAND_NAME} lets you check whether an email address has appeared in a publicly disclosed data
              breach, and turns the result into a risk score and recommended next steps. Breach data is sourced
              from third-party providers (currently DeHashed and Have I Been Pwned) via their public APIs.{' '}
              {BRAND_NAME} does not itself hack, scrape, or independently verify breach data; it queries and
              interprets data these providers have already documented.
            </p>
          </LegalSection>

          <LegalSection title="2. Accuracy and limitations">
            <p>Breach data has real limits, and you should treat results accordingly:</p>
            <ul>
              <li>Results reflect breaches that have been publicly disclosed and verified, not real-time reporting. A breach can exist and not yet appear here.</li>
              <li>A "no exposure found" result means nothing was found in the sources we check, not a guarantee that an address has never been compromised.</li>
              <li>Scanning currently supports one email address per search; other identifiers (usernames, phone numbers, social handles) aren&apos;t supported yet.</li>
            </ul>
            <p>
              Risk scores and recommendations are generated automatically and are informational only. They are
              not professional cybersecurity, legal, or financial advice, and {BRAND_NAME} is not a substitute
              for consulting a qualified professional about a specific incident.
            </p>
          </LegalSection>

          <LegalSection title="3. Eligibility">
            <p>
              You must be at least 13 years old to use {BRAND_NAME}. If you are under the age of majority in
              your jurisdiction, you may only use the service with the involvement of a parent or guardian.
            </p>
          </LegalSection>

          <LegalSection title="4. Accounts and sign-in">
            <p>
              {BRAND_NAME} uses passwordless, email-based ("magic link") sign-in: there is no password for you
              to create or for us to store. You&apos;re responsible for keeping access to the email address tied
              to your account secure, since anyone with access to that inbox can sign in as you. Notify us
              immediately if you believe your account has been accessed without authorization.
            </p>
          </LegalSection>

          <LegalSection title="5. Acceptable use">
            <p>You agree to use {BRAND_NAME} only to:</p>
            <ul>
              <li>Check email addresses you own, or are explicitly authorized to check on behalf of another person or organization.</li>
              <li>Use the service at a reasonable, human pace consistent with normal individual use.</li>
            </ul>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service to check email addresses in bulk, to build a database of other people&apos;s exposure without authorization, or for stalking, harassment, doxxing, or any other harmful purpose.</li>
              <li>Attempt to bypass rate limits, scrape the service programmatically outside any API we explicitly publish, or interfere with its normal operation.</li>
              <li>Use any automated means to access the service except as we expressly permit.</li>
              <li>Misrepresent your identity or impersonate another person when using the service.</li>
            </ul>
            <p>
              We may suspend or terminate access for anyone who violates these terms, without notice, especially
              where doing so is necessary to protect other users or the integrity of the service.
            </p>
          </LegalSection>

          <LegalSection title="6. Third-party services">
            <p>
              Running a scan sends the email address you enter to DeHashed and Have I Been Pwned so they can
              check it against their breach records. Their own terms and privacy practices govern how they
              handle that request; we don&apos;t control and aren&apos;t responsible for their availability,
              accuracy, or data practices. See our{' '}
              <Link to="/privacy">Privacy Policy</Link> for how {BRAND_NAME} itself handles what you submit.
            </p>
          </LegalSection>

          <LegalSection title="7. Intellectual property">
            <p>
              The {BRAND_NAME} name, branding, and the design and code of this service belong to its creators.
              Breach metadata surfaced through the service belongs to the respective third-party providers who
              documented it. You may download and keep your own scan reports (including as PDF) for personal
              record-keeping.
            </p>
          </LegalSection>

          <LegalSection title="8. Disclaimer of warranties">
            <p>
              {BRAND_NAME} is provided "as is" and "as available," without warranties of any kind, express or
              implied, including (to the extent permitted by law) any implied warranty of merchantability,
              fitness for a particular purpose, or non-infringement. We don&apos;t warrant that the service will
              be uninterrupted, error-free, or that breach data returned is complete or fully accurate.
            </p>
          </LegalSection>

          <LegalSection title="9. Limitation of liability">
            <p>
              To the maximum extent permitted by law, {BRAND_NAME} and its creators are not liable for any
              indirect, incidental, special, or consequential damages arising from your use of, or inability to
              use, the service, including damages resulting from a breach the service did not detect, or from
              action you took (or didn&apos;t take) based on a result it returned.
            </p>
          </LegalSection>

          <LegalSection title="10. Changes to these terms">
            <p>
              We may update these terms as the service changes. Material changes will be reflected by updating
              the date at the top of this page. Continuing to use {BRAND_NAME} after changes take effect means
              you accept the updated terms.
            </p>
          </LegalSection>

          <LegalSection title="11. Governing law">
            <p>
              <em>To be confirmed. This section has not yet had a legal review and should not be relied on as final.</em>
            </p>
          </LegalSection>

          <LegalSection title="12. Contact">
            <p>
              Questions about these terms? Reach us at{' '}
              <a href="mailto:claudeaisubscription04@gmail.com">claudeaisubscription04@gmail.com</a>.
            </p>
          </LegalSection>
        </div>
      </main>
    </div>
  )
}

export default TermsPage
