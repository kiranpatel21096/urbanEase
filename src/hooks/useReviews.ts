import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Review } from '@/types'

export function useReviews(providerId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: ['reviews', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, customer:profiles(full_name, avatar_url)')
        .eq('provider_id', providerId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Review[]
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5,
  })
}

export function useBookingReview(bookingId: string | undefined) {
  return useQuery<Review | null>({
    queryKey: ['review', 'booking', bookingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId!)
        .maybeSingle()
      if (error) throw error
      return data as Review | null
    },
    enabled: !!bookingId,
    staleTime: 1000 * 60 * 5,
  })
}

interface CreateReviewInput {
  booking_id: string
  provider_id: string
  rating: number
  comment: string
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({ ...input, customer_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as Review
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.provider_id] })
      queryClient.invalidateQueries({ queryKey: ['review', 'booking', data.booking_id] })
      queryClient.invalidateQueries({ queryKey: ['booking', data.booking_id] })
    },
  })
}
