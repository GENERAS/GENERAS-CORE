import { Link } from 'react-router-dom'
import { FaGithub, FaTwitter, FaLinkedin, FaYoutube, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa'

export default function Footer() {
  const socialLinks = [
    { icon: FaGithub, href: 'https://github.com/generas', label: 'GitHub' },
    { icon: FaTwitter, href: 'https://twitter.com/generas', label: 'Twitter' },
    { icon: FaLinkedin, href: 'https://linkedin.com/in/generas', label: 'LinkedIn' },
    { icon: FaYoutube, href: 'https://youtube.com/@generas', label: 'YouTube' },
  ]

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="inline-flex items-center justify-center bg-white rounded-xl p-2 mb-4 shadow-sm">
              <img src="/logo.png" alt="GENERAS CORE Logo" className="h-8 w-auto block" />
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
              <li><Link to="/service" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Mentorship</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Blog</Link></li>
              <li><Link to="/testimonials" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-sm">Testimonials</Link></li>
            </ul>
          </div>

          {/* Contact + Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-5 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaEnvelope className="text-yellow-500 flex-shrink-0" />
                <span>generaskagiraneza@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <FaMapMarkerAlt className="text-yellow-500 flex-shrink-0" />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
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