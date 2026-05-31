import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-1">
            <img src="/logo.png" alt="GENERAS CORE Logo" className="h-10 w-auto mb-3" style={{ background: 'transparent' }} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">GENERAS CORE</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Developer • Trader • Entrepreneur
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2">
              <li><Link to="/academic" className="text-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">Academic Journey</Link></li>
              <li><Link to="/projects" className="text-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">Project Portfolio</Link></li>
              <li><Link to="/trading" className="text-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">Trading Dashboard</Link></li>
              <li><Link to="/community" className="text-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">Community</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/hire-me" className="text-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">Hire Me</Link></li>
              <li><Link to="/service" className="text-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">Mentorship</Link></li>
              <li><Link to="/blog" className="text-lg text-gray-600 hover:text-gray-900 transition-colors duration-200">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li className="text-lg text-gray-600">generaskagiraneza@gmail.com</li>
              <li className="text-lg text-gray-600">Kigali, Rwanda</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-lg text-gray-600">
            © {new Date().getFullYear()} Kagiraneza Generas
          </p>
          <p className="text-base text-gray-500">
            Tracking my journey from Nursery to Infinity
          </p>
        </div>
      </div>
    </footer>
  )
}