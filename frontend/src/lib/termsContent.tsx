import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BRAND_NAME } from '../components/brand'

// Single source of truth for the EULA/Terms of Service — used by both
// TermsPage.tsx (the full standalone page) and ConsentBanner.tsx (the
// scrollable inline copy shown before someone can agree to it), so the two
// can never drift out of sync with each other.

export const TERMS_LAST_UPDATED = 'October 1, 2026'
export const TERMS_EFFECTIVE_DATE = 'October 1, 2026'
export const TERMS_DOCUMENT_VERSION = 'v1.0 (Production)'
export const TERMS_JURISDICTION = 'Republic of the Philippines'
export const TERMS_COMPLIANCE_STANDARD = 'RA 10173 (Data Privacy Act)'

export const TERMS_IMPORTANT_NOTICE: ReactNode = (
  <>
    <strong className="text-ink">Important notice:</strong> please read this End User License Agreement and Terms of
    Service (&quot;Agreement&quot;) carefully before accessing or using the platform. By creating an account,
    inputting an identifier, or executing an identity leak scan, you agree to be bound by all terms and conditions
    stated herein.
  </>
)

export const TERMS_ACKNOWLEDGMENT: ReactNode = (
  <>
    <strong className="text-ink">User acknowledgment:</strong> by continuing to use the AI-Powered Digital Identity
    Leak Scanner and Risk Scoring Platform, you certify that you are at least 18 years of age (or have legal parental
    consent), have read this document in full, and consent to all terms, data processing procedures, and usage
    limits stated herein.
  </>
)

export type TermsSection = { title: string; body: ReactNode }

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: '1. Legal agreement & acceptance',
    body: (
      <>
        <p>
          This End User License Agreement and Terms of Service is a binding legal contract between the end-user
          (&quot;User,&quot; &quot;You&quot;) and the platform developers, administrators, and affiliated academic
          researchers (&quot;Platform Providers,&quot; &quot;We,&quot; &quot;Us&quot;). This Agreement governs your
          access to and use of the web application, APIs, AI risk scoring engine, automated alert systems, and
          downloadable report features.
        </p>
        <p>
          If you do not agree to the terms of this Agreement, you must immediately refrain from accessing the
          service, creating an account, or submitting any digital identity attributes for processing.
        </p>
      </>
    ),
  },
  {
    title: '2. Scope of service & platform purpose',
    body: (
      <>
        <p>
          The platform operates as a personal digital security monitoring and identity risk awareness system. The
          primary functionality includes:
        </p>
        <ul>
          <li>
            Scanning verified public and dark web breach repositories using integrated third-party APIs (including
            DeHashed and Have I Been Pwned).
          </li>
          <li>
            Executing an automated machine learning risk assessment (Scikit-learn) to calculate a quantified
            numerical Risk Score (0&ndash;100) based on data sensitivity, breach recency, and exposure frequency.
          </li>
          <li>Generating generative-AI dynamic security insights and mitigation strategies via Anthropic&apos;s Claude API.</li>
          <li>Providing visual security dashboards, automated email alerts, and downloadable summary reports (PDF format).</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. Individual & personal use scope',
    body: (
      <>
        <p>
          The service is licensed strictly for individual, non-commercial, personal identity monitoring. You are
          explicitly prohibited from deploying this platform as an enterprise monitoring tool, commercial managed
          security service (MSSP), or organizational bulk auditing system without prior express written
          authorization.
        </p>
        <p>
          <strong>Restriction:</strong> the platform enforces a strict single-identifier authorization policy. Users
          may only submit email addresses, usernames, or identifiers that they personally own, control, or have
          explicit legal permission to inspect.
        </p>
      </>
    ),
  },
  {
    title: '4. Permissible use & strictly prohibited conduct',
    body: (
      <>
        <p>
          You agree to use the service in compliance with all applicable local, national, and international laws,
          specifically including Republic Act No. 10173 (Philippine Data Privacy Act of 2012) and Republic Act No.
          10175 (Cybercrime Prevention Act of 2012).
        </p>
        <p>Under this agreement, you explicitly covenant that you shall not:</p>
        <ul>
          <li>
            Submit email addresses or personal identifiers belonging to third-party individuals, public figures, or
            corporate entities without verified legal consent.
          </li>
          <li>
            Utilize information retrieved from the platform to perform extortion, harassment, credential stuffing,
            account takeover, targeted phishing, or any malicious cyber operation.
          </li>
          <li>
            Attempt to bypass, reverse engineer, decompile, or overload the backend architecture, including Supabase
            databases, FastAPI endpoints, or third-party API gateways.
          </li>
          <li>
            Use automated scripts, web scrapers, bots, or unauthorized multi-threading tools to query the platform or
            extract breach intelligence at scale.
          </li>
          <li>
            Repackage, resell, lease, or sub-license platform data, AI insights, or generated PDF risk assessment
            reports for financial gain.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '5. Data privacy, masking & sovereignty',
    body: (
      <>
        <p>
          We are committed to maintaining strict data privacy standards in accordance with RA 10173. The platform
          implements specific technical safeguards to protect your identity:
        </p>
        <ul>
          <li>
            <strong>User identifiers:</strong> queried against breach databases via API; processed in-memory,
            strictly bound to your session.
          </li>
          <li>
            <strong>Exposed passwords:</strong> our systems never retrieve or store an actual password value
            (plaintext or hashed) at all &mdash; only the fact that a password-type field was present in a breach
            record is kept, shown to you as a masked label (for example, &quot;Plaintext password exposed&quot;),
            never the underlying value itself.
          </li>
          <li>
            <strong>Account credentials:</strong> Supabase magic-link authentication; encrypted at rest and in
            transit via SSL/TLS.
          </li>
          <li>
            <strong>PDF risk reports:</strong> generated server-side, on demand, for your download only.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '6. Third-party integrations & data limitations',
    body: (
      <>
        <p>
          You acknowledge and agree that the platform relies on third-party security intelligence providers
          (DeHashed API, Have I Been Pwned API) and Anthropic&apos;s Claude API for generative AI features. As a
          consequence:
        </p>
        <ul>
          <li>
            <strong>Detection latency:</strong> breach results rely on historically verified and documented security
            research. There is an inherent time delay between an actual security breach occurrence and its
            availability in public or dark web repositories.
          </li>
          <li>
            <strong>Exclusion of unverified breaches:</strong> the platform cannot detect breach events that remain
            unverified, unreleased, or restricted within private hacker communities.
          </li>
          <li>
            <strong>Coverage boundaries:</strong> scanning is currently restricted to verified digital identifiers
            (e.g., email addresses) and does not inspect closed social media networks (X/Twitter, Facebook,
            Instagram).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '7. AI models & disclaimer of warranty',
    body: (
      <>
        <p>
          The platform utilizes Scikit-learn machine learning algorithms for risk scoring and Anthropic&apos;s Claude
          models for generating security recommendations. While these models are trained to provide high-fidelity
          security insights,{' '}
          <strong>the service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.</strong>
        </p>
        <ul>
          <li>
            Risk scores (0&ndash;100) are probabilistic estimations based on data sensitivity, recency, and
            frequency, and should be treated as indicative guidance rather than absolute factual guarantees.
          </li>
          <li>
            AI insights are generated natural-language explanations intended to raise digital literacy. They do not
            constitute formal legal, corporate, or financial cybersecurity consulting advice.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '8. Limitation of liability',
    body: (
      <>
        <p>
          To the maximum extent permitted by applicable law, the Platform Providers, developers, affiliated academic
          institutions (including Our Lady of Lourdes College), and third-party API vendors shall not be held liable
          for any direct, indirect, incidental, consequential, or punitive damages arising out of:
        </p>
        <ul>
          <li>Your inability to prevent identity theft or cyber fraud despite using the platform.</li>
          <li>Inaccuracies, omissions, or delays in third-party breach database feeds.</li>
          <li>Unauthorized access to or alteration of your transmissions or data.</li>
          <li>System outages, network latency, or API downtime beyond our reasonable control.</li>
        </ul>
      </>
    ),
  },
  {
    title: '9. Intellectual property',
    body: (
      <p>
        All software architecture, machine learning models, UI/UX designs, dashboard layouts, branding, and dynamic
        reporting mechanisms are the exclusive intellectual property of the platform developers and rights holders.
        Nothing in this Agreement transfers ownership rights or grants licenses beyond the limited right to personal
        use.
      </p>
    ),
  },
  {
    title: '10. Termination & governance',
    body: (
      <>
        <p>
          We reserve the right to suspend or terminate your account access immediately, without prior notice, if you
          violate any provision of this Agreement or engage in activities that threaten platform security or
          third-party rights.
        </p>
        <p>
          This Agreement shall be governed by and construed in accordance with the laws of the {TERMS_JURISDICTION}.
          Any legal disputes arising under this agreement shall be submitted exclusively to the competent courts of
          Valenzuela City, Metro Manila.
        </p>
      </>
    ),
  },
  {
    title: '11. Contact',
    body: (
      <p>
        Questions about this Agreement? Reach us at{' '}
        <a href="mailto:claudeaisubscription04@gmail.com">claudeaisubscription04@gmail.com</a>. See our{' '}
        <Link to="/privacy">Privacy Policy</Link> for the full breakdown of what {BRAND_NAME} itself collects and how
        it&apos;s used.
      </p>
    ),
  },
]
