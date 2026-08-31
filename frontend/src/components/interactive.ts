// Every interactive element in the app composes one of these strings, so
// this is also where the site's only focus-visible treatment lives. None
// of these previously defined a `focus-visible:` state at all — every
// button and link in the app relied on the browser's default outline,
// which Tailwind's preflight resets to `outline: none` globally. The net
// effect was zero visible focus indicator anywhere for keyboard users
// (fails WCAG 2.4.7, AA). `focus-visible` (not `focus`) so mouse/touch
// clicks still don't show a ring — only real keyboard navigation does.
const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas'

export const liftPrimary = `transition-colors duration-150 hover:bg-white active:bg-white/90 ${focusRing}`

export const liftGhost = `transition-colors duration-150 hover:border-white/25 hover:bg-white/5 active:bg-white/10 ${focusRing}`

export const underlineLink = `group relative transition-colors duration-150 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-150 hover:after:w-full ${focusRing} rounded-xs`

export const cardHover = 'transition-colors duration-150 hover:border-white/20'

export const rowHover = 'transition-colors duration-150 hover:bg-white/4'
