export interface ModuleStep {
  title: string
  detail: string
}

export interface LearningModule {
  id: string
  title: string
  category: 'password' | 'malware' | 'financial' | 'identity' | 'general'
  description: string
  steps: ModuleStep[]
}

export const MODULES: LearningModule[] = [
  {
    id: 'password-reuse',
    title: 'Your password was exposed',
    category: 'password',
    description: 'Steps to secure accounts after a password leak.',
    steps: [
      { title: 'Change this password now', detail: 'Start with the breached account, then anywhere you reused it.' },
      { title: 'Turn on two-factor authentication', detail: 'Use an authenticator app rather than SMS where possible.' },
      { title: 'Use a password manager', detail: 'Prevents future reuse across accounts.' },
    ],
  },
  {
    id: 'stealer-log-cleanup',
    title: 'Malware captured your credentials',
    category: 'malware',
    description: 'Steps to take when a stealer log shows your device was infected.',
    steps: [
      { title: 'Run a full malware scan', detail: 'Use a reputable scanner before doing anything else.' },
      { title: 'Change every saved password', detail: 'Assume anything stored in your browser was captured.' },
      { title: 'Reinstall the OS if reinfection persists', detail: 'Stealers can survive a surface-level cleanup.' },
    ],
  },
  {
    id: 'financial-exposure',
    title: 'Financial data was exposed',
    category: 'financial',
    description: 'Steps to take when card or bank details show up in a breach.',
    steps: [
      { title: 'Contact your bank or card issuer', detail: 'Ask about freezing or reissuing the affected card.' },
      { title: 'Set up transaction alerts', detail: 'Get notified immediately of any new charges.' },
      { title: 'Check your credit report', detail: 'Look for accounts you didn’t open.' },
    ],
  },
  {
    id: 'identity-exposure',
    title: 'Government ID or SSN was exposed',
    category: 'identity',
    description: 'Steps to take when identity-linked data is leaked.',
    steps: [
      { title: 'Place a fraud alert', detail: 'Contact a credit bureau to flag your file.' },
      { title: 'Consider a credit freeze', detail: 'Blocks new accounts from being opened in your name.' },
      { title: 'Monitor for new accounts', detail: 'Watch for anything you didn’t apply for.' },
    ],
  },
  {
    id: 'strong-passwords',
    title: 'Build passwords that actually hold up',
    category: 'general',
    description: 'How to create and manage passwords an attacker can’t easily guess or crack.',
    steps: [
      { title: 'Use a random passphrase, not a pattern', detail: 'Four unrelated words beat "P@ssword123!" against real cracking tools.' },
      { title: 'Never reuse a password across sites', detail: 'One leaked site should never put your other accounts at risk.' },
      { title: 'Let a password manager generate and store them', detail: 'You only need to remember one master password after that.' },
    ],
  },
  {
    id: 'two-factor-everywhere',
    title: 'Turn on two-factor authentication everywhere',
    category: 'general',
    description: 'The single biggest thing you can do to stop a stolen password from becoming a stolen account.',
    steps: [
      { title: 'Start with email, banking, and social accounts', detail: 'These are the accounts attackers target first, and the ones that unlock everything else.' },
      { title: 'Prefer an authenticator app over SMS', detail: 'SMS codes can be intercepted through SIM-swap attacks; app-based codes can’t.' },
      { title: 'Save your backup codes somewhere offline', detail: 'So losing your phone doesn’t lock you out of your own accounts.' },
    ],
  },
  {
    id: 'spot-phishing',
    title: 'Recognize phishing before you click',
    category: 'general',
    description: 'The habits that catch a fake login page or fraudulent email before it catches you.',
    steps: [
      { title: 'Check the actual sender address, not the display name', detail: '"PayPal Support" can still come from a random Gmail address.' },
      { title: 'Hover before you click any link', detail: 'The real destination URL is usually shown at the bottom of your browser or email client.' },
      { title: 'Go to the site directly instead of clicking', detail: 'Type the address yourself or use a bookmark rather than trusting a link in an email or text.' },
    ],
  },
  {
    id: 'secure-your-email',
    title: 'Lock down your email account',
    category: 'general',
    description: 'Your inbox is the recovery path for almost every other account you own, so it deserves the strongest protection.',
    steps: [
      { title: 'Use a unique, strong password for it', detail: 'Never the same one used anywhere else, given what it can unlock.' },
      { title: 'Enable two-factor authentication', detail: 'This one account is worth the extra ten seconds at every sign-in.' },
      { title: 'Review connected apps and forwarding rules periodically', detail: 'Attackers sometimes add a silent forwarding rule instead of changing your password.' },
    ],
  },
  {
    id: 'reduce-data-broker-exposure',
    title: 'Shrink what data brokers know about you',
    category: 'general',
    description: 'Less of your data sitting in broker databases means less for a future breach to expose in the first place.',
    steps: [
      { title: 'Search your name on a few major people-search sites', detail: 'See what’s already public before deciding what to remove.' },
      { title: 'Submit opt-out requests directly', detail: 'Most brokers are legally required to honor a removal request, though it can take a few weeks.' },
      { title: 'Recheck every few months', detail: 'Brokers frequently re-aggregate data from new sources, so listings can reappear.' },
    ],
  },
]
