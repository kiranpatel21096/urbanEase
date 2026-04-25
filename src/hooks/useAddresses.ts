import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Address, AddressLabel } from '@/types'

export function useAddresses() {
  const { user } = useAuthStore()
  return useQuery<Address[]>({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_default', { ascending: false })
      if (error) throw error
      return (data ?? []) as Address[]
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  })
}

interface CreateAddressInput {
  label: AddressLabel
  line1: string
  city: string
  pincode: string
  is_default?: boolean
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (input: CreateAddressInput) => {
      if (input.is_default) {
        // Unset any existing default for this user
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user!.id)
      }
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...input, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      return data as Address
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}

export function useDeleteAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (addressId: string) => {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}
