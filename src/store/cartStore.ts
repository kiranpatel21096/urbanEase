import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Service, Provider } from '@/types'

interface BookingDraft {
  service: Service | null
  provider: Provider | null
  date: string | null
  timeSlot: string | null
  addressId: string | null
}

interface CartState {
  bookingDraft: BookingDraft
  setService: (service: Service) => void
  setProvider: (provider: Provider) => void
  setDate: (date: string) => void
  setTimeSlot: (slot: string) => void
  setAddress: (addressId: string) => void
  resetDraft: () => void
}

const initialDraft: BookingDraft = {
  service: null,
  provider: null,
  date: null,
  timeSlot: null,
  addressId: null,
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      bookingDraft: initialDraft,
      setService: (service) =>
        set((state) => ({ bookingDraft: { ...state.bookingDraft, service } })),
      setProvider: (provider) =>
        set((state) => ({ bookingDraft: { ...state.bookingDraft, provider } })),
      setDate: (date) =>
        set((state) => ({ bookingDraft: { ...state.bookingDraft, date } })),
      setTimeSlot: (timeSlot) =>
        set((state) => ({ bookingDraft: { ...state.bookingDraft, timeSlot } })),
      setAddress: (addressId) =>
        set((state) => ({ bookingDraft: { ...state.bookingDraft, addressId } })),
      resetDraft: () => set({ bookingDraft: initialDraft }),
    }),
    { name: 'urbanease-cart' }
  )
)
