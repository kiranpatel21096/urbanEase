import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import type { Service } from '@/types'

function useAllServices() {
  return useQuery<Service[]>({
    queryKey: ['admin', 'services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('category')
      if (error) throw error
      return (data ?? []) as Service[]
    },
    staleTime: 1000 * 60,
  })
}

function useToggleService() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('services')
        .update({ is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
  })
}

export function AdminServicesPage() {
  const { data: services = [], isLoading } = useAllServices()
  const { mutate: toggleService, isPending: isToggling } = useToggleService()
  const [filterActive, setFilterActive] = useState<boolean | 'all'>('all')

  const filtered = filterActive === 'all'
    ? services
    : services.filter((s) => s.is_active === filterActive)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button size="sm" disabled>
          <Plus size={14} className="mr-1.5" /> Add Service
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', true, false] as const).map((v) => (
          <button
            key={String(v)}
            onClick={() => setFilterActive(v)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterActive === v ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {v === 'all' ? 'All' : v ? 'Active' : 'Inactive'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Service</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Category</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Price</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Rating</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={s.thumbnail_url} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                      <span className="font-medium">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{s.category}</td>
                  <td className="px-5 py-3 font-semibold text-primary">{formatPrice(s.base_price)}</td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {s.avg_rating ? `⭐ ${s.avg_rating}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      disabled={isToggling}
                      onClick={() => toggleService({ id: s.id, is_active: !s.is_active })}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        s.is_active ? 'text-success' : 'text-muted-foreground'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : s.is_active ? (
                        <ToggleRight size={18} />
                      ) : (
                        <ToggleLeft size={18} />
                      )}
                      {s.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
