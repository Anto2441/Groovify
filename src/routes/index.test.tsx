import { render, screen } from '@testing-library/react'
import { App } from './index'

it('renders the landing page without crashing', () => {
  render(<App />)
  expect(
    screen.getByRole('heading', { level: 1, name: /TANSTACK START/i }),
  ).toBeInTheDocument()
})
