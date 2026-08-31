const STYLES: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-accent/10 text-accent border-accent/20',
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
}

function SeverityBadge({ severity }: { severity: 'low' | 'medium' | 'high' }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STYLES[severity]}`}>
      {severity}
    </span>
  )
}

export default SeverityBadge
