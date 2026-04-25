import { useEffect } from 'react'
import { supabase, mapSupabaseUser } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

/**
 * Initialise Supabase auth state once at app root.
 * Restores persisted session, then subscribes to future auth events.
 * Must be called exactly once — inside <AuthProvider> in main.tsx.
 */
export function useAuthInit() {
  const { setUser, setInitialized, logout } = useAuthStore()

  useEffect(() => {
    // Restore existing session from localStorage (no network call if token is fresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user))
      } else {
        setInitialized()
      }
    })

    // Real-time listener for sign-in / sign-out / token-refresh events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user))
        } else {
          logout()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
