import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Calendar, Lightbulb, ExternalLink } from 'lucide-react'
import { sendMessage, submitBooking, generateSessionId } from '../../services/aiService'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `### Welcome

I'm **GENERAS AI STRATEGIST** — your business systems architect.

I help identify software opportunities, startup ideas, and automation solutions for your business or idea.

**Quick actions below** 👇

Or just tell me what you're working on!`,
}

const QUICK_ACTIONS = [
  { label: 'Book Consultation', icon: Calendar, action: 'I want to book a consultation to discuss a project' },
  { label: 'Startup Ideas', icon: Lightbulb, action: 'I have some skills and capital, give me startup ideas' },
]

function TypingIndicator() {
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

function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'
  if (isSystem) return null

  return (
    <div className={`flex items-start gap-2 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-yellow-600' : 'bg-yellow-600/20'}`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-yellow-600" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser ? 'bg-yellow-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
        <div className="prose prose-sm max-w-none prose-headings:text-inherit prose-strong:text-inherit">
          <MarkdownRenderer content={message.content} />
        </div>
      </div>
    </div>
  )
}

function MarkdownRenderer({ content }) {
  const lines = content.split('\n')
  const elements = []
  let inList = false
  let listItems = []

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
      listItems.push(<span key={`item-${i}`}>{trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>)
    } else if (/^\d+\.\s/.test(trimmed)) {
      inList = true
      listItems.push(<span key={`item-${i}`}>{trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</span>)
    } else if (trimmed === '') {
      if (inList) { elements.push(<li key={`list-${i}`}>{listItems}</li>); listItems = []; inList = false }
    } else {
      if (inList) { elements.push(<li key={`list-${i}`}>{listItems}</li>); listItems = []; inList = false }
      const rendered = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-yellow-600 hover:text-yellow-700">$1</a>')
      elements.push(<p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: rendered }} />)
    }
  })
  if (inList) elements.push(<li key="list-end">{listItems}</li>)
  return <>{elements}</>
}

function BookingForm({ onCancel }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', projectType: '', budget: '', deadline: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setSubmitting(true)
    try {
      const res = await submitBooking(form)
      setResult(res)
    } catch (err) {
      setResult({ message: 'Something went wrong. Please try again or contact us directly on WhatsApp.' })
    } finally { setSubmitting(false) }
  }

  if (result) {
    return (
      <div className="px-4 py-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">{result.message}</p>
          {result.whatsappLink && <a href={result.whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 underline mt-2"><ExternalLink size={14} /> Chat on WhatsApp for faster response</a>}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5">
      <p className="text-sm font-semibold text-gray-700">Tell us about your project</p>
      <div className="grid grid-cols-2 gap-2">
        <input required placeholder="Name *" className="col-span-2 sm:col-span-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <input required type="email" placeholder="Email *" className="col-span-2 sm:col-span-1 text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Phone" className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
        <input placeholder="Country" className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
      </div>
      <input placeholder="Project Type (e.g., Website, Mobile App, AI System)" className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.projectType} onChange={e => setForm(p => ({ ...p, projectType: e.target.value }))} />
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Budget Range" className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
        <input placeholder="Deadline" className="text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
      </div>
      <textarea placeholder="Describe your project in detail..." rows={3} className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      <div className="flex gap-2">
        <button type="submit" disabled={submitting} className="flex-1 bg-yellow-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50">{submitting ? 'Sending...' : 'Submit Request'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors">Cancel</button>
      </div>
    </form>
  )
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_messages')
      return saved ? JSON.parse(saved) : [WELCOME_MESSAGE]
    } catch { return [WELCOME_MESSAGE] }
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => generateSessionId())
  const [showForm, setShowForm] = useState(false)
  const [leadScore, setLeadScore] = useState(null)
  const [unread, setUnread] = useState(1)
  const [conversationState, setConversationState] = useState('new_user')
  const [messageCount, setMessageCount] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    try { localStorage.setItem('ai_messages', JSON.stringify(messages)) } catch {}
  }, [messages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setUnread(0)
    }
  }, [isOpen])

  const handleSend = useCallback(async (text) => {
    const userMessage = text || input
    if (!userMessage.trim() || isLoading) return

    setInput('')
    setShowForm(false)

    const userMsg = { role: 'user', content: userMessage.trim() }
    setMessages(prev => [...prev, userMsg])
    setMessageCount(prev => prev + 1)
    setIsLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const data = await sendMessage({ message: userMessage.trim(), history, sessionId, conversationState, messageCount })

      const assistantMsg = { role: 'assistant', content: data.response }
      setMessages(prev => [...prev, assistantMsg])

      if (data.conversationState) setConversationState(data.conversationState)
      if (data.leadScore) setLeadScore(data.leadScore)
      if (data.collectContact) setShowForm(true)
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Here are my available projects — you can also [book a consultation](https://wa.me/250794144738) to discuss your idea in detail.`,
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, sessionId, conversationState, messageCount])

  const handleQuickAction = (action) => handleSend(action)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-gray-800 rotate-90 scale-110' : 'bg-yellow-600 hover:bg-yellow-700 hover:scale-110'}`}
        aria-label={isOpen ? 'Close chat' : 'Open AI Strategist'}
      >
        {isOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">{unread}</span>
        )}
      </button>

      <div className={`fixed bottom-24 left-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-left ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
        <div className="bg-yellow-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><Bot size={18} /></div>
            <div>
              <h3 className="text-sm font-semibold">Generas AI Strategist</h3>
              <p className="text-[11px] text-yellow-200">Systems Architect & Advisor</p>
            </div>
          </div>
          {leadScore && (
            <div className={`text-[10px] font-bold px-2 py-1 rounded-full ${leadScore.budget >= 7 ? 'bg-green-500/30 text-green-200' : leadScore.budget >= 4 ? 'bg-yellow-500/30 text-yellow-200' : 'bg-gray-500/30 text-gray-200'}`}>
              Score: {leadScore.budget}/10
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1 bg-gray-50/50">
          {messages.slice(-50).map((msg, i) => (<ChatMessage key={i} message={msg} />))}
          {isLoading && <TypingIndicator />}
          {showForm && !isLoading && <BookingForm onCancel={() => setShowForm(false)} />}
          <div ref={messagesEndRef} />
        </div>

        {conversationState === 'new_user' && messages.length <= 1 && !isLoading && (
          <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100">
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => handleQuickAction(action.action)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-yellow-200 text-yellow-700 hover:bg-yellow-50 transition-colors">
                <action.icon size={12} /> {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 px-3 py-3 flex items-center gap-2 bg-white">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe your idea or ask a question..." className="flex-1 text-sm px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-gray-50" disabled={isLoading} />
          <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="w-9 h-9 rounded-full bg-yellow-600 flex items-center justify-center hover:bg-yellow-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0">
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </>
  )
}
