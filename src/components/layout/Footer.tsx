import { Link } from 'react-router-dom'
import { Globe, Share2, Camera, Briefcase, Mail } from 'lucide-react'

const footerLinks = {
  Services: [
    { label: 'Beauty & Salon', to: '/services?category=Beauty' },
    { label: 'Home Cleaning', to: '/services?category=Cleaning' },
    { label: 'Repairs', to: '/services?category=Repairs' },
    { label: 'Electrical', to: '/services?category=Electrical' },
    { label: 'Plumbing', to: '/services?category=Plumbing' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Blog', to: '/blog' },
    { label: 'Press', to: '/press' },
  ],
  Support: [
    { label: 'Help Center', to: '/help' },
    { label: 'Safety', to: '/safety' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Privacy Policy', to: '/privacy' },
  ],
}

const socials = [
  { Icon: Globe, href: '#', label: 'Website' },
  { Icon: Share2, href: '#', label: 'Twitter' },
  { Icon: Camera, href: '#', label: 'Instagram' },
  { Icon: Briefcase, href: '#', label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
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
            {/* Newsletter */}
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1 bg-white/10 rounded-xl px-3">
                <Mail size={16} className="text-white/50" />
                <input
                  type="email"
                  placeholder="Your email..."
                  className="bg-transparent py-2.5 text-sm text-white placeholder:text-white/40 outline-none flex-1"
                />
              </div>
              <button className="bg-primary hover:bg-primary-hover transition-colors px-4 py-2.5 rounded-xl text-sm font-medium">
                Subscribe
              </button>
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-5">
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

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-semibold text-sm mb-4">{group}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} UrbanEase. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Made with ❤️ in India
          </p>
        </div>
      </div>
    </footer>
  )
}
