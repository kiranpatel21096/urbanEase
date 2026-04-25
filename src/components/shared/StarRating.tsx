import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeMap = { sm: 12, md: 16, lg: 20 }

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue,
  className,
}: StarRatingProps) {
  const px = sizeMap[size]
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, i) => (
        <Star
          key={i}
          size={px}
          className={
            i < Math.floor(rating)
              ? 'fill-accent text-accent'
              : i < rating
              ? 'fill-accent/50 text-accent'
              : 'fill-muted text-muted-foreground'
          }
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>
      )}
    </div>
  )
}
