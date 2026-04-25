import { createClient } from '@supabase/supabase-js'
import type { User } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/** Map a raw Supabase auth user → our app User type (no extra DB call) */
export function mapSupabaseUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, string> }): User {
  const meta = supabaseUser.user_metadata ?? {}
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    full_name: meta.full_name ?? meta.name ?? supabaseUser.email?.split('@')[0] ?? 'User',
    avatar_url: meta.avatar_url ?? meta.picture ?? undefined,
    phone: meta.phone ?? undefined,
    role: (meta.role as User['role']) ?? 'customer',
    created_at: new Date().toISOString(),
  }
}
