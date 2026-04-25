import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { formatDate, formatPrice } from '@/lib/utils'
import type { BookingStatus } from '@/types'
import { mockServices, mockProviders } from '@/data/mockData'

type Tab = 'upcoming' | 'completed' | 'cancelled'

const mockBookings = [
  {
    id: 'b1',
    service: mockServices[7],
    provider: mockProviders[0],
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Confirmed' as BookingStatus,
    total_price: mockServices[7].base_price + 49,
    address: { line1: '12, Shyamal Row Houses, Satellite', city: 'Ahmedabad' },
  },
  {
    id: 'b2',
    service: mockServices[1],
    provider: mockProviders[3],
    scheduled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Completed' as BookingStatus,
    total_price: mockServices[1].base_price + 49,
    address: { line1: '12, Shyamal Row Houses, Satellite', city: 'Ahmedabad' },
  },
]

const statusVariant: Record<BookingStatus, 'default' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  Confirmed: 'default',
  'Pro Assigned': 'warning',
  'On the Way': 'warning',
  Arrived: 'warning',
  'In Progress': 'warning',
  Completed: 'success',
  Cancelled: 'destructive',
}

export function DashboardBookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const filtered = mockBookings.filter((b) => {
    if (activeTab === 'upcoming') return ['Confirmed', 'Pro Assigned', 'On the Way', 'Arrived', 'In Progress'].includes(b.status)
    if (activeTab === 'completed') return b.status === 'Completed'
    return b.status === 'Cancelled'
  })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Bookings</h1>

        {/* Tabs */}
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

        {/* Bookings list */}
        {filtered.length === 0 ? (
          <EmptyState
            title={`No ${activeTab} bookings`}
            description="When you book a service, it will appear here."
            actionLabel="Book a Service"
            onAction={() => navigate('/services')}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(`/dashboard/bookings/${booking.id}`)}
                className="bg-white rounded-2xl border border-border p-5 cursor-pointer hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={booking.service.thumbnail_url}
                    alt={booking.service.name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{booking.service.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.provider.name}</p>
                      </div>
                      <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar size={12} />{formatDate(booking.scheduled_at)}</span>
                      <span className="flex items-center gap-1"><Clock size={12} />{booking.service.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{booking.address.city}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-bold text-primary">{formatPrice(booking.total_price)}</span>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
