import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertCircle, ChevronDown, FlaskConical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const DEMO_ACCOUNTS = [
  { role: 'Customer', name: 'Priya Sharma',  email: 'customer1@demo.urbanease.in' },
  { role: 'Customer', name: 'Rahul Desai',   email: 'customer2@demo.urbanease.in' },
  { role: 'Provider', name: 'Meera Sharma',  email: 'provider1@demo.urbanease.in' },
  { role: 'Provider', name: 'Rajan Mehta',   email: 'provider2@demo.urbanease.in' },
  { role: 'Admin',    name: 'Admin User',    email: 'admin@demo.urbanease.in' },
] as const

const ROLE_COLORS: Record<string, string> = {
  Customer: 'bg-blue-50 text-blue-700',
  Provider: 'bg-green-50 text-green-700',
  Admin:    'bg-purple-50 text-purple-700',
}

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  function fillDemo(email: string) {
    reset({ email, password: 'Demo@1234' })
    setDemoOpen(false)
  }

  const onSubmit = async ({ email, password }: FormValues) => {
    setIsLoading(true)
    setErrorMsg('')
    setNeedsConfirmation(false)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setNeedsConfirmation(true)
      } else if (error.message.toLowerCase().includes('invalid login credentials')) {
        setErrorMsg('Invalid email or password.')
      } else {
        setErrorMsg(error.message)
      }
      setIsLoading(false)
      return
    }

    // onAuthStateChange in useAuthInit updates the store; just navigate
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold">U</span>
            </div>
            <span className="font-bold text-xl">Urban<span className="text-primary">Ease</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-border p-8">
          {/* Email not confirmed banner */}
          {needsConfirmation && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                Please confirm your email first. Check your inbox for the verification link we sent you.
              </span>
            </div>
          )}

          {/* Generic error */}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-5 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="priya@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo accounts panel */}
        <div className="mt-4 bg-white rounded-2xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setDemoOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <FlaskConical size={15} className="text-primary" />
              Demo Accounts — click to fill
            </span>
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${demoOpen ? 'rotate-180' : ''}`}
            />
          </button>

          <AnimatePresence>
            {demoOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.email}
                      className="flex items-center gap-3 px-5 py-3 border-b border-border/60 last:border-b-0"
                    >
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${ROLE_COLORS[acc.role]}`}>
                        {acc.role}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{acc.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{acc.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fillDemo(acc.email)}
                        className="flex-shrink-0 text-xs font-semibold text-primary hover:underline"
                      >
                        Fill
                      </button>
                    </div>
                  ))}
                  <p className="px-5 py-2.5 text-xs text-muted-foreground bg-muted/30">
                    Password for all accounts: <span className="font-mono font-semibold text-foreground">Demo@1234</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
