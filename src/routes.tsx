import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { AdminRoute } from '@/components/shared/AdminRoute'
import { Skeleton } from '@/components/shared/LoadingSkeleton'
import { useAuthStore } from '@/store/authStore'

// ── Page imports ──────────────────────────────────────────────────────────────
const HomePage                  = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const ServicesPage              = lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const ServiceDetailPage         = lazy(() => import('@/pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })))
const ProviderProfilePage       = lazy(() => import('@/pages/ProviderProfilePage').then((m) => ({ default: m.ProviderProfilePage })))
const BookingPage               = lazy(() => import('@/pages/BookingPage').then((m) => ({ default: m.BookingPage })))
const BookingDetailPage         = lazy(() => import('@/pages/BookingDetailPage').then((m) => ({ default: m.BookingDetailPage })))
const LoginPage                 = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage              = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage        = lazy(() => import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage         = lazy(() => import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })))
const AuthCallbackPage          = lazy(() => import('@/pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })))
const DashboardPage             = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const DashboardBookingsPage     = lazy(() => import('@/pages/DashboardBookingsPage').then((m) => ({ default: m.DashboardBookingsPage })))
const DashboardAvailabilityPage = lazy(() => import('@/pages/DashboardAvailabilityPage').then((m) => ({ default: m.DashboardAvailabilityPage })))
const ProfilePage               = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SearchPage                = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const NotFoundPage              = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

// Admin pages
const AdminLayout               = lazy(() => import('@/pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const AdminDashboardPage        = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminBookingsPage         = lazy(() => import('@/pages/admin/AdminBookingsPage').then((m) => ({ default: m.AdminBookingsPage })))
const AdminUsersPage            = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminServicesPage         = lazy(() => import('@/pages/admin/AdminServicesPage').then((m) => ({ default: m.AdminServicesPage })))

// ── Helpers ───────────────────────────────────────────────────────────────────

function PageFallback() {
  return (
    <div className="p-8 space-y-4 max-w-7xl mx-auto">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

/** Redirect authenticated users away from public-only pages. */
function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isInitialized } = useAuthStore()
  if (isLoading || !isInitialized) return <PageFallback />
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return <>{children}</>
}

// ── Router ────────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // ── Auth pages ──────────────────────────────────────────────────────────────
  { path: '/login',           element: <S><LoginPage /></S> },
  { path: '/register',        element: <S><RegisterPage /></S> },
  { path: '/forgot-password', element: <S><ForgotPasswordPage /></S> },
  { path: '/reset-password',  element: <S><ResetPasswordPage /></S> },
  { path: '/auth/callback',   element: <S><AuthCallbackPage /></S> },

  // ── Admin panel (separate layout, no Header/Footer) ──────────────────────
  {
    path: '/admin',
    element: <S><AdminRoute><AdminLayout /></AdminRoute></S>,
    children: [
      { index: true,      element: <S><AdminDashboardPage /></S> },
      { path: 'bookings', element: <S><AdminBookingsPage /></S> },
      { path: 'users',    element: <S><AdminUsersPage /></S> },
      { path: 'services', element: <S><AdminServicesPage /></S> },
    ],
  },

  // ── Main app (with Header + Footer) ─────────────────────────────────────────
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,            element: <GuestOnlyRoute><S><HomePage /></S></GuestOnlyRoute> },
      { path: 'services',       element: <S><ServicesPage /></S> },
      { path: 'services/:id',   element: <S><ServiceDetailPage /></S> },
      { path: 'providers/:id',  element: <S><ProviderProfilePage /></S> },
      { path: 'search',         element: <S><SearchPage /></S> },
      {
        path: 'terms',
        element: <S><div className="min-h-screen flex items-center justify-center p-8 text-center"><div><h1 className="text-2xl font-bold mb-3">Terms of Service</h1><p className="text-muted-foreground">Full terms coming soon.</p></div></div></S>,
      },
      {
        path: 'privacy',
        element: <S><div className="min-h-screen flex items-center justify-center p-8 text-center"><div><h1 className="text-2xl font-bold mb-3">Privacy Policy</h1><p className="text-muted-foreground">Full policy coming soon.</p></div></div></S>,
      },

      // ── Protected — requires sign-in ────────────────────────────────────────
      { path: 'book/:serviceId',          element: <S><ProtectedRoute><BookingPage /></ProtectedRoute></S> },
      { path: 'dashboard',                element: <S><ProtectedRoute><DashboardPage /></ProtectedRoute></S> },
      { path: 'dashboard/bookings',       element: <S><ProtectedRoute><DashboardBookingsPage /></ProtectedRoute></S> },
      { path: 'dashboard/bookings/:id',   element: <S><ProtectedRoute><BookingDetailPage /></ProtectedRoute></S> },
      { path: 'dashboard/availability',   element: <S><ProtectedRoute><DashboardAvailabilityPage /></ProtectedRoute></S> },
      { path: 'dashboard/profile',        element: <S><ProtectedRoute><ProfilePage /></ProtectedRoute></S> },

      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },
])
