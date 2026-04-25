import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users, CalendarCheck, Briefcase, Clock, IndianRupee, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { BookingStatus } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalBookings: number
  pendingBookings: number
  activeBookings: number
  totalProviders: number
  totalCustomers: number
  totalRevenue: number
}

interface RecentBooking {
  id: string
  status: BookingStatus
  total_price: number
  scheduled_at: string
  service: { name: string } | null
  customer_profile: { full_name: string } | null
}

interface RecentUser {
  id: string
  full_name: string
  email: string
  role: string
  created_at: string
}

// ─── Queries ──────────────────────────────────────────────────────────────────

function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const [totalRes, pendingRes, activeRes, providersRes, customersRes, revenueRes] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('bookings').select('id', { count: 'exact', head: true })
          .not('status', 'in', '("Completed","Cancelled","Rejected")'),
        supabase.from('providers').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
        supabase.from('bookings').select('total_price').eq('status', 'Completed'),
      ])
      const revenue = (revenueRes.data ?? []).reduce(
        (sum, b) => sum + ((b as { total_price: number }).total_price ?? 0), 0
      )
      return {
        totalBookings:   totalRes.count    ?? 0,
        pendingBookings: pendingRes.count   ?? 0,
        activeBookings:  activeRes.count    ?? 0,
        totalProviders:  providersRes.count ?? 0,
        totalCustomers:  customersRes.count ?? 0,
        totalRevenue:    revenue,
      }
    },
    staleTime: 1000 * 60,
  })
}

function useRecentBookings() {
  return useQuery<RecentBooking[]>({
    queryKey: ['admin', 'recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, status, total_price, scheduled_at, service:services(name), customer_profile:profiles!customer_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return (data ?? []) as unknown as RecentBooking[]
    },
    staleTime: 1000 * 60,
  })
}

function useRecentUsers() {
  return useQuery<RecentUser[]>({
    queryKey: ['admin', 'recent-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return (data ?? []) as RecentUser[]
    },
    staleTime: 1000 * 60,
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

const roleBadge: Record<string, string> = {
  customer: 'bg-blue-50 text-blue-700',
  provider: 'bg-green-50 text-green-700',
  admin:    'bg-purple-50 text-purple-700',
}

function KpiCard({
  label, value, icon: Icon, color, loading,
}: {
  label: string; value: string | number; icon: React.ElementType; color: string; loading: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={18} />
      </div>
      {loading ? (
        <div className="h-7 w-20 bg-muted rounded animate-pulse mb-1" />
      ) : (
        <p className="text-2xl font-bold text-foreground">{value}</p>
      )}
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

function SectionHeader({ title, to, linkLabel }: { title: string; to: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <Link to={to} className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
        {linkLabel} <ArrowRight size={12} />
      </Link>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: recentBookings = [], isLoading: bookingsLoading } = useRecentBookings()
  const { data: recentUsers = [], isLoading: usersLoading } = useRecentUsers()

  const kpiCards = [
    { label: 'Total Bookings',    value: stats?.totalBookings   ?? 0, icon: CalendarCheck, color: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Requests',  value: stats?.pendingBookings ?? 0, icon: Clock,         color: 'bg-amber-50 text-amber-600' },
    { label: 'Active Providers',  value: stats?.totalProviders  ?? 0, icon: Briefcase,     color: 'bg-green-50 text-green-600' },
    { label: 'Customers',         value: stats?.totalCustomers  ?? 0, icon: Users,         color: 'bg-purple-50 text-purple-600' },
    { label: 'Active Bookings',   value: stats?.activeBookings  ?? 0, icon: TrendingUp,    color: 'bg-cyan-50 text-cyan-600' },
    {
      label: 'Revenue (Completed)',
      value: statsLoading ? '—' : formatPrice(stats?.totalRevenue ?? 0),
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-600',
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Overview</h1>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map(({ label, value, icon, color }) => (
          <KpiCard key={label} label={label} value={value} icon={icon} color={color} loading={statsLoading} />
        ))}
      </div>

      {/* Recent bookings + recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <SectionHeader title="Recent Bookings" to="/admin/bookings" linkLabel="View all" />
          {bookingsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No bookings yet.</p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {recentBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {b.service?.name ?? 'Unknown service'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {b.customer_profile?.full_name ?? '—'} · {formatDate(b.scheduled_at)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <Badge variant={statusVariant[b.status]} className="text-xs">{b.status}</Badge>
                    <p className="text-xs font-semibold text-primary mt-1">{formatPrice(b.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <SectionHeader title="Recent Sign-ups" to="/admin/users" linkLabel="View all" />
          {usersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No users yet.</p>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs">
                    {u.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${roleBadge[u.role] ?? 'bg-muted text-muted-foreground'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Manage Bookings', to: '/admin/bookings', color: 'bg-blue-50 text-blue-700 border-blue-100' },
            { label: 'Manage Users',    to: '/admin/users',    color: 'bg-purple-50 text-purple-700 border-purple-100' },
            { label: 'Manage Services', to: '/admin/services', color: 'bg-green-50 text-green-700 border-green-100' },
          ].map(({ label, to, color }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:shadow-sm ${color}`}
            >
              {label} <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
