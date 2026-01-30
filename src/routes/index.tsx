import { createFileRoute } from '@tanstack/react-router'
import {
  SignedIn,
  SignInButton,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/tanstack-react-start'
import { ensureAuthenticated } from '@/features/auth/guards'

export const Route = createFileRoute('/')({
  component: Home,
  beforeLoad: async () => {
    // côté client → ne rien faire
    if (typeof window !== 'undefined') {
      return { userId: null }
    }

    // côté serveur → appeler ensureAuthenticated()
    const userId = await ensureAuthenticated()
    return { userId }
  },
  loader: async ({ context }) => ({
    userId: context.userId ?? null,
  }),
})

export function Home() {
  const state = Route.useLoaderData()
  const { user } = useUser() // client-side Clerk hook

  const userId = user?.id ?? state.userId

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1>Welcome! Your ID is {userId}!</h1>
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
