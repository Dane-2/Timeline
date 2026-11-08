import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { AppRole } from '../../types/content'

export interface AuthState {
  session: Session | null
  role: AppRole | null
  loading: boolean
  signOut: () => Promise<void>
  /** Dev builds only: skip sign-in with a fake admin session. */
  devBypass?: () => void
}

export const AuthContext = createContext<AuthState | null>(null)

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
