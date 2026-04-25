import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatPrice } from '@/lib/utils'
import type { Booking, BookingStatus } from '@/types'

const ALL_STATUSES: BookingStatus[] = [
  'Pending', 'Confirmed', 'Rejected', 'Pro Assigned',
  'On the Way', 'Arrived', 'In Progress', 'Completed', 'Cancelled',
]

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

function useAllBookings(statusFilter: BookingStatus | 'all') {
  return useQuery<Booking[]>({
    queryKey: ['admin', 'bookings', statusFilter],
    queryFn: async () => {
      let q = supabase
        .from('bookings')
        .select('*, service:services(name, thumbnail_url), provider:providers(name), address:addresses(city)')
        .order('created_at', { ascending: false })
      if (statusFilter !== 'all') q = q.eq('status', statusFilter)
      const { data, error } = await q
      if (error) throw error
      return (data ?? []) as Booking[]
    },
    staleTime: 1000 * 30,
  })
}

export function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const { data: bookings = [], isLoading } = useAllBookings(statusFilter)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">All Bookings</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            statusFilter === 'all' ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
          }`}
        >
          All
        </button>
        {ALL_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              statusFilter === s ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings found.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">ID</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Service</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Provider</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Date</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                    {b.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3 font-medium">{b.service?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.provider?.name ?? 'Unassigned'}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(b.scheduled_at)}</td>
                  <td className="px-5 py-3 font-semibold text-primary">{formatPrice(b.total_price)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
