import { motion } from 'framer-motion'
import { Users, Briefcase, Star, MapPin } from 'lucide-react'

const stats = [
  { icon: Users, value: '10,000+', label: 'Verified Professionals' },
  { icon: Briefcase, value: '50,000+', label: 'Bookings Completed' },
  { icon: Star, value: '4.8 / 5', label: 'Average Rating' },
  { icon: MapPin, value: '25+', label: 'Cities Covered' },
]

export function StatsBar() {
  return (
    <section className="bg-primary py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ icon: Icon, value, label }, index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-1">
                <Icon size={22} className="text-white" />
              </div>
              <p className="text-2xl lg:text-3xl font-extrabold text-white">{value}</p>
              <p className="text-sm text-white/70">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
