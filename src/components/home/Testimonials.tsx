import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { mockTestimonials } from '@/data/mockData'
import { StarRating } from '@/components/shared/StarRating'

export function Testimonials() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % mockTestimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + mockTestimonials.length) % mockTestimonials.length)
  const next = () => setCurrent((c) => (c + 1) % mockTestimonials.length)

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block bg-accent/10 text-accent text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Real experiences from real customers.
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              className="bg-muted/40 rounded-3xl p-8 md:p-10 text-center border border-border"
            >
              <img
                src={mockTestimonials[current].avatar_url}
                alt={mockTestimonials[current].name}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2 border-primary/20"
              />
              <StarRating rating={mockTestimonials[current].rating} size="md" className="justify-center mb-4" />
              <p className="text-foreground text-base leading-relaxed mb-6 italic">
                "{mockTestimonials[current].comment}"
              </p>
              <div>
                <p className="font-semibold text-foreground">{mockTestimonials[current].name}</p>
                <p className="text-sm text-muted-foreground">
                  {mockTestimonials[current].location} · {mockTestimonials[current].service}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {mockTestimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? 'bg-primary w-6' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
