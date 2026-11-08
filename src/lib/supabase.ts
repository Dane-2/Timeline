import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Public project URL + anon key (needed for raw Storage uploads with progress). */
export const supabaseUrl = url ?? ''
export const supabaseAnonKey = key ?? ''

export const isSupabaseConfigured = Boolean(url && key)

/**
 * The only Supabase client in the app. It uses the anon/publishable key, so
 * everything it can read is decided by Row Level Security on the server.
 */
export const supabase: SupabaseClient = createClient(
  url ?? 'http://localhost:54321',
  key ?? 'missing-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'little-piece-auth',
    },
  },
)

export const MEDIA_BUCKET = 'private-media'
