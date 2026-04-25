import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Star, ArrowLeft, BadgeCheck } from 'lucide-react'
import { useService } from '@/hooks/useServices'
import { useProviders } from '@/hooks/useProviders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/shared/StarRating'
import { ProviderCard } from '@/components/provider/ProviderCard'
import { formatPrice } from '@/lib/utils'

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-muted animate-pulse rounded-xl ${className ?? ''}`} />
}

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: service, isLoading: serviceLoading } = useService(id!)
  const { data: allProviders = [], isLoading: providersLoading } = useProviders()

  const isLoading = serviceLoading || providersLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-4 w-28 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!service) return null

  const providers = allProviders
    .filter((p) =>
      p.skills.some(
        (sk) =>
          service.category.toLowerCase().includes(sk.toLowerCase()) ||
          sk.toLowerCase().includes(service.category.toLowerCase()),
      ),
    )
    .slice(0, 3)

  const displayProviders = providers.length > 0 ? providers : allProviders.slice(0, 2)

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden border border-border">
              <img
                src={service.thumbnail_url}
                alt={service.name}
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{service.category}</Badge>
                      {service.badge && <Badge variant="accent">{service.badge}</Badge>}
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{service.name}</h1>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Starting at</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(service.base_price)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    {service.duration_minutes} min
                  </div>
                  {service.avg_rating && (
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={service.avg_rating} size="sm" showValue />
                      <span>({service.total_reviews?.toLocaleString()} reviews)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <BadgeCheck size={14} className="text-success" />
                    Verified pros only
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            </div>

            {/* What's included */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">What's Included</h2>
              <ul className="space-y-2">
                {[
                  'Professional-grade tools and materials',
                  'Trained and background-verified expert',
                  'Before & after cleanup',
                  '30-day service warranty',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <BadgeCheck size={16} className="text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Available Providers */}
            {displayProviders.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-foreground mb-4">Available Professionals</h2>
                <div className="space-y-3">
                  {displayProviders.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} compact />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky booking card */}
          <div>
            <div className="sticky top-24 bg-white rounded-2xl border border-border p-6 shadow-card">
              <p className="text-xs text-muted-foreground mb-1">Starting at</p>
              <p className="text-3xl font-extrabold text-primary mb-1">{formatPrice(service.base_price)}</p>
              <div className="flex items-center gap-1 mb-6">
                <Star size={14} className="fill-accent text-accent" />
                <span className="text-sm font-medium">{service.avg_rating?.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({service.total_reviews?.toLocaleString()})</span>
              </div>

              <Button
                size="lg"
                className="w-full mb-3"
                onClick={() => navigate(`/book/${service.id}`)}
              >
                Book Now
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={() => navigate(`/search?q=${service.category}`)}>
                View All Providers
              </Button>

              <div className="mt-6 pt-5 border-t border-border space-y-2">
                {['Fixed, upfront pricing', 'On-time guarantee', '30-day service warranty', 'Secure checkout'].map(
                  (f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <BadgeCheck size={13} className="text-success" />
                      {f}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
