import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 px-4 py-2">
      <div className="w-8 h-8 rounded-full bg-yellow-600/20 flex items-center justify-center flex-shrink-0">
        <Bot size={14} className="text-yellow-600" />
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
