import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Booking, BookingStatus } from '@/types'

const BOOKING_SELECT = '*, service:services(*), provider:providers(*), address:addresses(*)'

export function useBookings() {
  const { user } = useAuthStore()
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'customer', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('customer_id', user!.id)
        .order('scheduled_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as Booking[]
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  })
}

export function useBooking(id: string | undefined) {
  return useQuery<Booking>({
    queryKey: ['booking', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('id', id!)
        .single()
      if (error) throw error
      return data as Booking
    },
    enabled: !!id,
    staleTime: 1000 * 30,
  })
}

// Provider job queue: open Pending bookings + their own active bookings
export function useProviderBookings(providerId: string | undefined) {
  return useQuery<Booking[]>({
    queryKey: ['bookings', 'provider', providerId],
    queryFn: async () => {
      // Open Pending jobs (no provider assigned yet)
      const { data: pendingData, error: pendingError } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('status', 'Pending')
        .is('provider_id', null)
        .order('scheduled_at', { ascending: true })

      if (pendingError) throw pendingError

      // Active jobs assigned to this provider
      const { data: activeData, error: activeError } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .eq('provider_id', providerId!)
        .not('status', 'in', '("Pending","Rejected","Completed","Cancelled")')
        .order('scheduled_at', { ascending: true })

      if (activeError) throw activeError

      return [...(pendingData ?? []), ...(activeData ?? [])] as Booking[]
    },
    enabled: !!providerId,
    staleTime: 1000 * 30,
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
          status: 'Pending',
        })
        .select()
        .single()
      if (error) throw error
      return data as Booking
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })
}

interface UpdateStatusInput {
  bookingId: string
  status: BookingStatus
  providerId?: string // set when provider accepts (claims the job)
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, status, providerId }: UpdateStatusInput) => {
      const update: Record<string, unknown> = { status }
      if (providerId) update.provider_id = providerId
      const { data, error } = await supabase
        .from('bookings')
        .update(update)
        .eq('id', bookingId)
        .select()
        .single()
      if (error) throw error
      return data as Booking
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['booking', data.id] })
    },
  })
}
