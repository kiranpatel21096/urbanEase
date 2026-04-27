import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { useBookings, useProviderBookings, useUpdateBookingStatus } from '@/hooks/useBookings'
import { useMyProvider } from '@/hooks/useProviders'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

type CustomerTab = 'upcoming' | 'completed' | 'cancelled'
type ProviderTab = 'requests' | 'active'

const statusVariant: Record<BookingStatus, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  Pending: 'outline',
  Confirmed: 'default',
  Rejected: 'destructive',
  'Pro Assigned': 'warning',
  'On the Way': 'warning',
  Arrived: 'warning',
  'In Progress': 'warning',
  Completed: 'success',
  Cancelled: 'destructive',
}

const PROVIDER_STATUS_NEXT: Partial<Record<BookingStatus, BookingStatus>> = {
  Confirmed: 'On the Way',
  'On the Way': 'Arrived',
  Arrived: 'In Progress',
  'In Progress': 'Completed',
}

// ─── Customer View ────────────────────────────────────────────────────────────

function CustomerBookingsView() {
  const [activeTab, setActiveTab] = useState<CustomerTab>('upcoming')
  const navigate = useNavigate()
  const { data: bookings = [], isLoading } = useBookings()

  const tabs: { key: CustomerTab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  const filtered = bookings.filter((b) => {
    if (activeTab === 'upcoming')
      return ['Pending', 'Confirmed', 'Pro Assigned', 'On the Way', 'Arrived', 'In Progress'].includes(b.status)
    if (activeTab === 'completed') return b.status === 'Completed'
    return ['Cancelled', 'Rejected'].includes(b.status)
  })

  return (
    <>
      <div className="flex bg-muted rounded-xl p-1 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white shadow-card text-foreground' : 'text-muted-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? <BookingSkeletons /> : filtered.length === 0 ? (
        <EmptyState
          title={`No ${activeTab} bookings`}
          description="When you book a service, it will appear here."
          actionLabel="Book a Service"
          onAction={() => navigate('/services')}
        />
      ) : (
        <BookingList bookings={filtered} onNavigate={(id) => navigate(`/dashboard/bookings/${id}`)} />
      )}
    </>
  )
}

// ─── Provider Job Queue View ──────────────────────────────────────────────────

function ProviderJobQueueView() {
  const [activeTab, setActiveTab] = useState<ProviderTab>('requests')
  const navigate = useNavigate()
  const { data: myProvider, isLoading: providerLoading } = useMyProvider()
  const { data: allBookings = [], isLoading: bookingsLoading } = useProviderBookings(myProvider?.id)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateBookingStatus()

  const tabs: { key: ProviderTab; label: string }[] = [
    { key: 'requests', label: 'New Requests' },
    { key: 'active', label: 'My Active Jobs' },
  ]

  const pendingJobs = allBookings.filter((b) => b.status === 'Pending' && !b.provider_id)
  const activeJobs = allBookings.filter((b) => b.provider_id === myProvider?.id)

  const isLoading = providerLoading || bookingsLoading

  if (!myProvider && !providerLoading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground mb-4">No provider profile found for your account.</p>
        <p className="text-sm text-muted-foreground">Contact support to set up your provider profile.</p>
      </div>
    )
  }

  function handleAccept(booking: Booking) {
    updateStatus({ bookingId: booking.id, status: 'Confirmed', providerId: myProvider!.id })
  }

  function handleReject(booking: Booking) {
    updateStatus({ bookingId: booking.id, status: 'Rejected' })
  }

  function handleProgress(booking: Booking) {
    const next = PROVIDER_STATUS_NEXT[booking.status]
    if (next) updateStatus({ bookingId: booking.id, status: next })
  }

  return (
    <>
      <div className="flex bg-muted rounded-xl p-1 mb-6">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white shadow-card text-foreground' : 'text-muted-foreground'
            }`}
          >
            {label}
            {key === 'requests' && pendingJobs.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
                {pendingJobs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <BookingSkeletons />
      ) : activeTab === 'requests' ? (
        pendingJobs.length === 0 ? (
          <EmptyState title="No new requests" description="New booking requests will appear here." />
        ) : (
          <div className="space-y-4">
            {pendingJobs.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-border p-5"
              >
                <BookingCardContent booking={booking} onClick={() => navigate(`/dashboard/bookings/${booking.id}`)} />
                <div className="flex gap-3 mt-4 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                    disabled={isUpdating}
                    onClick={() => handleReject(booking)}
                  >
                    <XCircle size={14} className="mr-1.5" /> Reject
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={isUpdating}
                    onClick={() => handleAccept(booking)}
                  >
                    {isUpdating ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <CheckCircle size={14} className="mr-1.5" />}
                    Accept
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : activeJobs.length === 0 ? (
        <EmptyState title="No active jobs" description="Accepted jobs will appear here." />
      ) : (
        <div className="space-y-4">
          {activeJobs.map((booking, i) => {
            const nextStatus = PROVIDER_STATUS_NEXT[booking.status]
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-border p-5"
              >
                <BookingCardContent booking={booking} onClick={() => navigate(`/dashboard/bookings/${booking.id}`)} />
                {nextStatus && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={isUpdating}
                      onClick={() => handleProgress(booking)}
                    >
                      {isUpdating ? (
                        <Loader2 size={14} className="animate-spin mr-1.5" />
                      ) : null}
                      Mark as {nextStatus}
                    </Button>
                  </div>
                )}
                {booking.status === 'Completed' && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <Badge variant="success">Job Completed</Badge>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function BookingCardContent({ booking, onClick }: { booking: Booking; onClick: () => void }) {
  return (
    <div
      className="flex items-start gap-4 cursor-pointer"
      onClick={onClick}
    >
      {booking.service?.thumbnail_url && (
        <img
          src={booking.service.thumbnail_url}
          alt={booking.service.name}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-foreground text-sm">{booking.service?.name ?? 'Service'}</p>
            {booking.provider ? (
              <Link
                to={`/providers/${booking.provider.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary hover:underline"
              >
                {booking.provider.name} · ⭐ {booking.provider.avg_rating}
              </Link>
            ) : (
              <p className="text-xs text-muted-foreground">Awaiting professional</p>
            )}
          </div>
          <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar size={12} />{formatDate(booking.scheduled_at)}
          </span>
          {booking.service?.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock size={12} />{booking.service.duration_minutes} min
            </span>
          )}
          {booking.address && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />{booking.address.city}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold text-primary">{formatPrice(booking.total_price)}</span>
          <ChevronRight size={16} className="text-muted-foreground" />
        </div>
      </div>
    </div>
  )
}

function BookingList({ bookings, onNavigate }: { bookings: Booking[]; onNavigate: (id: string) => void }) {
  return (
    <div className="space-y-4">
      {bookings.map((booking, i) => (
        <motion.div
          key={booking.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          onClick={() => onNavigate(booking.id)}
          className="bg-white rounded-2xl border border-border p-5 cursor-pointer hover:shadow-card-hover transition-all"
        >
          <BookingCardContent booking={booking} onClick={() => onNavigate(booking.id)} />
        </motion.div>
      ))}
    </div>
  )
}

function BookingSkeletons() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main export — role-split ─────────────────────────────────────────────────

export function DashboardBookingsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">
          {user.role === 'provider' ? 'Job Dashboard' : 'My Bookings'}
        </h1>
        {user.role === 'provider' ? <ProviderJobQueueView /> : <CustomerBookingsView />}
      </div>
    </div>
  )
}
