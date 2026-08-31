export type Breach = {
  id: string
  name: string
  date: string
  recordsExposed: string
  dataTypes: string[]
  severity: 'low' | 'medium' | 'high'
}

export const MOCK_BREACHES: Breach[] = [
  {
    id: 'retailco-2024',
    name: 'RetailCo',
    date: '2024-11-02',
    recordsExposed: '4.2M',
    dataTypes: ['Email', 'Password hash', 'Phone number'],
    severity: 'high',
  },
  {
    id: 'streamhub-2023',
    name: 'StreamHub',
    date: '2023-06-18',
    recordsExposed: '890K',
    dataTypes: ['Email', 'Username'],
    severity: 'medium',
  },
  {
    id: 'fitwear-2022',
    name: 'FitWear',
    date: '2022-01-09',
    recordsExposed: '120K',
    dataTypes: ['Email', 'Physical address'],
    severity: 'low',
  },
]

/**
 * Deterministically simulates a scan outcome from the entered email, since no
 * real DeHashed/HIBP integration exists yet. Roughly 1 in 3 emails come back
 * clean so the demo flow can show both the "exposed" and "no breaches" states.
 */
export function simulateScan(email: string): Breach[] {
  const hash = Array.from(email.toLowerCase()).reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return hash % 3 === 0 ? [] : MOCK_BREACHES
}

export type Recommendation = {
  title: string
  detail: string
  impact: string
}

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    title: 'Rotate your RetailCo password',
    detail: 'This password was reused on two other accounts, which compounds the risk of the breach.',
    impact: '-12 pts',
  },
  {
    title: 'Enable two-factor authentication',
    detail: 'None of your monitored accounts currently have 2FA. It blunts the impact of future leaks.',
    impact: '-8 pts',
  },
  {
    title: 'Review StreamHub account activity',
    detail: 'Exposed alongside your username, which raises the odds of credential-stuffing attempts.',
    impact: '-5 pts',
  },
]

export const MOCK_PREVENTIVE_TIPS: Recommendation[] = [
  {
    title: 'Use a password manager',
    detail: 'Generate a unique password for every account so a future breach can’t compromise the rest.',
    impact: 'Prevents reuse',
  },
  {
    title: 'Turn on two-factor authentication',
    detail: 'Add it to your email and any account that supports it, before you ever need it.',
    impact: 'Blocks takeover',
  },
  {
    title: 'Set up ongoing monitoring',
    detail: 'Sign in so we can alert you the moment this email turns up in a new breach.',
    impact: 'Early warning',
  },
]

export type Notification = {
  id: string
  title: string
  detail: string
  time: string
  read: boolean
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'New breach detected',
    detail: 'RetailCo (2024) now matches your monitored email.',
    time: '2h ago',
    read: false,
  },
  {
    id: 'n2',
    title: 'Risk score updated',
    detail: 'Your score moved from 51 to 42 after a stale exposure aged out.',
    time: '1d ago',
    read: false,
  },
  {
    id: 'n3',
    title: 'Weekly summary ready',
    detail: 'No new breaches this week, but you’re still exposed via 3 sources.',
    time: '6d ago',
    read: true,
  },
]

