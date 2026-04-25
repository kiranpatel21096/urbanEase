import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import { Skeleton } from '@/components/shared/LoadingSkeleton'

const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })))
const ServicesPage = lazy(() => import('@/pages/ServicesPage').then((m) => ({ default: m.ServicesPage })))
const ServiceDetailPage = lazy(() => import('@/pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })))
const ProviderProfilePage = lazy(() => import('@/pages/ProviderProfilePage').then((m) => ({ default: m.ProviderProfilePage })))
const BookingPage = lazy(() => import('@/pages/BookingPage').then((m) => ({ default: m.BookingPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const DashboardBookingsPage = lazy(() => import('@/pages/DashboardBookingsPage').then((m) => ({ default: m.DashboardBookingsPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const SearchPage = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function PageFallback() {
  return (
    <div className="p-8 space-y-4 max-w-7xl mx-auto">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageFallback />}><HomePage /></Suspense> },
      { path: 'services', element: <Suspense fallback={<PageFallback />}><ServicesPage /></Suspense> },
      { path: 'services/:id', element: <Suspense fallback={<PageFallback />}><ServiceDetailPage /></Suspense> },
      { path: 'providers/:id', element: <Suspense fallback={<PageFallback />}><ProviderProfilePage /></Suspense> },
      { path: 'book/:serviceId', element: <Suspense fallback={<PageFallback />}><BookingPage /></Suspense> },
      { path: 'search', element: <Suspense fallback={<PageFallback />}><SearchPage /></Suspense> },
      { path: 'dashboard/bookings', element: <Suspense fallback={<PageFallback />}><DashboardBookingsPage /></Suspense> },
      { path: 'dashboard/profile', element: <Suspense fallback={<PageFallback />}><ProfilePage /></Suspense> },
      { path: '*', element: <Suspense fallback={<PageFallback />}><NotFoundPage /></Suspense> },
    ],
  },
  {
    path: '/login',
    element: <Suspense fallback={<PageFallback />}><LoginPage /></Suspense>,
  },
  {
    path: '/register',
    element: <Suspense fallback={<PageFallback />}><RegisterPage /></Suspense>,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
