import { render, screen } from '@testing-library/react'
import { Home, Route } from './index'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { PropsWithChildren } from 'react'

vi.mock('@clerk/tanstack-react-start', () => ({
  SignedIn: ({ children }: PropsWithChildren) => <div>{children}</div>,
  SignedOut: ({ children }: PropsWithChildren) => <div>{children}</div>,
  SignInButton: () => <button type="button">Sign in</button>,
  UserButton: () => <button type="button">User</button>,
}))

beforeEach(() => {
  ;(Route as any).useLoaderData = () => ({ userId: 'mock-user' })
})

afterEach(() => {
  vi.restoreAllMocks()
})

it('renders the route component with the user id', () => {
  render(<Home />)

  expect(
    screen.getByText(/Welcome! Your ID is mock-user!/i),
  ).toBeInTheDocument()
})
