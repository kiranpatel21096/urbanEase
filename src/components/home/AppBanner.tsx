import { motion } from 'framer-motion'
import { Smartphone, Apple } from 'lucide-react'

export function AppBanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-indigo-600 to-indigo-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              Coming Soon
            </span>
            <h2 className="text-3xl font-bold text-white mb-3">
              Get the UrbanEase App
            </h2>
            <p className="text-white/70 max-w-sm mb-6">
              Book services, track your professional in real-time, and manage everything from your phone.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <button className="flex items-center gap-3 bg-white text-foreground px-5 py-3 rounded-xl font-medium hover:bg-white/90 transition-colors">
                <Apple size={20} />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-white/20 text-white border border-white/30 px-5 py-3 rounded-xl font-medium hover:bg-white/30 transition-colors">
                <Smartphone size={20} />
                <div className="text-left">
                  <p className="text-xs text-white/70">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
              <div className="text-center">
                <Smartphone size={64} className="text-white/60 mx-auto mb-3" />
                <p className="text-white/60 text-sm">App Preview</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
