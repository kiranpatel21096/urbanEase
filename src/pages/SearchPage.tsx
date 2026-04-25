import { useSearchParams } from 'react-router-dom'
import { mockServices } from '@/data/mockData'
import { ServiceCard } from '@/components/services/ServiceCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchBar } from '@/components/shared/SearchBar'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''

  const results = mockServices.filter((s) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="bg-white border-b border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar placeholder="Search services, categories..." className="max-w-lg" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-muted-foreground mb-4">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          {location && ` in ${location}`}
        </p>
        {results.length === 0 ? (
          <EmptyState
            title="No results found"
            description={`We couldn't find anything matching "${query}". Try different keywords.`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {results.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
