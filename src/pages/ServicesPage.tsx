import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useServices } from '@/hooks/useServices'
import { ServiceCard } from '@/components/services/ServiceCard'
import { ServiceCardSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { serviceCategories } from '@/data/mockData'
import type { ServiceCategory } from '@/types'

const sortOptions = [
  { label: 'Popular',            value: 'popular'    },
  { label: 'Price: Low to High', value: 'price_asc'  },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Rating',             value: 'rating'     },
]

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [sort, setSort]   = useState('popular')

  const activeCategory = searchParams.get('category') as ServiceCategory | null

  const setCategory = (cat: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (cat) params.set('category', cat)
    else params.delete('category')
    setSearchParams(params)
  }

  const { data: services = [], isLoading } = useServices()

  const filtered = useMemo(() => {
    let list = [...services]
    if (activeCategory) list = list.filter((s) => s.category === activeCategory)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    }
    if (sort === 'price_asc')  list.sort((a, b) => a.base_price - b.base_price)
    if (sort === 'price_desc') list.sort((a, b) => b.base_price - a.base_price)
    if (sort === 'rating')     list.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    return list
  }, [services, activeCategory, query, sort])

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">All Services</h1>
          <p className="text-muted-foreground text-sm">Browse and book from 200+ services</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <button
            onClick={() => setCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            All
          </button>
          {serviceCategories.map(({ name }) => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === name ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:border-primary/40'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-border px-4">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
              className="flex-1 py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-xl border border-border px-3">
            <SlidersHorizontal size={16} className="text-muted-foreground" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="py-2.5 text-sm bg-transparent outline-none text-foreground cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {isLoading ? 'Loading…' : `${filtered.length} service${filtered.length !== 1 ? 's' : ''} found${activeCategory ? ` in ${activeCategory}` : ''}`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No services found"
            description="Try a different search term or category."
            actionLabel="Clear filters"
            onAction={() => { setQuery(''); setCategory(null) }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((service) => <ServiceCard key={service.id} service={service} />)}
          </div>
        )}
      </div>
    </div>
  )
}
