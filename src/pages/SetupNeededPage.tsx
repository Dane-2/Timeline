export function SetupNeededPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="paper max-w-md p-6">
        <h1 className="font-display text-2xl font-semibold">Almost there</h1>
        <p className="text-ink-soft mt-2 text-sm">
          Supabase isn't configured. Copy <code>.env.example</code> to <code>.env.local</code>, fill in
          <code> VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart the dev server.
        </p>
      </div>
    </main>
  )
}
