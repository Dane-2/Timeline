import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './authContext'
import { PaperLoader } from '../../components/scrapbook/PaperLoader'
import { NotInvitedPage } from './NotInvitedPage'

/** Signed in AND granted a role by the admin. */
export function RequireMember({ children }: { children: ReactNode }) {
  const { session, role, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PaperLoader />
  if (!session) return <Navigate to="/" replace state={{ from: location.pathname }} />
  if (!role) return <NotInvitedPage />
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
