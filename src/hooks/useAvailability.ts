import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProviderAvailability } from '@/types'

export function useProviderAvailability(providerId: string | undefined) {
  return useQuery<ProviderAvailability[]>({
    queryKey: ['availability', providerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId!)
        .order('day_of_week')
      if (error) throw error
      return (data ?? []) as ProviderAvailability[]
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5,
  })
}

interface UpsertAvailabilityInput {
  provider_id: string
  day_of_week: number
  time_slot: string
  is_available: boolean
}

export function useUpsertAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpsertAvailabilityInput) => {
      const { data, error } = await supabase
        .from('provider_availability')
        .upsert(input, { onConflict: 'provider_id,day_of_week,time_slot' })
        .select()
        .single()
      if (error) throw error
      return data as ProviderAvailability
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['availability', data.provider_id] })
    },
  })
}
