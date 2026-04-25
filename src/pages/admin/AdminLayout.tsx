import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, Users, Wrench, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/bookings', end: false, icon: CalendarCheck, label: 'Bookings' },
  { to: '/admin/users', end: false, icon: Users, label: 'Users' },
  { to: '/admin/services', end: false, icon: Wrench, label: 'Services' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  async function handleLogout() {
    await supabase.auth.signOut()
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-border flex flex-col fixed h-full z-10">
        <div className="px-6 py-5 border-b border-border">
          <span className="text-xl font-extrabold text-primary">UrbanEase</span>
          <span className="ml-2 text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">Admin</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-7 py-4 text-sm text-muted-foreground hover:text-destructive transition-colors border-t border-border"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
