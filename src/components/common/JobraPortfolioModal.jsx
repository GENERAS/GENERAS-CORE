import { useEffect } from 'react'

const JOBRA_PROFILE_URL = 'https://jobra.africa/portfolio/kagiraneza-generas'

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export default function JobraPortfolioModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio"
    >
      <div
        className="relative w-full h-full max-w-6xl bg-white rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 text-white shrink-0">
          <span className="text-sm font-semibold">Generas Kagiraneza — Portfolio</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition"
            aria-label="Close portfolio"
          >
            <CloseIcon />
          </button>
        </div>
        <iframe
          src={JOBRA_PROFILE_URL}
          title="Portfolio"
          className="flex-1 w-full border-0 bg-white"
          allowFullScreen
        />
      </div>
    </div>
  )
}