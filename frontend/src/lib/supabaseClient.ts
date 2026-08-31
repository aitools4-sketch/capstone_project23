import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** False when the env isn't configured. Checked by authProvider.tsx so
 * auth stays disabled (with a clear in-UI message) instead of the client
 * throwing during module evaluation — that used to take down every route,
 * including public marketing pages that have nothing to do with auth. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy frontend/.env.example to frontend/.env and fill in your Supabase project values. Auth features are disabled until this is set.',
  )
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.invalid', supabaseAnonKey || 'placeholder-anon-key', {
  auth: {
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    // The callback page calls exchangeCodeForSession itself; letting the SDK
    // also auto-detect the ?code= param would race it against a one-time code.
    detectSessionInUrl: false,
  },
})
