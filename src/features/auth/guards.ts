import { redirect } from '@tanstack/react-router'

import { getCurrentUserId } from './utils'

const SIGN_IN_ROUTE = '/sign-in/$'

/**
 * Ensures the current user is authenticated and throws a redirect if not.
 * Use this inside `beforeLoad` or loader helpers so anonymous hits are rerouted.
 */
export async function ensureAuthenticated(): Promise<string> {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw redirect({ to: SIGN_IN_ROUTE })
  }

  return userId
}

/**
 * Wraps a loader that needs the authenticated user ID. The inner callback runs
 * only after authentication succeeds and receives the resolved userId.
 */
export function requireAuthLoader<T>(handler: (userId: string) => Promise<T> | T) {
  return async () => {
    const userId = await ensureAuthenticated()
    return handler(userId)
  }
}
