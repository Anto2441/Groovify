import { describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/tanstack-react-start/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  redirect: vi.fn((opts: { to: string }) => {
    return { to: opts.to, _type: 'redirect' }
  }),
}))

import { auth } from '@clerk/tanstack-react-start/server'
import { redirect } from '@tanstack/react-router'
import { ensureAuthenticated } from '../guards'

describe('ensureAuthenticated', () => {
  it('returns userId when authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-abc' } as any)

    await expect(ensureAuthenticated()).resolves.toBe('user-abc')
  })

  it('throws redirect when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any)

    await expect(ensureAuthenticated()).rejects.toEqual({
      to: '/sign-in/$',
      _type: 'redirect',
    })

    expect(redirect).toHaveBeenCalledWith({ to: '/sign-in/$' })
  })
})

