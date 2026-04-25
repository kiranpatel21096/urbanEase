import { motion } from 'framer-motion'
import { Search, CalendarCheck, Home } from 'lucide-react'

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Search & Browse',
    description: 'Explore 200+ services and compare verified professionals near you with upfront pricing.',
    color: 'bg-primary/10 text-primary',
  },
  {
    step: '02',
    icon: CalendarCheck,
    title: 'Book Instantly',
    description: 'Pick your preferred date, time, and address. Confirm in under 2 minutes.',
    color: 'bg-accent/10 text-accent',
  },
  {
    step: '03',
    icon: Home,
    title: 'Relax at Home',
    description: 'Your verified professional arrives on time. Pay after the job is done to your satisfaction.',
    color: 'bg-success/10 text-success',
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-muted/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            How It Works
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Book a Service in 3 Easy Steps
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Getting expert help has never been easier. No calls, no haggling — just seamless booking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {steps.map(({ step, icon: Icon, title, description, color }, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-6">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon size={32} />
                </div>
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-foreground text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
