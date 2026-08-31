import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from './supabaseClient'
import { AuthContext, type AuthState } from './authContext'
import { clearScanCache } from './scanHistoryApi'

const NOT_CONFIGURED_ERROR = 'Sign-in is not configured in this environment yet.'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(supabaseConfigured)

  useEffect(() => {
    if (!supabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
      // The signed-in identity just changed (sign-in, sign-out, or a
      // switch between accounts) — any dashboard data cached under the
      // previous identity is no longer safe to serve.
      clearScanCache()
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: session !== null,
      loading,
      email: session?.user.email ?? null,
      userId: session?.user.id ?? null,
      session,
      requestMagicLink: async (email: string, redirectTo?: string) => {
        if (!supabaseConfigured) return { error: NOT_CONFIGURED_ERROR }

        const callbackUrl = new URL('/auth/callback', window.location.origin)
        if (redirectTo) callbackUrl.searchParams.set('redirect', redirectTo)

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: callbackUrl.toString(),
            shouldCreateUser: true,
          },
        })
        return { error: error?.message ?? null }
      },
      signOut: async () => {
        if (!supabaseConfigured) return
        // Invalidate the session server-side first, then let onAuthStateChange
        // clear local state — never the reverse.
        await supabase.auth.signOut()
      },
    }),
    [session, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
