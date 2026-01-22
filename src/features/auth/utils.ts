import { auth } from '@clerk/tanstack-react-start/server'

const UNAUTHORIZED_MESSAGE = 'Unauthorized'

export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId ?? null
}

export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) {
    throw new Error(UNAUTHORIZED_MESSAGE)
  }
  return userId
}