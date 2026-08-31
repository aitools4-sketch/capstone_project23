const RANGE_API_URL = 'https://api.pwnedpasswords.com/range/'

async function sha1Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-1', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
}

export class PasswordCheckError extends Error {}

/** Checks a password against HIBP's Pwned Passwords range API using
 * k-anonymity: only the first 5 hex characters of the SHA-1 hash ever
 * leave the browser, never the password or the full hash. Runs entirely
 * client-side — this never touches our own backend, on purpose, since
 * there's no reason to route a password-derived value through our server
 * at all. Returns the number of times it's appeared in known breach
 * corpora, or 0 if it hasn't. */
export async function checkPasswordExposure(password: string): Promise<number> {
  if (!password) return 0

  const hash = await sha1Hex(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  const res = await fetch(`${RANGE_API_URL}${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  })
  if (!res.ok) {
    throw new PasswordCheckError(`Pwned Passwords lookup failed: ${res.status}`)
  }

  const text = await res.text()
  for (const line of text.split('\n')) {
    const [lineSuffix, count] = line.trim().split(':')
    if (lineSuffix === suffix) {
      return Number(count) || 0
    }
  }
  return 0
}
