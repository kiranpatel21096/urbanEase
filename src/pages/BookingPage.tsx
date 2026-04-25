import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, MapPin, Plus } from 'lucide-react'
import { useService } from '@/hooks/useServices'
import { useAddresses } from '@/hooks/useAddresses'
import { useCreateBooking } from '@/hooks/useBookings'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { AddressModal } from '@/components/booking/AddressModal'
import { Button } from '@/components/ui/button'
import { formatPrice, formatDate } from '@/lib/utils'
import { addDays, format, startOfDay, parse, isToday } from 'date-fns'

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
]

function parseSlotHour(slot: string): number {
  const d = parse(slot, 'hh:mm aa', new Date())
  return d.getHours()
}

function isSlotPast(slot: string, selectedDate: string): boolean {
  if (!isToday(new Date(selectedDate + 'T00:00:00'))) return false
  const now = new Date()
  const slotHour = parseSlotHour(slot)
  // Disable if slot hour is <= current hour (need at least 1 h buffer)
  return slotHour <= now.getHours()
}

type Step = 1 | 2 | 3 | 4

const steps = ['Date & Time', 'Address', 'Confirm', 'Done']

export function BookingPage() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { bookingDraft, setDate, setTimeSlot, setAddress, resetDraft } = useCartStore()

  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null)
  const [addressModalOpen, setAddressModalOpen] = useState(false)

  const { data: service, isLoading: serviceLoading } = useService(serviceId!)
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses()
  const { mutateAsync: createBooking, isPending: isConfirming } = useCreateBooking()

  const availableDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i)),
    []
  )

  if (!user) {
    navigate('/login')
    return null
  }

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Service not found.</p>
          <Button onClick={() => navigate('/services')} className="mt-4">Browse Services</Button>
        </div>
      </div>
    )
  }

  const selectedAddress = addresses.find((a) => a.id === bookingDraft.addressId)

  async function handleConfirm() {
    if (!bookingDraft.date || !bookingDraft.timeSlot || !bookingDraft.addressId) return

    // Combine date + time into a UTC ISO string
    const scheduledAt = parse(
      `${bookingDraft.date} ${bookingDraft.timeSlot}`,
      'yyyy-MM-dd hh:mm aa',
      new Date()
    ).toISOString()

    const booking = await createBooking({
      service_id: service!.id,
      address_id: bookingDraft.addressId,
      scheduled_at: scheduledAt,
      total_price: service!.base_price + 49,
    })

    setConfirmedBookingId(booking.id)
    resetDraft()
    setCurrentStep(4)
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Progress stepper */}
        <div className="flex items-center justify-between mb-10">
          {steps.map((label, i) => {
            const stepNum = (i + 1) as Step
            const done = currentStep > stepNum
            const active = currentStep === stepNum
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  done ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {done ? <Check size={14} /> : stepNum}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px w-8 mx-1 ${done ? 'bg-success' : 'bg-border'}`} />
                )}
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Date & Time ───────────────────────────────── */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-white rounded-3xl border border-border p-6 mb-4">
                <h2 className="text-lg font-bold mb-5">Select Date</h2>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
                  {availableDates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    const isSelected = bookingDraft.date === dateStr
                    return (
                      <button
                        key={dateStr}
                        onClick={() => { setDate(dateStr); setTimeSlot('') }}
                        className={`flex flex-col items-center py-3 px-2 rounded-xl border text-sm transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary'
                            : 'border-border hover:border-primary/40 text-foreground'
                        }`}
                      >
                        <span className="text-xs opacity-70">{format(date, 'EEE')}</span>
                        <span className="font-bold">{format(date, 'd')}</span>
                        <span className="text-xs opacity-70">{format(date, 'MMM')}</span>
                      </button>
                    )
                  })}
                </div>

                <h2 className="text-lg font-bold mb-4">Select Time</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const past = bookingDraft.date ? isSlotPast(slot, bookingDraft.date) : false
                    const selected = bookingDraft.timeSlot === slot
                    return (
                      <button
                        key={slot}
                        disabled={past}
                        onClick={() => !past && setTimeSlot(slot)}
                        className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          past
                            ? 'border-border bg-muted text-muted-foreground opacity-40 cursor-not-allowed'
                            : selected
                            ? 'bg-primary text-white border-primary'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
              <Button
                size="lg"
                className="w-full"
                disabled={!bookingDraft.date || !bookingDraft.timeSlot}
                onClick={() => setCurrentStep(2)}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* ── Step 2: Address ───────────────────────────────────── */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-white rounded-3xl border border-border p-6 mb-4">
                <h2 className="text-lg font-bold mb-5">Select Address</h2>

                {addressesLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No saved addresses. Add one below.
                      </p>
                    )}
                    {addresses.map((addr) => (
                      <button
                        key={addr.id}
                        onClick={() => setAddress(addr.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                          bookingDraft.addressId === addr.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-primary" />
                            <span className="text-sm font-semibold">{addr.label}</span>
                          </div>
                          {addr.is_default && <span className="text-xs text-primary font-medium">Default</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{addr.line1}</p>
                        <p className="text-xs text-muted-foreground">{addr.city} — {addr.pincode}</p>
                      </button>
                    ))}

                    <button
                      onClick={() => setAddressModalOpen(true)}
                      className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Add new address
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setCurrentStep(1)}>Back</Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={!bookingDraft.addressId}
                  onClick={() => setCurrentStep(3)}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Summary ───────────────────────────────────── */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="bg-white rounded-3xl border border-border p-6 mb-4">
                <h2 className="text-lg font-bold mb-5">Booking Summary</h2>
                <div className="flex gap-4 mb-5">
                  <img src={service.thumbnail_url} alt={service.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.category}</p>
                    <p className="text-sm text-muted-foreground">{service.duration_minutes} min</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm border-t border-border pt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{bookingDraft.date ? formatDate(bookingDraft.date) : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{bookingDraft.timeSlot || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-right max-w-[60%]">
                      {selectedAddress ? `${selectedAddress.line1}, ${selectedAddress.city}` : '—'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>{formatPrice(service.base_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee</span>
                    <span>{formatPrice(49)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(service.base_price + 49)}</span>
                  </div>
                </div>

                <div className="mt-5 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                  💳 Pay at doorstep after service completion
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setCurrentStep(2)}>Back</Button>
                <Button
                  size="lg"
                  className="flex-1"
                  disabled={isConfirming}
                  onClick={handleConfirm}
                >
                  {isConfirming ? 'Confirming…' : 'Confirm Booking'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Done ──────────────────────────────────────── */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                  <Check size={40} className="text-success" />
                </motion.div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Booking Requested!</h2>
              <p className="text-muted-foreground mb-2">Your booking ID is</p>
              <p className="text-xl font-bold text-primary mb-6 font-mono">
                {confirmedBookingId?.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto">
                A professional will accept your request shortly. You can track your booking status in the dashboard.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
                <Button onClick={() => navigate('/dashboard/bookings')}>View Bookings</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Address Modal */}
      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onCreated={(id) => setAddress(id)}
      />
    </div>
  )
}
