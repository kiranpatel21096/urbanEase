import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { Skeleton } from '@/components/shared/LoadingSkeleton'

const HomePage             = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const ServicesPage         = lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const ServiceDetailPage    = lazy(() => import('@/pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })))
const ProviderProfilePage  = lazy(() => import('@/pages/ProviderProfilePage').then((m) => ({ default: m.ProviderProfilePage })))
const BookingPage          = lazy(() => import('@/pages/BookingPage').then((m) => ({ default: m.BookingPage })))
const LoginPage            = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage         = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const AuthCallbackPage     = lazy(() => import('@/pages/AuthCallbackPage').then((m) => ({ default: m.AuthCallbackPage })))
const DashboardBookingsPage = lazy(() => import('@/pages/DashboardBookingsPage').then((m) => ({ default: m.DashboardBookingsPage })))
const ProfilePage          = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SearchPage           = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const NotFoundPage         = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

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

const router = createBrowserRouter([
  // ── Auth pages (no layout shell) ──────────────────────────────────────────
  { path: '/login',         element: <S><LoginPage /></S> },
  { path: '/register',      element: <S><RegisterPage /></S> },
  { path: '/auth/callback', element: <S><AuthCallbackPage /></S> },

  // ── Main app (with Header + Footer) ───────────────────────────────────────
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,                  element: <S><HomePage /></S> },
      { path: 'services',             element: <S><ServicesPage /></S> },
      { path: 'services/:id',         element: <S><ServiceDetailPage /></S> },
      { path: 'providers/:id',        element: <S><ProviderProfilePage /></S> },
      { path: 'search',               element: <S><SearchPage /></S> },

      // Protected — requires sign-in
      {
        path: 'book/:serviceId',
        element: <S><ProtectedRoute><BookingPage /></ProtectedRoute></S>,
      },
      {
        path: 'dashboard/bookings',
        element: <S><ProtectedRoute><DashboardBookingsPage /></ProtectedRoute></S>,
      },
      {
        path: 'dashboard/profile',
        element: <S><ProtectedRoute><ProfilePage /></ProtectedRoute></S>,
      },

      { path: '*', element: <S><NotFoundPage /></S> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
