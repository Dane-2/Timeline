import { useAuth } from './authContext'

export function NotInvitedPage() {
  const { signOut } = useAuth()
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="border-petal w-full max-w-[21rem] rounded-3xl border bg-white px-7 py-9 text-center">
        <p className="stamp text-mauve">Hmm</p>
        <h1 className="font-display mt-2 text-2xl">This corner is private</h1>
        <p className="text-ink-soft mt-3 text-sm">You're signed in, but this account hasn't been given access yet.</p>
        <button onClick={signOut} className="text-mauve mt-6 text-sm font-medium hover:underline">
          Sign out
        </button>
      </div>
    </main>
  )
}
