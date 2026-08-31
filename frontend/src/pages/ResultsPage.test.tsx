import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../lib/apiClient'
import ResultsPage from './ResultsPage'

// Stubbed rather than left to hit the network: relying on a real fetch to
// localhost:8000 failing fast only works when nothing happens to be
// listening there. In dev that's often false — this backend gets run
// locally all the time — and a real request can take several real seconds
// (live DeHashed/HIBP calls), well past any reasonable test timeout. Mocking
// runScan keeps the test hermetic and fast regardless of what else is running.
const mockRunScan = vi.fn()
vi.mock('../lib/scanApi', () => ({
  runScan: (email: string) => mockRunScan(email),
}))

function renderResults(email: string) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/scan/results', state: { email } }]}>
      <Routes>
        <Route path="/scan/results" element={<ResultsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ResultsPage', () => {
  // A 503 means live scanning isn't configured in this environment — the
  // one case where falling back to a clearly-labeled sample result is
  // intentional, so the app stays demoable.
  it('falls back to a labeled sample result when live scanning is not configured', async () => {
    mockRunScan.mockReturnValueOnce(Promise.reject(new ApiError(503, 'not configured')))
    renderResults('a@a.com')
    expect(await screen.findByText(/Live scanning isn't configured/)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  // Any other failure (network error, 5xx, timeout) must show a real error
  // state, never fabricated breach data — a scan that didn't run must not
  // look identical to a scan that found nothing.
  it('shows a real error, not fabricated data, when the scan fails for another reason', async () => {
    mockRunScan.mockReturnValueOnce(Promise.reject(new Error('network down')))
    renderResults('a@a.com')
    expect(await screen.findByText(/Couldn't complete this scan/)).toBeInTheDocument()
    expect(screen.queryByText(/Found in \d+ breaches?/)).not.toBeInTheDocument()
    expect(screen.queryByText(/No exposure found/)).not.toBeInTheDocument()
  })
})
