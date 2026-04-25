import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  CalendarCheck, Star, IndianRupee, Clock, Briefcase,
  ArrowRight, Search, User, CalendarDays, ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useBookings, useProviderBookings } from '@/hooks/useBookings'
import { useMyProvider } from '@/hooks/useProviders'
import { supabase } from '@/lib/supabase'
import { formatDate, formatPrice } from '@/lib/utils'
import type { BookingStatus, Booking } from '@/types'

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

const ACTIVE_STATUSES: BookingStatus[] = ['Pending', 'Confirmed', 'Pro Assigned', 'On the Way', 'Arrived', 'In Progress']

// ─── Customer Dashboard ───────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function ActiveBookingCard({ booking }: { booking: Booking }) {
  return (
    <Link
      to={`/dashboard/bookings/${booking.id}`}
      className="block bg-white rounded-2xl border border-border p-5 hover:shadow-card transition-all"
    >
      <div className="flex items-start gap-4">
        {booking.service?.thumbnail_url && (
          <img
            src={booking.service.thumbnail_url}
            alt={booking.service.name}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-foreground text-sm">{booking.service?.name ?? 'Service'}</p>
            <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {booking.provider?.name ?? 'Awaiting professional'}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays size={11} />{formatDate(booking.scheduled_at)}
            </span>
            <span className="font-semibold text-primary">{formatPrice(booking.total_price)}</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </Link>
  )
}

function CustomerDashboardView() {
  const navigate = useNavigate()
  const { data: bookings = [], isLoading } = useBookings()

  const total     = bookings.length
  const completed = bookings.filter((b) => b.status === 'Completed').length
  const upcoming  = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length
  const activeBooking = bookings.find((b) => ACTIVE_STATUSES.includes(b.status))

  const quickActions = [
    { label: 'Book a Service', desc: 'Browse all home services', icon: Search, to: '/services', color: 'bg-blue-50 text-blue-600' },
    { label: 'Find Providers', desc: 'Search skilled professionals', icon: User, to: '/search', color: 'bg-purple-50 text-purple-600' },
    { label: 'My Bookings', desc: 'Track all your bookings', icon: CalendarCheck, to: '/dashboard/bookings', color: 'bg-green-50 text-green-600' },
    { label: 'Edit Profile', desc: 'Update name and phone', icon: User, to: '/dashboard/profile', color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total"     value={isLoading ? '—' : total}     icon={CalendarCheck} color="bg-blue-50 text-blue-600" />
        <StatCard label="Upcoming"  value={isLoading ? '—' : upcoming}  icon={Clock}         color="bg-amber-50 text-amber-600" />
        <StatCard label="Completed" value={isLoading ? '—' : completed} icon={Star}          color="bg-green-50 text-green-600" />
      </div>

      {/* Active booking */}
      {!isLoading && activeBooking && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-base font-semibold text-foreground mb-3">Active Booking</h2>
          <ActiveBookingCard booking={activeBooking} />
        </motion.div>
      )}

      {!isLoading && upcoming === 0 && (
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">No active bookings right now.</p>
          <Button size="sm" onClick={() => navigate('/services')}>
            Book a Service <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, desc, icon: Icon, to, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-2xl border border-border p-4 hover:shadow-card transition-all flex items-start gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Provider Dashboard ───────────────────────────────────────────────────────

function useProviderEarnings(providerId: string | undefined) {
  return useQuery<number>({
    queryKey: ['provider-earnings', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('provider_id', providerId!)
        .eq('status', 'Completed')
      if (error) throw error
      return (data ?? []).reduce((sum, b) => sum + (b.total_price as number), 0)
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2,
  })
}

function ProviderDashboardView() {
  const { data: myProvider, isLoading: providerLoading } = useMyProvider()
  const { data: allBookings = [], isLoading: bookingsLoading } = useProviderBookings(myProvider?.id)
  const { data: earnings = 0, isLoading: earningsLoading } = useProviderEarnings(myProvider?.id)

  const isLoading = providerLoading || bookingsLoading

  const pendingJobs   = allBookings.filter((b) => b.status === 'Pending' && !b.provider_id).length
  const activeJobs    = allBookings.filter((b) => b.provider_id === myProvider?.id &&
    !['Completed', 'Cancelled', 'Rejected', 'Pending'].includes(b.status)).length
  const completedJobs = allBookings.filter((b) => b.provider_id === myProvider?.id && b.status === 'Completed').length

  const quickActions = [
    { label: 'Job Queue', desc: 'View requests & active jobs', icon: Briefcase, to: '/dashboard/bookings', color: 'bg-blue-50 text-blue-600', badge: pendingJobs },
    { label: 'My Availability', desc: 'Set weekly schedule', icon: CalendarDays, to: '/dashboard/availability', color: 'bg-green-50 text-green-600', badge: 0 },
    { label: 'Edit Profile', desc: 'Update contact info', icon: User, to: '/dashboard/profile', color: 'bg-purple-50 text-purple-600', badge: 0 },
    { label: 'Find Services', desc: 'Browse platform services', icon: Search, to: '/services', color: 'bg-orange-50 text-orange-600', badge: 0 },
  ]

  return (
    <div className="space-y-6">
      {/* Greeting with provider info */}
      {myProvider && (
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex items-center gap-4">
          <img
            src={myProvider.avatar_url}
            alt={myProvider.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
          />
          <div>
            <p className="font-bold text-foreground">{myProvider.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{myProvider.avg_rating}</span>
              <span className="text-xs text-muted-foreground">({myProvider.total_reviews} reviews)</span>
            </div>
          </div>
          <Badge variant="success" className="ml-auto">{myProvider.is_verified ? 'Verified' : 'Pending'}</Badge>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Pending Requests"
          value={isLoading ? '—' : pendingJobs}
          icon={Clock}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Active Jobs"
          value={isLoading ? '—' : activeJobs}
          icon={Briefcase}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Jobs Completed"
          value={isLoading ? '—' : completedJobs}
          icon={CalendarCheck}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Total Earnings"
          value={earningsLoading ? '—' : formatPrice(earnings)}
          icon={IndianRupee}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Pending requests CTA */}
      {!isLoading && pendingJobs > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/dashboard/bookings"
            className="block bg-primary text-white rounded-2xl p-4 flex items-center justify-between hover:bg-primary/90 transition-colors"
          >
            <div>
              <p className="font-semibold text-sm">
                {pendingJobs} new job {pendingJobs === 1 ? 'request' : 'requests'} waiting
              </p>
              <p className="text-xs text-white/70 mt-0.5">Tap to view and accept</p>
            </div>
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ label, desc, icon: Icon, to, color, badge }) => (
            <Link
              key={to}
              to={to}
              className="bg-white rounded-2xl border border-border p-4 hover:shadow-card transition-all flex items-start gap-3 relative"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              {badge > 0 && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Export — role-split ─────────────────────────────────────────────────

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}`

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            {greeting}, {user.full_name.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {user.role === 'provider' ? <ProviderDashboardView /> : <CustomerDashboardView />}
      </div>
    </div>
  )
}
