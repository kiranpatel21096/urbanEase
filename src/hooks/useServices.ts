import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Service } from '@/types'

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('total_reviews', { ascending: false })
      if (error) throw error
      return data as Service[]
    },
    staleTime: 1000 * 60 * 10, // 10 min — services don't change often
  })
}

export function useService(id: string) {
  return useQuery<Service>({
    queryKey: ['services', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Service
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
}
