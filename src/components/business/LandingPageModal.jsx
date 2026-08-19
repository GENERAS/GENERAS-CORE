import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function LandingPageModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSeen, setHasSeen] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenBusinessBanner')
    if (!seen) {
      setIsOpen(true)
    }
    setHasSeen(!!seen)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('hasSeenBusinessBanner', 'true')
    setHasSeen(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-40 p-4 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-2xl border border-yellow-400 relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-lg font-bold transition-colors"
            aria-label="Close"
          >
            ×
          </button>

          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                Need a Website for Your Business?
              </h3>
              <p className="text-yellow-50 text-sm md:text-base">
                Professional websites, SEO, WhatsApp integration, and digital transformation for Rwandan businesses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/business"
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-yellow-600 font-bold rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg text-sm"
              >
                View Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
