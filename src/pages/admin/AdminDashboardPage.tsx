import { useQuery } from '@tanstack/react-query'
import { Users, CalendarCheck, Briefcase, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Stats {
  totalBookings: number
  pendingBookings: number
  totalProviders: number
  totalCustomers: number
}

function useAdminStats() {
  return useQuery<Stats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [bookingsRes, pendingRes, providersRes, customersRes] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('providers').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      ])
      return {
        totalBookings: bookingsRes.count ?? 0,
        pendingBookings: pendingRes.count ?? 0,
        totalProviders: providersRes.count ?? 0,
        totalCustomers: customersRes.count ?? 0,
      }
    },
    staleTime: 1000 * 60,
  })
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats()

  const cards = [
    { label: 'Total Bookings', value: stats?.totalBookings ?? 0, icon: CalendarCheck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Requests', value: stats?.pendingBookings ?? 0, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Providers', value: stats?.totalProviders ?? 0, icon: Briefcase, color: 'bg-green-50 text-green-600' },
    { label: 'Customers', value: stats?.totalCustomers ?? 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-foreground mb-8">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            {isLoading ? (
              <div className="h-7 w-16 bg-muted rounded animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
