import { describe, expect, it } from 'vitest'
import { MOCK_BREACHES, simulateScan } from './mockData'

describe('simulateScan', () => {
  it('is deterministic for the same email', () => {
    expect(simulateScan('a@a.com')).toEqual(simulateScan('a@a.com'))
  })

  it('returns the mock breach set for an exposed email', () => {
    expect(simulateScan('a@a.com')).toEqual(MOCK_BREACHES)
  })

  it('returns no breaches for a clean email', () => {
    expect(simulateScan('b@a.com')).toEqual([])
  })

  it('is case-insensitive', () => {
    expect(simulateScan('B@A.COM')).toEqual(simulateScan('b@a.com'))
  })
})
