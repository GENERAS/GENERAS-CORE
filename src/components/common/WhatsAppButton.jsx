import { MessageCircle } from 'lucide-react'

export default function WhatsAppButton({ 
  phoneNumber = '',
  message = "Hi! I need help with something and I think you can solve it. Let's chat!",
  position = 'floating',
  className = ''
}) {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  if (position === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`px-4 py-2 bg-[#25D366] text-white text-lg font-medium hover:bg-[#128C7E] rounded-lg transition-colors duration-200 flex items-center gap-2 ${className}`}
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white flex items-center justify-center text-lg font-medium hover:bg-[#128C7E] rounded-full transition-colors duration-200 shadow-lg ${className}`}
      title="WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </button>
  )
}
