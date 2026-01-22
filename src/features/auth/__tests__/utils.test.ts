import { describe, expect, it, vi } from 'vitest'

vi.mock('@clerk/tanstack-react-start/server', () => {
  return {
    auth: vi.fn(),
  }
})

import { auth } from '@clerk/tanstack-react-start/server'
import { getCurrentUserId } from '../utils'

describe('getCurrentUserId', () => {
  it('returns the userId when authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: 'user-123' })

    await expect(getCurrentUserId()).resolves.toBe('user-123')
  })

  it('returns null when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ userId: null })

    await expect(getCurrentUserId()).resolves.toBeNull()
  })
})
