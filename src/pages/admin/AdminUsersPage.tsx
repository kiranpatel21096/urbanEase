import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

type RoleFilter = 'customer' | 'provider'

function useAdminUsers(role: RoleFilter) {
  return useQuery<User[]>({
    queryKey: ['admin', 'users', role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as User[]
    },
    staleTime: 1000 * 60,
  })
}

export function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('customer')
  const { data: users = [], isLoading } = useAdminUsers(roleFilter)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <div className="flex gap-2 mb-6">
        {(['customer', 'provider'] as RoleFilter[]).map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
              roleFilter === r ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {r}s
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">No {roleFilter}s found.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Email</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3 font-medium">{u.full_name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-5 py-3 text-muted-foreground">{u.phone ?? '—'}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
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
