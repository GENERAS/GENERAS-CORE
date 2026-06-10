import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function ChatMarkdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let inList = false
  let listItems: JSX.Element[] = []

  lines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('### ')) {
      if (inList) { elements.push(<li key={`list-${i}`}>{listItems}</li>); listItems = []; inList = false }
      elements.push(<h3 key={i} className="text-base font-bold mt-3 mb-1 text-yellow-700">{trimmed.slice(4)}</h3>)
    } else if (trimmed.startsWith('## ')) {
      if (inList) { elements.push(<li key={`list-${i}`}>{listItems}</li>); listItems = []; inList = false }
      elements.push(<h2 key={i} className="text-lg font-bold mt-4 mb-1 text-yellow-800">{trimmed.slice(3)}</h2>)
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      if (inList) { elements.push(<li key={`list-${i}`}>{listItems}</li>); listItems = []; inList = false }
      elements.push(<p key={i} className="font-semibold mt-2">{trimmed.replace(/\*\*/g, '')}</p>)
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true
      listItems.push(<span key={`item-${i}`}>{trimmed.slice(2)}</span>)
    } else if (/^\d+\.\s/.test(trimmed)) {
      inList = true
      listItems.push(<span key={`item-${i}`}>{trimmed.replace(/^\d+\.\s*/, '')}</span>)
    } else if (trimmed === '') {
      if (inList) { elements.push(<li key={`list-${i}`}>{listItems}</li>); listItems = []; inList = false }
    } else {
      if (inList) { elements.push(<li key={`list-${i}`}>{listItems}</li>); listItems = []; inList = false }
      const rendered = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-yellow-600 hover:text-yellow-700">$1</a>')
      elements.push(<p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: rendered }} />)
    }
  })
  if (inList) elements.push(<li key="list-end">{listItems}</li>)
  return <>{elements}</>
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'
  if (role === 'system') return null

  return (
    <div className={`flex items-start gap-2 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-yellow-600' : 'bg-yellow-600/20'}`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-yellow-600" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'bg-yellow-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
        <ChatMarkdown content={content} />
      </div>
    </div>
  )
}
