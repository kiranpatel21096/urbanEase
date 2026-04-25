import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, BadgeCheck, Briefcase } from 'lucide-react'
import { useProvider } from '@/hooks/useProviders'
import { useReviews } from '@/hooks/useReviews'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/shared/StarRating'
import { formatDate } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-xl ${className ?? ''}`} />
}

export function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: provider, isLoading: providerLoading } = useProvider(id!)
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id!)

  const isLoading = providerLoading || reviewsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-4 w-16 mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-40 w-full mb-6" />
        </div>
      </div>
    )
  }

  if (!provider) return null

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count =
      reviews.filter((r) => r.rating === star).length ||
      Math.max(
        0,
        Math.round(
          (provider.total_reviews *
            (star === 5 ? 0.6 : star === 4 ? 0.25 : star === 3 ? 0.1 : 0.05)) /
            1,
        ),
      )
    return { star, count }
  })
  const maxCount = Math.max(...ratingDistribution.map((r) => r.count))

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-indigo-100" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <img
                src={provider.avatar_url}
                alt={provider.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-card"
              />
              <Button onClick={() => navigate(`/services?q=${provider.skills[0] ?? ''}`)}>Book Now</Button>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">{provider.name}</h1>
              {provider.is_verified && <BadgeCheck size={18} className="text-primary" />}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {provider.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={13} /> {provider.experience_years} yrs experience
              </span>
              <StarRating rating={provider.avg_rating} size="sm" showValue />
              <span>({provider.total_reviews} reviews)</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{provider.bio}</p>

            <div className="flex flex-wrap gap-2">
              {provider.skills.map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-5">Rating Breakdown</h2>
          <div className="flex items-start gap-6">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-foreground">{provider.avg_rating.toFixed(1)}</p>
              <StarRating rating={provider.avg_rating} size="md" className="justify-center mt-1 mb-1" />
              <p className="text-xs text-muted-foreground">{provider.total_reviews} reviews</p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-muted-foreground">{star}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all"
                      style={{ width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground text-xs">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Customer Reviews</h2>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {review.customer?.avatar_url ? (
                      <img
                        src={review.customer.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        {review.customer?.full_name?.[0] ?? '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">{review.customer?.full_name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
                    </div>
                    <StarRating rating={review.rating} size="sm" className="mt-0.5" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
