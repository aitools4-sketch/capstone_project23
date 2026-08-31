import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  delay?: number
  className?: string
}

function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [skipAnimation, setSkipAnimation] = useState(false)

  // If this is already inside the viewport the moment it mounts — the Hero,
  // or a page's own header — there's no scroll event coming to "reveal" it.
  // Show it immediately instead of racing an IntersectionObserver against
  // first paint, which could otherwise leave it invisible for a beat.
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    // Measured with the not-yet-visible translate-y-4 offset neutralized:
    // getBoundingClientRect() reflects transforms, so without this an
    // element whose resting position straddles the viewport edge could be
    // measured 16px lower than where it actually sits, wrongly skip the
    // instant-show path, and sit invisible until a scroll event that may
    // never come (nothing below the fold to scroll to on a short page).
    // Reverted immediately after, before this frame paints.
    const previousTransform = node.style.transform
    node.style.transform = 'none'
    const rect = node.getBoundingClientRect()
    node.style.transform = previousTransform
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setSkipAnimation(true)
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (skipAnimation) return
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [skipAnimation])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: !skipAnimation && visible ? `${delay}ms` : '0ms' }}
      className={`${skipAnimation ? '' : 'transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none'} ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default Reveal
