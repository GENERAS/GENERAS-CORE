import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'

function SimpleCTA() {
  return (
    <Link
      to="/hire-me"
      className="px-4 py-2 bg-white border border-gray-300 text-lg text-gray-700 hover:text-gray-900 hover:border-gray-400 rounded-lg transition-colors duration-200 font-medium"
    >
      Need help?
    </Link>
  )
}

function MobileBottomNav() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/projects', label: 'Projects' },
    { path: '/business', label: 'Services' },
    { path: '/community', label: 'Community' },
    { path: '/service', label: 'Mentor' },
  ]
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 px-2 gap-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full text-sm md:text-base transition-colors duration-200 ${
                isActive ? 'text-yellow-600 font-medium' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="leading-tight">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function Layout({ children }) {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full relative pt-20 md:pb-8 pb-20">
        {!isHomePage && (
          <div className="flex justify-end items-center gap-4 mb-8">
            <SimpleCTA />
            <Link
              to="/hire-me"
              className="btn-primary"
            >
              Hire Me
            </Link>
          </div>
        )}
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      <WhatsAppButton 
        phoneNumber="0794144738"
        message="Hello! I visited your website and would like to connect."
      />
    </div>
  )
}