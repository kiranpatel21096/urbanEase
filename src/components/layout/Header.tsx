import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { User as AppUser } from '@/types'

// ── Nav link definitions per role ─────────────────────────────────────────────

function getNavLinks(user: AppUser | null) {
  const publicLinks = [
    { to: '/services', label: 'Services' },
    { to: '/search',   label: 'Find Pros' },
  ]

  if (!user) return publicLinks

  if (user.role === 'admin') {
    return [
      { to: '/admin',          label: 'Dashboard' },
      { to: '/admin/bookings', label: 'Bookings' },
      { to: '/admin/users',    label: 'Users' },
      { to: '/admin/services', label: 'Services' },
    ]
  }

  if (user.role === 'provider') {
    return [
      { to: '/dashboard',              label: 'Home' },
      ...publicLinks,
      { to: '/dashboard/bookings',     label: 'Job Queue' },
      { to: '/dashboard/availability', label: 'Availability' },
    ]
  }

  // customer
  return [
    { to: '/dashboard',          label: 'Home' },
    ...publicLinks,
    { to: '/dashboard/bookings', label: 'My Bookings' },
  ]
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Header() {
  const [scrolled, setScrolled]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    setProfileOpen(false)
    await supabase.auth.signOut()
    navigate('/')
  }

  const navLinks = getNavLinks(user)
  const logoTo   = user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/'

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-card border-b border-border'
          : 'bg-white border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link to={logoTo} className="flex items-center gap-2 flex-shrink-0 mr-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="font-bold text-xl text-foreground">
              Urban<span className="text-primary">Ease</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2 flex-1 overflow-x-auto">
            {navLinks.map(({ to, label }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User menu (Profile + Logout only) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <User size={14} className="text-primary" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-xl border border-border py-1 z-50"
                    >
                      <Link
                        to="/dashboard/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <User size={14} className="text-primary" /> Profile
                      </Link>
                      <hr className="my-1 border-border" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
                <Button size="sm" onClick={() => navigate('/register')}>Sign Up</Button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-white"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}

              {user ? (
                <>
                  <hr className="border-border my-1" />
                  <NavLink
                    to="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      cn('block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                        isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted')
                    }
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate('/login'); setMenuOpen(false) }}>
                    Login
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => { navigate('/register'); setMenuOpen(false) }}>
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
