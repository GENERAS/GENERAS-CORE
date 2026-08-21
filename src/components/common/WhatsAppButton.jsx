import { useState, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

const quickMessages = [
  "I need help with a project",
  "I want to hire you",
  "Tell me about mentorship",
  "I have a question",
]

export default function WhatsAppButton({
  phoneNumber = '250794144738',
  message = "Hello! I visited your website and would like to connect.",
  position = 'floating',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setHasUnread(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const openWhatsApp = (text) => {
    const msg = text || message
    const encodedMessage = encodeURIComponent(msg)
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank')
    setHasUnread(false)
    setIsOpen(false)
  }

  if (position === 'inline') {
    return (
      <button
        onClick={() => openWhatsApp()}
        className={`px-4 py-2 bg-[#25D366] text-white text-lg font-medium hover:bg-[#128C7E] rounded-lg transition-colors duration-200 flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </button>
    )
  }

  return (
    <div className={`fixed bottom-20 md:bottom-6 right-6 z-50 ${className}`}>
      {/* Popup panel */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Generas Kagiraneza</p>
                  <p className="text-xs text-green-200">Usually replies instantly</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat body */}
          <div className="p-4 bg-[#ECE5DD]">
            <div className="bg-white rounded-xl p-3 shadow-sm text-sm text-gray-800">
              Hi there! How can I help you? Choose a quick option or type your own message.
            </div>
          </div>

          {/* Quick messages */}
          <div className="p-3 space-y-2 bg-white">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => openWhatsApp(msg)}
                className="w-full text-left px-3 py-2 bg-[#DCF8C6] hover:bg-[#c5e8a8] rounded-lg text-sm text-gray-800 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    openWhatsApp(e.target.value.trim())
                  }
                }}
              />
              <button
                onClick={() => openWhatsApp()}
                className="w-10 h-10 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#128C7E] transition-colors"
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
          <MessageCircle className="w-7 h-7" />
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
