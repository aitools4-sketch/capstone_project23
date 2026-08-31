import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/useAuth'

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Session is still hydrating from Supabase — render nothing rather than
  // flashing a redirect before we actually know the answer.
  if (loading) return null

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/auth?redirect=${redirect}`} replace />
  }

  return <>{children}</>
}

export default RequireAuth
