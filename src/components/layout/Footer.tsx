import { Link } from 'react-router-dom'
import { Share2, Camera, Briefcase, Globe } from 'lucide-react'

const serviceLinks = [
  { label: 'Beauty & Salon',  to: '/services?category=Beauty+%26+Salon' },
  { label: 'Home Cleaning',   to: '/services?category=Home+Cleaning' },
  { label: 'Plumbing',        to: '/services?category=Plumbing' },
  { label: 'Electrical',      to: '/services?category=Electrical' },
  { label: 'AC Service',      to: '/services?category=AC+%26+Appliances' },
]

const legalLinks = [
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy',   to: '/privacy' },
]

const socials = [
  { Icon: Globe,    href: '#', label: 'Website'   },
  { Icon: Share2,   href: '#', label: 'Twitter'   },
  { Icon: Camera,   href: '#', label: 'Instagram' },
  { Icon: Briefcase, href: '#', label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-bold text-xl">
                Urban<span className="text-primary">Ease</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              Your trusted partner for doorstep home services. Book verified professionals in minutes.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-primary/80 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-2.5">
              {serviceLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {legalLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-white/60 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} UrbanEase. All rights reserved.
          </p>
          <p className="text-xs text-white/40">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  )
}
