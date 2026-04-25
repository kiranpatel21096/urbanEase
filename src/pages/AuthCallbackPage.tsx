import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'

/**
 * Landing page for Supabase email-confirmation redirects.
 * The Supabase client automatically detects the tokens in the URL hash
 * (via detectSessionInUrl: true) and fires onAuthStateChange → SIGNED_IN,
 * which our useAuthInit hook picks up and populates the store.
 * We just wait for isInitialized, then redirect.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { isInitialized, user } = useAuthStore()
  const redirected = useRef(false)

  useEffect(() => {
    if (isInitialized && !redirected.current) {
      redirected.current = true
      const type = new URLSearchParams(window.location.search).get('type')
      const timer = setTimeout(() => {
        if (type === 'recovery' && user) {
          // Password-reset flow: user is now logged in with a recovery token.
          // Send them to the reset password form.
          navigate('/reset-password', { replace: true })
        } else {
          navigate(user ? '/' : '/login', { replace: true })
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isInitialized, user, navigate])

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          {user ? 'Email confirmed!' : 'Verifying your email…'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {user ? 'Redirecting you to UrbanEase…' : 'Please wait a moment.'}
        </p>
      </motion.div>
    </div>
  )
}
