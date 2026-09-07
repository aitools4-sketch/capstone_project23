export function bandFor(score: number) {
  if (score >= 70) return { label: 'High risk', color: '#f87171' }
  if (score >= 40) return { label: 'Medium risk', color: 'var(--color-accent)' }
  return { label: 'Low risk', color: '#4ade80' }
}
