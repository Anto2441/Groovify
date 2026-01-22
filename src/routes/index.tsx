import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/tanstack-react-start'
import { getCurrentUserId } from '@/features/auth/utils'

const authStateFn = createServerFn().handler(async () => {
  const userId = await getCurrentUserId()

  if (!userId) {
    throw redirect({
      to: '/sign-in/$',
    })
  }

  return { userId }
})

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => await authStateFn(),
  loader: async ({ context }) => {
    return { userId: context.userId }
  },
})

function Home() {
  const state = Route.useLoaderData()

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Welcome! Your ID is {state.userId}!</h1>
      <div className="flex flex-col items-center justify-center">
        <SignedIn>
          <p>You are signed in</p>
          <UserButton />
        </SignedIn>
        <div className="flex flex-col items-center justify-center">
          <SignedOut>
            <p>You are signed out</p>
            <SignInButton />
          </SignedOut>
        </div>
      </div>
    </div>
  )
}
