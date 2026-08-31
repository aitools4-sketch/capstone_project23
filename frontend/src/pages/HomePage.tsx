import ActivityPreview from '../components/landing/ActivityPreview'
import Audience from '../components/landing/Audience'
import CTA from '../components/landing/CTA'
import DataSources from '../components/landing/DataSources'
import Features from '../components/landing/Features'
import Footer from '../components/landing/Footer'
import Hero from '../components/landing/Hero'
import HowItWorks from '../components/landing/HowItWorks'
import Navbar from '../components/landing/Navbar'
import Problem from '../components/landing/Problem'
import SectionGlow from '../components/landing/SectionGlow'
import Testimonials from '../components/landing/Testimonials'
import Transparency from '../components/landing/Transparency'

function HomePage() {
  return (
    <div className="min-h-dvh text-ink">
      <Navbar />
      <main>
        <Hero />
        <div className="relative">
          <SectionGlow />
          <Problem />
        </div>
        <div className="relative">
          <SectionGlow />
          <Features />
        </div>
        <div className="relative">
          <SectionGlow />
          <Testimonials />
        </div>
        <HowItWorks />
        <DataSources />
        <Audience />
        <ActivityPreview />
        <CTA />
        <Transparency />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage
