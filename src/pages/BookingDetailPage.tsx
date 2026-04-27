import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, MapPin, Star, CheckCircle2, Circle, Loader2, ExternalLink, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBooking, useUpdateBookingStatus } from '@/hooks/useBookings'
import { useBookingReview, useCreateReview } from '@/hooks/useReviews'
import { useAuthStore } from '@/store/authStore'
import { formatDate, formatPrice } from '@/lib/utils'
import type { BookingStatus } from '@/types'

const STATUS_TIMELINE: BookingStatus[] = [
  'Pending', 'Confirmed', 'Pro Assigned', 'On the Way', 'Arrived', 'In Progress', 'Completed',
]

const STATUS_LABELS: Record<BookingStatus, string> = {
  Pending: 'Request sent, awaiting professional',
  Confirmed: 'Professional accepted your booking',
  Rejected: 'Booking was rejected',
  'Pro Assigned': 'Professional assigned to your job',
  'On the Way': 'Professional is on the way',
  Arrived: 'Professional has arrived',
  'In Progress': 'Service is in progress',
  Completed: 'Service completed',
  Cancelled: 'Booking cancelled',
}

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

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: booking, isLoading } = useBooking(id)
  const { data: existingReview } = useBookingReview(id)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateBookingStatus()
  const { mutateAsync: createReview, isPending: isReviewing } = useCreateReview()

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Booking not found.</p>
          <Button onClick={() => navigate('/dashboard/bookings')} className="mt-4">Back to Bookings</Button>
        </div>
      </div>
    )
  }

  const isCustomer = user?.role === 'customer'
  const canCancel = isCustomer && ['Pending', 'Confirmed'].includes(booking.status)
  const canReview =
    isCustomer &&
    booking.status === 'Completed' &&
    !existingReview &&
    !reviewSubmitted &&
    booking.provider_id

  const timelineStatuses =
    booking.status === 'Cancelled' || booking.status === 'Rejected'
      ? [booking.status]
      : STATUS_TIMELINE

  const currentIdx = timelineStatuses.indexOf(booking.status)

  async function handleReviewSubmit() {
    if (!rating || !booking?.provider_id) return
    await createReview({
      booking_id: booking.id,
      provider_id: booking.provider_id,
      rating,
      comment,
    })
    setReviewSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <button
          onClick={() => navigate('/dashboard/bookings')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Bookings
        </button>

        {/* Booking header */}
        <div className="bg-white rounded-3xl border border-border p-6 mb-4">
          <div className="flex items-start gap-4 mb-5">
            {booking.service?.thumbnail_url && (
              <img
                src={booking.service.thumbnail_url}
                alt={booking.service.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-lg font-bold text-foreground">{booking.service?.name}</h1>
                  <p className="text-sm text-muted-foreground">{booking.service?.category}</p>
                </div>
                <Badge variant={statusVariant[booking.status]}>{booking.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Booking #{booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar size={14} className="text-primary" />
              <span>{formatDate(booking.scheduled_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={14} className="text-primary" />
              <span>{booking.service?.duration_minutes} min</span>
            </div>
            {booking.address && (
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <MapPin size={14} className="text-primary" />
                <span>{booking.address.line1}, {booking.address.city}</span>
              </div>
            )}
          </div>

          {/* Provider info — links to provider profile */}
          {booking.provider ? (
            <Link
              to={`/providers/${booking.provider.id}`}
              className="mt-4 pt-4 border-t border-border flex items-center gap-3 hover:bg-muted/40 -mx-6 px-6 py-3 transition-colors group"
            >
              <img
                src={booking.provider.avatar_url}
                alt={booking.provider.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {booking.provider.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  ⭐ {booking.provider.avg_rating} · {booking.provider.total_reviews} reviews · {booking.provider.city}
                </p>
              </div>
              <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </Link>
          ) : (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">Awaiting professional assignment…</p>
            </div>
          )}

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-primary">{formatPrice(booking.total_price)}</span>
          </div>
        </div>

        {/* Status timeline */}
        {!['Cancelled', 'Rejected'].includes(booking.status) && (
          <div className="bg-white rounded-3xl border border-border p-6 mb-4">
            <h2 className="text-base font-bold mb-5">Booking Progress</h2>
            <div className="space-y-0">
              {timelineStatuses.map((status, idx) => {
                const done = idx < currentIdx
                const active = idx === currentIdx
                const future = idx > currentIdx
                return (
                  <div key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        done ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {done ? <CheckCircle2 size={15} /> : active ? <Circle size={15} className="fill-white/50" /> : <Circle size={15} />}
                      </div>
                      {idx < timelineStatuses.length - 1 && (
                        <div className={`w-0.5 h-8 ${done ? 'bg-success' : 'bg-border'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${future ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {status}
                      </p>
                      {active && (
                        <p className="text-xs text-muted-foreground mt-0.5">{STATUS_LABELS[status]}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Rejected/Cancelled message */}
        {(booking.status === 'Rejected' || booking.status === 'Cancelled') && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 mb-4">
            <p className="text-sm font-semibold text-destructive mb-1">
              {booking.status === 'Rejected' ? 'Booking Rejected' : 'Booking Cancelled'}
            </p>
            <p className="text-sm text-muted-foreground">
              {booking.status === 'Rejected'
                ? 'The professional was unable to accept this request. Please try booking again.'
                : 'This booking has been cancelled.'}
            </p>
            {isCustomer && booking.status === 'Rejected' && (
              <Button size="sm" className="mt-3" onClick={() => navigate('/services')}>
                Book Again
              </Button>
            )}
          </div>
        )}

        {/* Service cross-link: view service or book again */}
        {booking.service && (
          <div className="bg-white rounded-2xl border border-border p-5 mb-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">About the Service</p>
            <div className="flex items-center gap-4">
              {booking.service.thumbnail_url && (
                <img
                  src={booking.service.thumbnail_url}
                  alt={booking.service.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{booking.service.name}</p>
                <p className="text-xs text-muted-foreground">{booking.service.category} · {booking.service.duration_minutes} min</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link
                to={`/services/${booking.service_id}`}
                className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-primary border border-primary/30 rounded-xl py-2.5 hover:bg-primary/5 transition-colors"
              >
                <ExternalLink size={14} /> View Service
              </Link>
              {isCustomer && (
                <Link
                  to={`/book/${booking.service_id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium bg-primary text-white rounded-xl py-2.5 hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw size={14} /> Book Again
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Cancel button */}
        {canCancel && (
          <div className="bg-white rounded-2xl border border-border p-5 mb-4">
            <p className="text-sm text-muted-foreground mb-3">Need to cancel this booking?</p>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/5"
              disabled={isUpdating}
              onClick={() => updateStatus({ bookingId: booking.id, status: 'Cancelled' })}
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
              Cancel Booking
            </Button>
          </div>
        )}

        {/* Review section */}
        {canReview && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-border p-6 mb-4"
          >
            <h2 className="text-base font-bold mb-4">Leave a Review</h2>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience…"
              rows={3}
              className="w-full resize-none rounded-xl border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
            />
            <Button
              size="sm"
              className="w-full"
              disabled={!rating || isReviewing}
              onClick={handleReviewSubmit}
            >
              {isReviewing ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
              Submit Review
            </Button>
          </motion.div>
        )}

        {reviewSubmitted && (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-5 mb-4 text-center">
            <p className="text-sm font-semibold text-success">Review submitted! Thank you.</p>
          </div>
        )}

        {existingReview && !reviewSubmitted && (
          <div className="bg-white rounded-2xl border border-border p-5 mb-4">
            <p className="text-sm font-medium mb-2">Your review</p>
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}
                />
              ))}
            </div>
            {existingReview.comment && (
              <p className="text-sm text-muted-foreground">{existingReview.comment}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
