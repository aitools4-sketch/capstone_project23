import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthState = {
  isAuthenticated: boolean
  loading: boolean
  email: string | null
  userId: string | null
  session: Session | null
  requestMagicLink: (email: string, redirectTo?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthState | null>(null)
