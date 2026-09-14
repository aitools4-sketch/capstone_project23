import { useEffect, useState } from 'react'
import { cardHover } from '../interactive'
import { QuoteIcon } from '../icons'
import { fetchFeaturedFeedback, type FeaturedFeedback } from '../../lib/feedbackApi'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-1 text-lg leading-none" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'text-accent' : 'text-white/15'}>
          ★
        </span>
      ))}
    </div>
  )
}

function Testimonials() {
  const [feedback, setFeedback] = useState<FeaturedFeedback[] | null>(null)

  useEffect(() => {
    fetchFeaturedFeedback()
      .then(setFeedback)
      .catch(() => setFeedback([]))
  }, [])

  // Still loading, or no real feedback submitted through the dashboard
  // widget yet — an empty testimonials section reads as broken, so skip
  // rendering the whole thing rather than show a gap.
  if (!feedback || feedback.length === 0) return null

  const [featured, ...rest] = feedback

  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro icon={QuoteIcon} title="What our users say" description="Real feedback, straight from the dashboard." />

      <Reveal className="mx-auto mt-14 max-w-2xl text-center">
        <blockquote className="text-2xl font-medium leading-snug tracking-tight text-ink sm:text-3xl">
          &ldquo;{featured.comment}&rdquo;
        </blockquote>
        <div className="mt-6">
          <Stars rating={featured.rating} />
        </div>
      </Reveal>

      {rest.length > 0 && (
        <div className="mt-14 flex flex-wrap justify-center gap-4">
          {rest.map((t, i) => (
            <Reveal key={`${t.rating}-${t.comment}`} delay={i * 80} className="w-full max-w-xs sm:w-72">
              <div className={`h-full rounded-2xl border border-white/8 bg-white/3 p-7 ${cardHover}`}>
                <p className="text-base leading-relaxed text-ink-muted">&ldquo;{t.comment}&rdquo;</p>
                <div className="mt-5">
                  <Stars rating={t.rating} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}

export default Testimonials
