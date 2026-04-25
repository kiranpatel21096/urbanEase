import { motion } from 'framer-motion'
import { ArrowRight, Shield, Star, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SearchBar } from '@/components/shared/SearchBar'
import { Button } from '@/components/ui/button'

const floatingCards = [
  { icon: Shield, label: 'Verified Pros', value: '10K+', color: 'text-primary bg-primary/10' },
  { icon: Star, label: 'Avg Rating', value: '4.8★', color: 'text-accent bg-accent/10' },
  { icon: Clock, label: 'On-Time Rate', value: '98%', color: 'text-success bg-success/10' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-amber-50 pt-16 pb-24 lg:pt-24 lg:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto text-center"
        >
          {/* Chip */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Trusted by 50,000+ happy customers
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6"
          >
            Expert Home Services,{' '}
            <span className="text-primary">Delivered</span> to Your Door
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto"
          >
            Book verified professionals for beauty, cleaning, repairs, and more. Fixed prices, guaranteed quality.
          </motion.p>

          {/* Search bar */}
          <motion.div variants={itemVariants} className="mb-10">
            <SearchBar size="lg" placeholder="What service are you looking for?" />
          </motion.div>

          {/* Popular searches */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {['Salon at Home', 'AC Repair', 'Home Cleaning', 'Electrician'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/search?q=${encodeURIComponent(tag)}`)}
                className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
              >
                {tag}
              </button>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/services')}>
              Explore Services <ArrowRight size={18} />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
              Become a Pro
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mt-16"
        >
          {floatingCards.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white rounded-2xl shadow-card px-5 py-4 border border-border"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-bold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
