import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import HomePage from './HomePage'

function renderHomePage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  it('renders the hero headline', () => {
    renderHomePage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Every second you waitis another opportunity for attackers.',
    )
  })

  it('renders the primary call to action', () => {
    renderHomePage()
    expect(screen.getByRole('link', { name: 'Scan your email' })).toBeInTheDocument()
  })
})
