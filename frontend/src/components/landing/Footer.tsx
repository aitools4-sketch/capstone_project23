import type { MouseEvent as ReactMouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { BRAND_NAME } from '../brand'
import { underlineLink } from '../interactive'
import { ShieldIcon } from '../icons'

type FooterLink = { label: string; href: string } | { label: string; to: string }

const COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', to: '/mission' },
      { label: 'Contact', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy', to: '/privacy' },
      { label: 'Terms of service', to: '/terms' },
    ],
  },
]

function FooterLinkItem({ link }: { link: FooterLink }) {
  const className = `${underlineLink} hover:text-ink-muted`
  if ('to' in link) {
    return (
      <Link to={link.to} className={className}>
        {link.label}
      </Link>
    )
  }

  const { href } = link

  function handleAnchorClick(e: ReactMouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(href.slice(1))
    if (!target) return

    // Same fix as the navbar: these sections aren't full-viewport-tall, so
    // the default top-alignment leaves them stranded near the top of the
    // screen instead of landing centered.
    e.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <a href={href} onClick={handleAnchorClick} className={className}>
      {link.label}
    </a>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/6">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <a href="#top" className="flex items-center gap-2 text-ink">
              <ShieldIcon className="h-5 w-5 text-accent" />
              <span className="text-base font-semibold tracking-tight">{BRAND_NAME}</span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-ink-muted">Know before they do.</p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-medium text-ink">{col.heading}</h3>
              <ul className="mt-4 flex flex-col gap-3 text-sm text-ink-muted">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-white/6 pt-8 text-xs text-ink-muted sm:mt-16 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <p>Designed &amp; built by the {BRAND_NAME} team.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
