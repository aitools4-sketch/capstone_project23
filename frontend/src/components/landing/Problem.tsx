import { BugIcon } from '../icons'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

function Problem() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro
        icon={BugIcon}
        title="Your antivirus stops at your device."
        description="Breaches happen on someone else's server. That's the gap nothing on your computer can see."
      />

      <Reveal className="mx-auto mt-8 max-w-2xl text-center">
        <p className="text-base text-ink-muted sm:text-lg">
          Firewalls and antivirus software were built to protect the device in front of
          you, not to watch what happens after your email and password leave it, sitting
          in a company database that later gets stolen and traded online.
        </p>
        <p className="mt-5 text-base text-ink-muted sm:text-lg">
          Most people don&apos;t find out they&apos;ve been exposed until the damage is
          already done. Checking manually means digging through scattered, technical
          breach dumps built for security researchers, not everyday users.
        </p>
      </Reveal>
    </section>
  )
}

export default Problem
