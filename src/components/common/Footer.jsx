import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone } from 'lucide-react'

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.12 0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
)

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82L5 21.75H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
  </svg>
)

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
  </svg>
)

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
  </svg>
)

export default function Footer() {
  const socialLinks = [
    { icon: GithubIcon, href: 'https://github.com/generas', label: 'GitHub' },
    { icon: TwitterIcon, href: 'https://twitter.com/generas', label: 'Twitter' },
    { icon: LinkedinIcon, href: 'https://linkedin.com/in/generas', label: 'LinkedIn' },
    // Channel ID rather than the @generas handle: handles can be changed by
    // the owner, while the channel ID is permanent and cannot be taken.
    { icon: YoutubeIcon, href: 'https://www.youtube.com/channel/UC97tXtqMG5JVF0vG4DXbv2g', label: 'YouTube' },
  ]

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="inline-flex items-center justify-center bg-white rounded-xl p-2 mb-4 shadow-sm">
              <img src="/logo.png" alt="GENERAS CORE Logo" loading="lazy" className="h-8 w-auto block" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">GENERAS CORE</h2>
            <p className="text-gray-400 leading-relaxed mb-4">
              Developer • Trader • Entrepreneur
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Building digital systems that solve real problems — from web applications and AI solutions to educational platforms.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-5 uppercase tracking-wider">Explore</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Home</Link></li>
              <li><Link to="/business" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Business Services</Link></li>
              <li><Link to="/academic" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Academic Journey</Link></li>
              <li><Link to="/projects" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Project Portfolio</Link></li>
              <li><Link to="/trading" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Trading Dashboard</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Community</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-5 uppercase tracking-wider">Services</h3>
            <ul className="space-y-3">
              <li><Link to="/hire-me" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Hire Me</Link></li>
              <li><Link to="/collaborate" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Start a Project</Link></li>
              <li><Link to="/service" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Mentorship</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Blog</Link></li>
              <li><Link to="/testimonials" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Testimonials</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-5 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href="mailto:generaskagiraneza@gmail.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm break-all"
                >
                  <Mail className="text-yellow-500 flex-shrink-0" size={16} />
                  <span>generaskagiraneza@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:0794144738"
                  className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm"
                >
                  <Phone className="text-yellow-500 flex-shrink-0" size={16} />
                  <span>0794144738</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:0781281207"
                  className="flex items-center gap-3 text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm"
                >
                  <Phone className="text-yellow-500 flex-shrink-0" size={16} />
                  <span>0781281207</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <MapPin className="text-yellow-500 flex-shrink-0" size={16} />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold transition-colors duration-200 mb-6"
            >
              Send a message
            </Link>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Follow</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 bg-gray-800 hover:bg-yellow-500 text-gray-400 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Kagiraneza Generas. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Tracking my journey from Nursery to Infinity
          </p>
        </div>
      </div>
    </footer>
  )
}