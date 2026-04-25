import { Search, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  className?: string
  size?: 'sm' | 'lg'
  placeholder?: string
}

export function SearchBar({ className, size = 'sm', placeholder = 'Search for services...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`)
    }
  }

  if (size === 'lg') {
    return (
      <form
        onSubmit={handleSearch}
        className={cn(
          'flex items-center gap-0 rounded-2xl bg-white shadow-xl border border-border overflow-hidden',
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 px-4 py-3">
          <Search size={20} className="text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex items-center gap-2 px-4 py-3">
          <MapPin size={20} className="text-primary flex-shrink-0" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Your city..."
            className="w-28 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <button
          type="submit"
          className="bg-primary text-white px-6 py-3.5 font-medium text-sm hover:bg-primary-hover transition-colors"
        >
          Search
        </button>
      </form>
    )
  }

  return (
    <form
      onSubmit={handleSearch}
      className={cn('flex items-center gap-2 rounded-xl bg-white border border-border px-3', className)}
    >
      <Search size={16} className="text-muted-foreground" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-1 py-2.5 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
      />
    </form>
  )
}
