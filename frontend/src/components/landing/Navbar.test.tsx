import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar'

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  it('toggles the mobile menu open and closed', () => {
    renderNavbar()
    const toggle = screen.getByRole('button', { name: 'Toggle menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the mobile menu on Escape', () => {
    renderNavbar()
    const toggle = screen.getByRole('button', { name: 'Toggle menu' })
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('toggles the About dropdown', () => {
    renderNavbar()
    const aboutButton = screen.getByRole('button', { name: 'About' })
    expect(aboutButton).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(aboutButton)
    expect(aboutButton).toHaveAttribute('aria-expanded', 'true')
  })
})
