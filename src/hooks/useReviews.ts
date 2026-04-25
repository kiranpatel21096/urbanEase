import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Review } from '@/types'

export function useReviews(providerId: string) {
  return useQuery<Review[]>({
    queryKey: ['reviews', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, customer:profiles(full_name, avatar_url)')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Review[]
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5,
  })
}
