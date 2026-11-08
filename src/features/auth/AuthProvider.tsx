import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import type { AppRole } from '../../types/content'
import { AuthContext } from './authContext'

// Testing shortcut for `npm run dev`. import.meta.env.DEV is false in
// production builds, so Vite strips all of this out. RLS still applies, so
// anything read from the database comes back empty in this mode.
const DEV_BYPASS_KEY = 'little-piece-dev-bypass'
const DEV_SESSION = { user: { id: 'dev-bypass' } } as Session
const devBypassOn = () => import.meta.env.DEV && sessionStorage.getItem(DEV_BYPASS_KEY) === '1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [bypassed, setBypassed] = useState(devBypassOn)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (!data.session) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) {
        setRole(null)
        setLoading(false)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // The role is read from the database (RLS: users can only read their own
  // profile). The UI uses it for routing; the server enforces it regardless.
  const userId = session?.user.id
  useEffect(() => {
    if (!userId || bypassed) return
    let cancelled = false
    setLoading(true)
    supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setRole((data?.role as AppRole | null) ?? null)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId, bypassed])

  const signOut = async () => {
    if (bypassed) {
      sessionStorage.removeItem(DEV_BYPASS_KEY)
      setBypassed(false)
      return
    }
    await supabase.auth.signOut()
  }

  const devBypass = import.meta.env.DEV
    ? () => {
        sessionStorage.setItem(DEV_BYPASS_KEY, '1')
        setBypassed(true)
      }
    : undefined

  const value = bypassed
    ? { session: DEV_SESSION, role: 'admin' as const, loading: false, signOut, devBypass }
    : { session, role, loading, signOut, devBypass }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
