import { rowHover } from '../interactive'
import { ActivityIcon, BellIcon, GaugeIcon, RadarIcon } from '../icons'
import Reveal from './Reveal'
import SectionIntro from './SectionIntro'

const ROWS = [
  {
    id: '#10483',
    icon: RadarIcon,
    title: '3 breaches found',
    description: 'Matched against DeHashed and HIBP records',
  },
  {
    id: '#10482',
    icon: GaugeIcon,
    title: 'Risk score recalculated',
    description: 'AI engine reweighted after a new high-severity match',
  },
  {
    id: '#10481',
    icon: BellIcon,
    title: 'Alert sent',
    description: 'Reused password flagged across two breaches',
  },
]

function ActivityPreview() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-32 lg:py-36">
      <SectionIntro icon={ActivityIcon} title="Inside your dashboard." description="What you'll see after your first scan." />

      <div className="relative mx-auto mt-16 max-w-xl">
        <div className="absolute bottom-9 left-22.5 top-9 w-px bg-white/8" />
        <div className="flex flex-col">
          {ROWS.map((row, i) => (
            <Reveal key={row.id} delay={i * 80}>
              <div className={`flex items-start gap-4 rounded-xl -mx-3 px-3 py-8 ${rowHover}`}>
                <span className="w-14 shrink-0 pt-2 text-right text-xs font-medium text-white/15">{row.id}</span>
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-canvas text-accent">
                  <row.icon className="h-4 w-4" />
                </span>
                <div className="pt-1">
                  <p className="text-base font-medium text-ink">{row.title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{row.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ActivityPreview
