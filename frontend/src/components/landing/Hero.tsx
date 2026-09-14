import { Link } from 'react-router-dom'
import { liftPrimary, underlineLink } from '../interactive'
import { SparkleIcon } from '../icons'

function Hero() {
  return (
    <section id="top" className="relative scroll-mt-[4.5rem] overflow-hidden py-16 sm:py-20">
      {/* No Reveal wrapper here on purpose: the Hero is always the first
          thing in the viewport on load, so gating it behind Reveal's
          useLayoutEffect viewport measurement only adds a race window
          (rect vs. paint timing) with nothing to gain, since there's never
          a scroll event that needs to "reveal" it.

          scroll-mt-[4.5rem]: the browser's native #top anchor jump (and
          Navbar's "Home" link, which relies on that native jump rather than
          the custom scrollIntoView used elsewhere) aligns this section's
          top edge to the viewport's top edge — which is exactly where the
          sticky Navbar also sits, so without this the hero's first ~4.5rem
          (the eyebrow pill) renders hidden underneath the navbar whenever
          you land on #top from an already-scrolled position. This tells
          the browser to stop 4.5rem short, matching the navbar's height.

          min-h-[calc(76dvh_-_4.5rem)]: fills most (not all) of the first
          screen below the sticky Navbar (~4.5rem tall: py-4 padding + its
          tallest row content + border, see Navbar.tsx) and centers its
          content within that space via flex, instead of the old fixed
          top-padding scheme (pt-16 → lg:pt-40). That approach positioned
          the hero content in proportion to *breakpoint*, not actual
          viewport height, so short/tall viewports at the same breakpoint
          got visibly unbalanced spacing. 76dvh (not 100dvh) is deliberate:
          centering within the *full* viewport height left a large, empty
          top gap above the eyebrow pill on tall viewports — content was
          technically centered, but read as floating with dead space above
          it. Shrinking the box centering happens within pulls the content
          up without reintroducing the old breakpoint-based padding bug.
          dvh (not vh) so mobile browsers with a collapsing address bar
          don't overshoot. py-16/py-20 above is just a floor for very short
          viewports (landscape phones) — min-height never lets content get
          clipped, it only ever adds room if the content itself needs more. */}
      <div className="mx-auto flex min-h-[calc(76dvh_-_4.5rem)] max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-4 py-1.5 text-xs font-medium text-ink">
          <SparkleIcon className="h-3.5 w-3.5 text-accent" />
          AI risk scoring
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75 motion-reduce:animate-none" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        </p>
        <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
          <span className="block">Every second you wait</span>
          <span className="block text-ink-muted">is another opportunity for attackers.</span>
        </h1>
        <p className="mx-auto mt-8 max-w-lg text-lg text-ink-muted sm:text-xl">
          Monitor your digital identity against billions of breach records and take action
          before compromised data is exploited.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Link
            to="/scan"
            className={`rounded-full bg-ink px-8 py-3.5 text-base font-medium text-canvas hover:bg-white ${liftPrimary}`}
          >
            Scan your email
          </Link>
          <a href="#how-it-works" className={`text-base font-medium text-ink-muted ${underlineLink} hover:text-ink`}>
            Know more →
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-ink-faint">
          <Link to="/terms" className={`${underlineLink} hover:text-ink-muted`}>
            Terms of Use
          </Link>
          <Link to="/faq" className={`${underlineLink} hover:text-ink-muted`}>
            FAQs
          </Link>
          <Link to="/privacy" className={`${underlineLink} hover:text-ink-muted`}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero
