import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateAddress } from '@/hooks/useAddresses'
import type { AddressLabel } from '@/types'

const schema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  line1: z.string().min(5, 'Enter a valid address'),
  city: z.string().min(2, 'Enter city'),
  pincode: z.string().regex(/^\d{6}$/, '6-digit pincode required'),
  is_default: z.boolean().optional(),
})

type FormValues = z.infer<typeof schema>

interface AddressModalProps {
  open: boolean
  onClose: () => void
  onCreated?: (addressId: string) => void
}

const LABELS: AddressLabel[] = ['Home', 'Work', 'Other']

export function AddressModal({ open, onClose, onCreated }: AddressModalProps) {
  const { mutateAsync: createAddress, isPending } = useCreateAddress()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { label: 'Home', is_default: false },
  })

  const selectedLabel = watch('label')

  useEffect(() => {
    if (!open) reset()
  }, [open, reset])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  async function onSubmit(values: FormValues) {
    const address = await createAddress(values)
    onCreated?.(address.id)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-xl p-6 z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Add New Address</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Label selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Label</label>
                <div className="flex gap-2">
                  {LABELS.map((l) => (
                    <button
                      type="button"
                      key={l}
                      onClick={() => setValue('label', l)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        selectedLabel === l
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-foreground hover:border-primary/40'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Address line */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Full Address
                </label>
                <Input
                  {...register('line1')}
                  placeholder="Flat / Building / Street"
                  className={errors.line1 ? 'border-destructive' : ''}
                />
                {errors.line1 && (
                  <p className="text-xs text-destructive mt-1">{errors.line1.message}</p>
                )}
              </div>

              {/* City + Pincode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">City</label>
                  <Input
                    {...register('city')}
                    placeholder="City"
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && (
                    <p className="text-xs text-destructive mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Pincode</label>
                  <Input
                    {...register('pincode')}
                    placeholder="400001"
                    maxLength={6}
                    className={errors.pincode ? 'border-destructive' : ''}
                  />
                  {errors.pincode && (
                    <p className="text-xs text-destructive mt-1">{errors.pincode.message}</p>
                  )}
                </div>
              </div>

              {/* Set as default */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('is_default')} className="accent-primary" />
                <span className="text-sm text-muted-foreground">Set as default address</span>
              </label>

              <Button type="submit" size="lg" className="w-full" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Address'}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
