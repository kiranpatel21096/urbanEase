import { useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, BadgeCheck } from 'lucide-react'
import type { Provider } from '@/types'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/shared/StarRating'

interface ProviderCardProps {
  provider: Provider
  compact?: boolean
}

export function ProviderCard({ provider, compact }: ProviderCardProps) {
  const navigate = useNavigate()

  if (compact) {
    return (
      <div
        onClick={() => navigate(`/providers/${provider.id}`)}
        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-border hover:shadow-card-hover transition-all cursor-pointer"
      >
        <img
          src={provider.avatar_url}
          alt={provider.name}
          className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-semibold text-sm text-foreground">{provider.name}</p>
            {provider.is_verified && <BadgeCheck size={14} className="text-primary" />}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin size={10} />{provider.city}</span>
            <span className="flex items-center gap-1"><Briefcase size={10} />{provider.experience_years} yrs</span>
          </div>
          <StarRating rating={provider.avg_rating} size="sm" showValue className="mt-1" />
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => navigate(`/providers/${provider.id}`)}
      className="bg-white rounded-2xl border border-border p-5 hover:shadow-card-hover transition-all cursor-pointer"
    >
      <div className="flex items-start gap-4 mb-4">
        <img
          src={provider.avatar_url}
          alt={provider.name}
          className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
        />
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-semibold text-foreground">{provider.name}</h3>
            {provider.is_verified && <BadgeCheck size={16} className="text-primary" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><MapPin size={12} />{provider.city}</span>
            <span className="flex items-center gap-1"><Briefcase size={12} />{provider.experience_years} yrs</span>
          </div>
          <StarRating rating={provider.avg_rating} size="sm" showValue />
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{provider.bio}</p>
      <div className="flex flex-wrap gap-1.5">
        {provider.skills.slice(0, 3).map((skill) => (
          <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
        ))}
        {provider.skills.length > 3 && (
          <Badge variant="outline" className="text-xs">+{provider.skills.length - 3}</Badge>
        )}
      </div>
    </div>
  )
}
