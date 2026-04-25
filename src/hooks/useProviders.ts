import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Provider } from '@/types'

function rowToProvider(row: Record<string, unknown>): Provider {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    bio: row.bio as string,
    avatar_url: row.avatar_url as string,
    experience_years: row.experience_years as number,
    avg_rating: row.avg_rating as number,
    total_reviews: row.total_reviews as number,
    skills: row.skills as string[],
    is_verified: row.is_verified as boolean,
    location: { lat: row.lat as number, lng: row.lng as number },
    city: row.city as string,
  }
}

export function useProviders() {
  return useQuery<Provider[]>({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('avg_rating', { ascending: false })
      if (error) throw error
      return (data ?? []).map(rowToProvider)
    },
    staleTime: 1000 * 60 * 10,
  })
}

export function useProvider(id: string | undefined) {
  return useQuery<Provider>({
    queryKey: ['providers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id!)
        .single()
      if (error) throw error
      return rowToProvider(data)
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
}

/** Returns the provider profile row for the currently signed-in provider user. */
export function useMyProvider() {
  const { user } = useAuthStore()
  return useQuery<Provider | null>({
    queryKey: ['my-provider', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (error) throw error
      return data ? rowToProvider(data) : null
    },
    enabled: !!user?.id && user.role === 'provider',
    staleTime: 1000 * 60 * 5,
  })
}
