import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Service } from '@/types'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/shared/StarRating'
import { formatPrice } from '@/lib/utils'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/services/${service.id}`)}
      className="group bg-white rounded-2xl border border-border overflow-hidden cursor-pointer hover:shadow-card-hover transition-shadow"
    >
      <div className="relative overflow-hidden">
        <img
          src={service.thumbnail_url}
          alt={service.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {service.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={service.badge === 'Top Rated' ? 'accent' : service.badge === 'New' ? 'success' : 'default'}>
              {service.badge}
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{service.category}</p>
        <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">{service.name}</h3>
        <div className="flex items-center justify-between">
          <p className="font-bold text-primary text-base">{formatPrice(service.base_price)}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} />
            {service.duration_minutes}m
          </div>
        </div>
        {service.avg_rating && (
          <div className="flex items-center gap-1 mt-2">
            <StarRating rating={service.avg_rating} size="sm" showValue />
            <span className="text-xs text-muted-foreground">({service.total_reviews?.toLocaleString()})</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
