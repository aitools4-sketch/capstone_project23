import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { BRAND_NAME } from '../brand'
import { liftGhost, underlineLink } from '../interactive'
import { ChevronDownIcon, ShieldIcon } from '../icons'

type NavLink = { label: string; href: string } | { label: string; to: string }

const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '#top' },
  { label: 'Security Basics', to: '/modules' },
  { label: 'Get Notified', href: '#notify' },
  { label: 'Breach Intelligence', to: '/breach-intelligence' },
  { label: 'Features', href: '#features' },
]

const ABOUT_LINKS: NavLink[] = [
  { label: 'Developer', to: '/developer' },
  { label: 'Mission', to: '/mission' },
  { label: 'Vision', to: '/vision' },
  { label: 'FAQs', to: '/faq' },
  { label: 'Terms of Use', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
]

function NavLinkItem({ link, onClick, className }: { link: NavLink; onClick?: () => void; className: string }) {
  if ('to' in link) {
    return (
      <Link to={link.to} onClick={onClick} className={className}>
        {link.label}
      </Link>
    )
  }

  const { href } = link

  function handleAnchorClick(e: ReactMouseEvent<HTMLAnchorElement>) {
    onClick?.()
    if (href === '#top') return

    const target = document.getElementById(href.slice(1))
    if (!target) return

    // These sections aren't full-viewport-tall, so the browser's default
    // top-alignment leaves them stranded near the top of the screen with
    // dead space below. Centering them in the viewport reads far better.
    e.preventDefault()
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <a href={href} onClick={handleAnchorClick} className={className}>
      {link.label}
    </a>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const aboutRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!aboutOpen) return
    function handleClickOutside(event: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(event.target as Node)) {
        setAboutOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [aboutOpen])

  useEffect(() => {
    if (!open && !aboutOpen) return
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        setAboutOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, aboutOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-canvas/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 text-ink">
          <ShieldIcon className="h-5 w-5 text-accent" />
          <span className="text-base font-semibold tracking-tight">{BRAND_NAME}</span>
        </a>

        <ul className="hidden items-center gap-8 text-sm text-ink-muted lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <NavLinkItem link={link} className={`${underlineLink} hover:text-ink`} />
            </li>
          ))}
          <li ref={aboutRef} className="relative">
            <button
              type="button"
              onClick={() => setAboutOpen((v) => !v)}
              className="flex items-center gap-1 transition-colors duration-150 hover:text-ink"
              aria-expanded={aboutOpen}
              aria-haspopup="true"
            >
              About
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${aboutOpen ? 'rotate-180' : ''}`} />
            </button>

            <div
              className={`absolute right-0 top-full mt-3 w-52 origin-top-right rounded-xl border border-white/10 bg-surface p-2 shadow-xl transition-all duration-150 ease-out motion-reduce:transition-none ${
                aboutOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
              }`}
            >
              {ABOUT_LINKS.map((item) => (
                <NavLinkItem
                  key={item.label}
                  link={item}
                  onClick={() => setAboutOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink"
                />
              ))}
            </div>
          </li>
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            to="/dashboard"
            className={`rounded-full border border-white/10 px-4 py-2 text-sm text-ink ${liftGhost}`}
          >
            Dashboard
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-ink transition-colors duration-300 hover:bg-white/5 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="sr-only">Toggle menu</span>
          <div className="relative flex h-3.5 w-4 items-center justify-center">
            <span
              className={`absolute h-0.5 w-4 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                open ? 'rotate-45' : '-translate-y-1.5'
              }`}
            />
            <span
              className={`absolute h-0.5 w-4 bg-current transition-transform duration-300 ease-out motion-reduce:transition-none ${
                open ? '-rotate-45' : 'translate-y-1.5'
              }`}
            />
          </div>
        </button>
      </nav>

      <div
        aria-hidden={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`border-t border-white/6 px-6 pb-6 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
              open ? 'opacity-100 delay-100' : 'opacity-0'
            }`}
          >
            <ul className="flex flex-col gap-4 pt-4 text-sm text-ink-muted">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <NavLinkItem link={link} onClick={() => setOpen(false)} className="block" />
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-white/6 pt-5">
              <p className="text-xs uppercase tracking-widest text-ink-faint">About</p>
              <ul className="mt-3 flex flex-col gap-3 text-sm text-ink-muted">
                {ABOUT_LINKS.map((item) => (
                  <li key={item.label}>
                    <NavLinkItem link={item} onClick={() => setOpen(false)} className="block" />
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-center text-sm text-ink"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
