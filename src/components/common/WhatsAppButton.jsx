import { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.77-1.65-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.59-.49-.51-.67-.52h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35ZM12.04 21.79h-.01a9.86 9.86 0 0 1-5.02-1.37l-.36-.21-3.73.98 1-3.64-.24-.37a9.82 9.82 0 0 1-1.51-5.25c0-5.44 4.43-9.87 9.88-9.87a9.82 9.82 0 0 1 6.99 2.9 9.81 9.81 0 0 1 2.9 6.99c0 5.44-4.44 9.87-9.9 9.87Zm8.42-18.27A11.8 11.8 0 0 0 12.04.35C5.54.35.22 5.66.22 12.16c0 2.08.54 4.11 1.58 5.9L.27 23.77l5.86-1.54a11.77 11.77 0 0 0 5.9 1.51c6.5 0 11.81-5.31 11.81-11.81 0-3.16-1.23-6.12-3.38-8.38Z" />
  </svg>
)

const getContext = (pathname) => {
  if (pathname === '/service' || pathname.startsWith('/services')) {
    return { label: 'Ask about mentorship', text: 'Hi! I’m interested in your mentorship program. Can you tell me more?' }
  }
  if (pathname === '/hire-me') {
    return { label: 'Request a project quote', text: "Hi! I'd like to request a quote for a project." }
  }
  if (pathname === '/trading') {
    return { label: 'Ask about trading', text: 'Hi! I have a question about your trading dashboard.' }
  }
  if (pathname === '/academic') {
    return { label: 'Ask about my academic journey', text: "Hi! I'd like to learn more about your academic journey." }
  }
  return { label: 'Get a free consultation', text: "Hi! I'd like a free consultation for my project." }
}

export default function WhatsAppButton({
  phoneNumber = '250794144738',
  message = 'Hello! I visited your website and would like to connect.',
  position = 'floating',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [typed, setTyped] = useState('')
  const inputRef = useRef(null)

  const context = getContext(typeof window !== 'undefined' ? window.location.pathname : '/')
  const quickReplies = [
    { label: context.label, text: context.text },
    { label: 'Ask about services & pricing', text: 'Hi! Could you share your services and pricing?' },
    { label: 'Book a call', text: 'Hi! I’d like to book a call to discuss my project.' },
    { label: 'Just saying hi', text: "Hi Generas! Just saying hi." },
  ]

  useEffect(() => {
    if (sessionStorage.getItem('wa_badge_shown')) return
    const timer = setTimeout(() => {
      setHasUnread(true)
      sessionStorage.setItem('wa_badge_shown', '1')
    }, 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 250)
  }, [isOpen])

  const captureLead = (text) => {
    const trimmed = (text || '').trim()
    if (!trimmed) return
    supabase
      .from('ai_leads')
      .insert({
        message: trimmed.slice(0, 500),
        source: 'whatsapp_widget',
        lead_label: 'new',
        notes: `Sent via WhatsApp widget from ${typeof window !== 'undefined' ? window.location.pathname : '/'}`,
      })
      .then(() => {})
      .catch(() => {})
  }

  const openWhatsApp = (text) => {
    const msg = text || message
    const encodedMessage = encodeURIComponent(msg)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
    captureLead(msg)
    setHasUnread(false)
    setIsOpen(false)
    setTyped('')
  }

  if (position === 'inline') {
    return (
      <button
        onClick={() => openWhatsApp(context.text)}
        className={`px-4 py-2 bg-[#25D366] text-white text-lg font-medium hover:bg-[#128C7E] rounded-lg transition-colors duration-200 flex items-center gap-2 ${className}`}
      >
        <WhatsAppIcon className="w-5 h-5" />
        WhatsApp
      </button>
    )
  }

  return (
    <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 ${className}`}>
      {/* Popup panel */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-96 max-w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden origin-bottom-right animate-in">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </div>
                <span className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#075E54] animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-sm">Generas Kagiraneza</p>
                <p className="text-xs text-green-200">Online · replies within minutes</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white" aria-label="Close WhatsApp chat">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat body */}
          <div className="p-4 bg-[#ECE5DD] space-y-2 max-h-56 overflow-y-auto">
            <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm text-sm text-gray-800">
              Hi there! 👋 I’m Generas — developer, trader &amp; entrepreneur. How can I help you today?
            </div>
            {context.label !== 'Get a free consultation' && (
              <div className="bg-[#DCF8C6] rounded-xl rounded-tr-sm p-3 shadow-sm text-sm text-gray-800 ml-auto w-fit">
                {context.label}
              </div>
            )}
            <div className="bg-white rounded-xl rounded-tl-sm p-3 shadow-sm text-sm text-gray-600 text-xs">
              Choose an option below or type your own message — it also lands directly in my inbox.
            </div>
          </div>

          {/* Quick replies */}
          <div className="p-3 space-y-2 bg-white">
            {quickReplies.map((q, i) => (
              <button
                key={i}
                onClick={() => openWhatsApp(q.text)}
                className="w-full text-left px-3 py-2 bg-[#DCF8C6] hover:bg-[#c5e8a8] rounded-lg text-sm text-gray-800 transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && typed.trim()) openWhatsApp(typed.trim())
                }}
              />
              <button
                onClick={() => typed.trim() && openWhatsApp(typed.trim())}
                disabled={!typed.trim()}
                className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors disabled:opacity-40"
                aria-label="Send WhatsApp message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-[#25D366] text-white flex items-center justify-center rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
          isOpen ? 'rotate-90' : ''
        }`}
        title="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <WhatsAppIcon className="w-7 h-7" />
        )}

        {/* Unread badge */}
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            1
          </span>
        )}
      </button>
    </div>
  )
}