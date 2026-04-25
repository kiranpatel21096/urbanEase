import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { serviceCategories } from '@/data/mockData'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35 } },
}

export function CategoryGrid() {
  const navigate = useNavigate()

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            What Can We Help You With?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            From beauty to plumbing — we have over 200 services available in your city.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {serviceCategories.map(({ name, icon, color, count }) => (
            <motion.button
              key={name}
              variants={itemVariants}
              onClick={() => navigate(`/services?category=${encodeURIComponent(name)}`)}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border hover:border-primary/30 hover:shadow-card-hover bg-white transition-all duration-300 text-center"
              whileHover={{ y: -4 }}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{count} services</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
