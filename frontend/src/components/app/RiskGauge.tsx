import { bandFor } from '../../lib/riskBands'

function RiskGauge({ score, size = 'lg' }: { score: number; size?: 'lg' | 'sm' }) {
  const band = bandFor(score)
  const degrees = Math.min(180, Math.max(0, (score / 100) * 180))
  const dimension = size === 'lg' ? 'h-28 w-56' : 'h-16 w-32'

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${dimension} rounded-t-full`}
        style={{
          background: `conic-gradient(from 270deg at 50% 100%, ${band.color} 0deg, ${band.color} ${degrees}deg, rgba(255,255,255,0.08) ${degrees}deg, rgba(255,255,255,0.08) 180deg)`,
        }}
      />
      <div className="text-center">
        <p className={size === 'lg' ? 'text-3xl font-semibold text-ink' : 'text-lg font-semibold text-ink'}>
          {score}
          <span className="text-sm font-normal text-ink-faint">/100</span>
        </p>
        <p className="text-xs text-ink-muted">{band.label}</p>
      </div>
    </div>
  )
}

export default RiskGauge
