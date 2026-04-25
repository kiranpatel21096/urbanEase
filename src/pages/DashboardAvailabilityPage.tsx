import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useMyProvider } from '@/hooks/useProviders'
import { useProviderAvailability, useUpsertAvailability } from '@/hooks/useAvailability'

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function DashboardAvailabilityPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { data: myProvider, isLoading: providerLoading } = useMyProvider()
  const { data: availability = [], isLoading: availLoading } = useProviderAvailability(myProvider?.id)
  const { mutate: upsert, isPending } = useUpsertAvailability()

  if (!user || user.role !== 'provider') {
    navigate('/dashboard/bookings')
    return null
  }

  const isLoading = providerLoading || availLoading

  function isAvailable(dayOfWeek: number, timeSlot: string): boolean {
    const row = availability.find(
      (a) => a.day_of_week === dayOfWeek && a.time_slot === timeSlot
    )
    // Default to available if no row exists
    return row ? row.is_available : true
  }

  function toggle(dayOfWeek: number, timeSlot: string) {
    if (!myProvider) return
    const current = isAvailable(dayOfWeek, timeSlot)
    upsert({ provider_id: myProvider.id, day_of_week: dayOfWeek, time_slot: timeSlot, is_available: !current })
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">My Availability</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Toggle slots to mark yourself available or unavailable. Customers can only book when you're available.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !myProvider ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No provider profile found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-border overflow-hidden">
            {/* Legend */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span className="text-xs text-muted-foreground">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted border border-border" />
                <span className="text-xs text-muted-foreground">Unavailable</span>
              </div>
              {isPending && (
                <Loader2 size={14} className="animate-spin text-primary ml-auto" />
              )}
            </div>

            {/* Grid */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3 w-28">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="text-center text-xs font-medium text-muted-foreground px-2 py-3">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((slot) => (
                    <tr key={slot} className="border-t border-border">
                      <td className="px-6 py-2 text-sm text-muted-foreground whitespace-nowrap">{slot}</td>
                      {DAYS.map((_, dayIdx) => {
                        const avail = isAvailable(dayIdx, slot)
                        return (
                          <td key={dayIdx} className="text-center px-2 py-2">
                            <button
                              onClick={() => toggle(dayIdx, slot)}
                              className={`w-full h-8 rounded-lg text-xs font-medium transition-all ${
                                avail
                                  ? 'bg-primary/90 text-white hover:bg-primary'
                                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
                              }`}
                            >
                              {avail ? '✓' : '✗'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
