import { useState } from 'react'
import { Link } from 'react-router-dom'
import MinimalNav from '../components/app/MinimalNav'
import { ChevronDownIcon } from '../components/icons'
import { cardHover, underlineLink } from '../components/interactive'
import { BRAND_NAME } from '../components/brand'

type Faq = { q: string; a: string }

const CATEGORIES: { heading: string; items: Faq[] }[] = [
  {
    heading: 'General',
    items: [
      {
        q: `What is ${BRAND_NAME}?`,
        a: `${BRAND_NAME} checks whether an email address has appeared in a known data breach, then turns what it finds into a plain-language risk score and specific next steps, instead of a raw list of technical breach records.`,
      },
      {
        q: `Is ${BRAND_NAME} affiliated with Have I Been Pwned or DeHashed?`,
        a: `No. ${BRAND_NAME} is an independent project that queries DeHashed's and Have I Been Pwned's public APIs to cross-check breach data. Neither service endorses or operates ${BRAND_NAME}.`,
      },
      {
        q: 'Is scanning free?',
        a: 'Yes. Checking an email address costs nothing and doesn’t require an account. Signing in is only needed for ongoing monitoring, your full dashboard, and notifications.',
      },
    ],
  },
  {
    heading: 'How scanning works',
    items: [
      {
        q: 'What sources do you check?',
        a: 'Every scan queries DeHashed’s breach index and cross-checks the result against Have I Been Pwned for independent confirmation. A breach only shows up once it’s been publicly documented and verified, not the moment it happens.',
      },
      {
        q: 'Can I check a username, phone number, or social media handle?',
        a: 'Not yet. Scanning currently supports email addresses only, one per search.',
      },
      {
        q: 'How is my risk score calculated?',
        a: 'A model weighs three things: how sensitive the exposed data is (a plaintext password scores higher than just a username), how recently the breach happened, and how many separate breaches your email shows up in. Those combine into a single 0–100 score.',
      },
      {
        q: 'Why does it say "no exposure found"? Does that mean I’m completely safe?',
        a: 'It means your email hasn’t appeared in any breach we’ve been able to verify yet. It can’t rule out breaches that haven’t been publicly disclosed or discovered. Set up monitoring so you hear about it the moment that changes.',
      },
    ],
  },
  {
    heading: 'Data & privacy',
    items: [
      {
        q: 'Do you show me my exposed password?',
        a: 'No. If a password was exposed, we tell you that fact, never the actual value. Sensitive fields are masked before a result ever reaches your screen or gets stored.',
      },
      {
        q: 'What happens to the email I scan?',
        a: 'It’s sent to DeHashed and Have I Been Pwned to run the check, and the result is saved so it can be linked to your account if you sign in with that same address later. See our Privacy Policy for the full breakdown of what’s collected and why.',
      },
      {
        q: 'Can I delete my data?',
        a: 'Yes. Contact us and we’ll remove your account and associated scan history. See the Privacy Policy for details on your rights.',
      },
    ],
  },
  {
    heading: 'Account & security',
    items: [
      {
        q: 'Why is there no password to sign in?',
        a: 'We use passwordless magic-link sign-in: enter your email, click the link we send you, and you’re in. It means there’s no password of yours for us to store or for anyone to steal from us.',
      },
      {
        q: 'I didn’t get my sign-in email. What now?',
        a: 'Check your spam folder first. If it’s still not there after a minute, use "Resend link" on the sign-in screen. If it keeps failing, our email provider may be temporarily rate-limiting, so try again shortly.',
      },
      {
        q: 'Is it okay to check an email address that isn’t mine?',
        a: 'Only check addresses you own or are explicitly authorized to check on behalf of, for example as part of a security engagement or with a family member’s consent. See our Terms of Use for the full acceptable-use policy.',
      },
    ],
  },
]

function AccordionItem({ item, expanded, onToggle }: { item: Faq; expanded: boolean; onToggle: () => void }) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/3 ${cardHover}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <span className="text-sm font-medium text-ink">{item.q}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && <p className="border-t border-white/8 px-6 py-5 text-sm leading-relaxed text-ink-muted">{item.a}</p>}
    </div>
  )
}

function FaqPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="min-h-dvh text-ink">
      <MinimalNav step="FAQ" />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Frequently asked questions</h1>
        <p className="mt-4 max-w-xl text-ink-muted">
          Everything about how scanning, scoring, and your data work. Can&apos;t find what you need?{' '}
          <Link to="/contact" className={`text-ink ${underlineLink}`}>
            Contact us
          </Link>
          .
        </p>

        <div className="mt-14 flex flex-col gap-12">
          {CATEGORIES.map((cat) => (
            <div key={cat.heading}>
              <h2 className="text-sm font-medium uppercase tracking-widest text-ink-faint">{cat.heading}</h2>
              <div className="mt-4 flex flex-col gap-3">
                {cat.items.map((item) => {
                  const id = `${cat.heading}-${item.q}`
                  return (
                    <AccordionItem
                      key={id}
                      item={item}
                      expanded={openId === id}
                      onToggle={() => setOpenId((current) => (current === id ? null : id))}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default FaqPage
