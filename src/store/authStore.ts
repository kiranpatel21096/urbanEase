import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isLoading: boolean        // true while session is being resolved on app boot
  isInitialized: boolean    // flips to true after the first getSession() call resolves
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setInitialized: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isInitialized: false,
      setUser: (user) => set({ user, isLoading: false, isInitialized: true }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: () => set({ isLoading: false, isInitialized: true }),
      logout: () => set({ user: null, isLoading: false, isInitialized: true }),
    }),
    {
      name: 'urbanease-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
