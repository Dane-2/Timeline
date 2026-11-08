import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './authContext'
import { PaperLoader } from '../../components/scrapbook/PaperLoader'
import { NotInvitedPage } from './NotInvitedPage'

/**
 * Logged-out visitors may come in (public viewing — RLS decides what they
 * see). A signed-in account still needs a role granted by the admin.
 */
export function RequireMember({ children }: { children: ReactNode }) {
  const { session, role, loading } = useAuth()

  if (loading) return <PaperLoader />
  if (session && !role) return <NotInvitedPage />
  return children
}

/**
 * Hides admin screens from non-admins. This is a convenience only — every
 * admin write is also blocked by RLS for anyone without the admin role.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, role, loading } = useAuth()
  if (loading) return <PaperLoader />
  if (!session) return <Navigate to="/" replace />
  if (role !== 'admin') return <Navigate to="/home" replace />
  return children
}
