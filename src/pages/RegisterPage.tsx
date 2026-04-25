import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['customer', 'provider']),
})

type FormValues = z.infer<typeof schema>

const REDIRECT_URL = `${window.location.origin}/auth/callback`

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [emailTaken, setEmailTaken] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  })

  const selectedRole = watch('role')

  const onSubmit = async ({ email, password, full_name, role }: FormValues) => {
    setIsLoading(true)
    setErrorMsg('')
    setEmailTaken(false)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: REDIRECT_URL,
        data: { full_name, role },
      },
    })

    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already exists') || error.code === 'user_already_exists') {
        setEmailTaken(true)
      } else {
        setErrorMsg(error.message)
      }
      setIsLoading(false)
      return
    }

    setSentTo(email)
    setEmailSent(true)
    setIsLoading(false)
  }

  // ── Success / email-sent screen ─────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-3xl shadow-card border border-border p-10">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Check your inbox!</h2>
            <p className="text-sm text-muted-foreground mb-1">We sent a confirmation link to</p>
            <p className="font-semibold text-foreground mb-5">{sentTo}</p>
            <p className="text-xs text-muted-foreground mb-6">
              Click the link in the email to activate your account. It expires in 24 hours.
              If you don't see it, check your spam folder.
            </p>
            <Link
              to="/login"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Registration form ───────────────────────────────────────────────────────
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
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">Join thousands of happy customers</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-border p-8">
          {/* Role selector */}
          <div className="flex rounded-xl overflow-hidden border border-border mb-6">
            {(['customer', 'provider'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setValue('role', role)}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  selectedRole === role
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {role === 'customer' ? '🏠 Customer' : '🔧 Service Pro'}
              </button>
            ))}
          </div>

          {emailTaken && (
            <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-4 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>
                An account with this email already exists.{' '}
                <Link to="/login" className="font-semibold underline underline-offset-2">
                  Sign in instead
                </Link>
                {' '}or use a different email.
              </span>
            </div>
          )}
          {errorMsg && !emailTaken && (
            <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-xl p-3 mb-4 text-sm text-destructive">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              placeholder="Priya Sharma"
              leftIcon={<User size={16} />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />
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
              placeholder="Min. 6 characters"
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

            <p className="text-xs text-muted-foreground">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>

            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
