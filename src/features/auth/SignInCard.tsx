import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from './authContext'

/**
 * Invite-only email + password sign-in. Accounts are created by the admin in
 * the Supabase dashboard (sign-ups are disabled), so no email delivery is
 * needed. The session then refreshes itself — she signs in about once.
 */
export function SignInCard({ onSignedIn, onCancel }: { onSignedIn?: () => void; onCancel?: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { devBypass } = useAuth()

  async function signIn(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (error) {
      setMessage(
        error.status === 429
          ? 'Too many tries — give it a minute and try again.'
          : "That didn't work. Double-check the email and password.",
      )
      return
    }
    onSignedIn?.()
  }

  const field =
    'border-petal focus:border-blush-deep focus:ring-petal w-full rounded-xl border bg-white px-4 py-3 text-center text-base outline-none transition focus:ring-4'

  return (
    <div className="border-petal mx-auto w-full max-w-[21rem] rounded-3xl border bg-white px-7 pt-8 pb-7 shadow-[0_20px_50px_-28px_rgb(140_97_120_/_0.55)]">
      <p className="stamp text-mauve text-center">Welcome in</p>
      <form onSubmit={signIn} className="mt-5 space-y-3">
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-mauve text-cream hover:bg-ink mt-2 w-full rounded-full px-5 py-3 font-medium transition-colors disabled:opacity-60"
        >
          {busy ? 'One sec…' : 'Let me in'}
        </button>
      </form>
      {message && (
        <p role="alert" className="text-berry mt-4 text-center text-sm">
          {message}
        </p>
      )}
      {import.meta.env.DEV && devBypass && (
        <button
          onClick={() => {
            devBypass()
            onSignedIn?.()
          }}
          className="text-berry mx-auto mt-4 block text-xs font-medium hover:underline"
        >
          Skip sign-in (dev only)
        </button>
      )}
      {onCancel && (
        <button onClick={onCancel} className="text-ink-soft mx-auto mt-4 block text-sm hover:underline">
          Back
        </button>
      )}
    </div>
  )
}
