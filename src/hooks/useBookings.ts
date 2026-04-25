import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Booking } from '@/types'

export function useBookings() {
  const { user } = useAuthStore()
  return useQuery<Booking[]>({
    queryKey: ['bookings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, service:services(*), provider:providers(*), address:addresses(*)')
        .eq('customer_id', user!.id)
        .order('scheduled_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Booking[]
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  })
}

interface CreateBookingInput {
  service_id: string
  address_id: string
  scheduled_at: string
  total_price: number
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (input: CreateBookingInput) => {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          customer_id: user!.id,
          service_id: input.service_id,
          address_id: input.address_id,
          scheduled_at: input.scheduled_at,
          total_price: input.total_price,
          status: 'Confirmed',
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}
