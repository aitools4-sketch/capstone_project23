import { bandFor } from '../../lib/riskBands'

const WIDTH = 200
const HEIGHT = 56
const PADDING = 6

function pointFor(index: number, score: number, count: number) {
  const x = count === 1 ? WIDTH / 2 : PADDING + (index / (count - 1)) * (WIDTH - 2 * PADDING)
  // Inverted: a higher (worse) score sits higher in the chart, same "up
  // is worse" reading as a stock or temperature line — and lines up with
  // RiskGauge's low-score-is-green-at-the-bottom framing.
  const y = HEIGHT - PADDING - (score / 100) * (HEIGHT - 2 * PADDING)
  return { x, y }
}

/** A scan history's risk_score over time, oldest to newest. Needs at
 * least two points to show a trend at all — a single score has nothing
 * to compare against, so this renders nothing rather than a lone dot. */
function RiskTrendChart({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null

  const points = scores.map((score, i) => pointFor(i, score, scores.length))
  const latestColor = bandFor(scores[scores.length - 1]).color
  const last = points[points.length - 1]

  return (
    <div className="mt-4 w-full">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points={points.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={latestColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={last.x} cy={last.y} r="3" fill={latestColor} />
      </svg>
      <p className="mt-1.5 text-center text-xs text-ink-faint">Risk score, last {scores.length} scans</p>
    </div>
  )
}

export default RiskTrendChart
