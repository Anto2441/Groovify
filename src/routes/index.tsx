import { createFileRoute } from '@tanstack/react-router'
import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
} from '@clerk/tanstack-react-start'
import { ensureAuthenticated } from '@/features/auth/guards'

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => {
    const userId = await ensureAuthenticated()
    return { userId }
  },
  loader: async ({ context }) => ({
    userId: context.userId,
  }),
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
