import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Save } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  full_name: z.string().min(2, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProfilePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user.full_name,
      email: user.email,
      phone: user.phone ?? '',
    },
  })

  const onSubmit = (data: FormValues) => {
    console.log('Profile updated:', data)
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile Settings</h1>

        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
              {user.full_name[0]}
            </div>
            <div>
              <p className="font-bold text-foreground">{user.full_name}</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full name"
              leftIcon={<User size={16} />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />
            <Input
              label="Email address"
              type="email"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone number"
              type="tel"
              placeholder="+91 00000 00000"
              leftIcon={<Phone size={16} />}
              {...register('phone')}
            />
            <Button type="submit" disabled={!isDirty} className="gap-2">
              <Save size={16} /> Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
