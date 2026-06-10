import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageCircle, X, Bot, Send, CheckCircle } from 'lucide-react'
import ChatMessage from './ChatMessage'
import LeadForm from './LeadForm'
import type { LeadFormData } from './LeadForm'
import ProjectSummary from './ProjectSummary'
import TypingIndicator from './TypingIndicator'

type Step =
  | 'welcome'
  | 'user_type'
  | 'project_type'
  | 'discovery'
  | 'budget'
  | 'timeline'
  | 'contact'
  | 'summary'
  | 'submitted'

type UserType =
  | 'Business Owner'
  | 'Startup Founder'
  | 'School Representative'
  | 'NGO / Organization'
  | 'Individual'
  | 'Other'

type ProjectType =
  | 'Website'
  | 'Mobile App'
  | 'Business System'
  | 'School Management System'
  | 'AI Chatbot'
  | 'SaaS Platform'
  | 'E-commerce Store'
  | 'Business Automation'
  | 'Other'

interface DiscoveryQ {
  question: string
  key: string
  type: 'text' | 'textarea' | 'yesno'
}

const DISCOVERY_QUESTIONS: Record<string, DiscoveryQ[]> = {
  'School Management System': [
    { question: 'What is the name of your school?', key: 'schoolName', type: 'text' },
    { question: 'How many students do you have?', key: 'studentCount', type: 'text' },
    { question: 'What are your current challenges?', key: 'challenges', type: 'textarea' },
    { question: 'Do you need fee tracking?', key: 'feeTracking', type: 'yesno' },
    { question: 'Do you need attendance tracking?', key: 'attendance', type: 'yesno' },
    { question: 'Do you need parent communication portal?', key: 'parentPortal', type: 'yesno' },
    { question: 'Do you need mobile money integration?', key: 'mobileMoney', type: 'yesno' },
  ],
  'Website': [
    { question: 'What is your business name?', key: 'businessName', type: 'text' },
    { question: 'What industry are you in?', key: 'industry', type: 'text' },
    { question: 'Who is your target audience?', key: 'targetAudience', type: 'textarea' },
    { question: 'What pages do you need? (Home, About, Services, etc.)', key: 'pages', type: 'text' },
    { question: 'Do you need payment integration?', key: 'paymentIntegration', type: 'yesno' },
  ],
  'Mobile App': [
    { question: 'What is the purpose of the app?', key: 'purpose', type: 'textarea' },
    { question: 'Who is your target audience?', key: 'targetAudience', type: 'textarea' },
    { question: 'Do you need iOS, Android, or both?', key: 'platform', type: 'text' },
    { question: 'Do you need backend integration?', key: 'backend', type: 'yesno' },
  ],
  'Business System': [
    { question: 'What business processes do you want to digitize?', key: 'processes', type: 'textarea' },
    { question: 'How many users will use the system?', key: 'users', type: 'text' },
    { question: 'Do you need reporting and analytics?', key: 'analytics', type: 'yesno' },
    { question: 'Do you need integration with existing tools?', key: 'integration', type: 'text' },
  ],
  'AI Chatbot': [
    { question: 'What type of business do you have?', key: 'businessType', type: 'text' },
    { question: 'What do you want to automate?', key: 'automation', type: 'textarea' },
    { question: 'What is your customer support volume? (messages per day)', key: 'volume', type: 'text' },
    { question: 'What communication channels do you need? (Website, WhatsApp, etc.)', key: 'channels', type: 'text' },
  ],
  'SaaS Platform': [
    { question: 'What is the core value proposition?', key: 'valueProp', type: 'textarea' },
    { question: 'Who is your target customer?', key: 'targetCustomer', type: 'textarea' },
    { question: 'What pricing model do you plan?', key: 'pricing', type: 'text' },
    { question: 'What features are essential for MVP?', key: 'mvpFeatures', type: 'textarea' },
  ],
  'E-commerce Store': [
    { question: 'What products do you sell?', key: 'products', type: 'textarea' },
    { question: 'How many products will you list?', key: 'productCount', type: 'text' },
    { question: 'Do you need payment gateway integration?', key: 'payment', type: 'yesno' },
    { question: 'Do you need inventory management?', key: 'inventory', type: 'yesno' },
  ],
  'Business Automation': [
    { question: 'What processes are currently manual?', key: 'manualProcesses', type: 'textarea' },
    { question: 'What is the volume of transactions/operations?', key: 'volume', type: 'text' },
    { question: 'What tools are you currently using?', key: 'currentTools', type: 'text' },
    { question: 'What is your expected timeline for automation?', key: 'timeline', type: 'text' },
  ],
  'Other': [
    { question: 'Please describe your project in detail', key: 'description', type: 'textarea' },
    { question: 'What problem are you trying to solve?', key: 'problem', type: 'textarea' },
    { question: 'Who will use the solution?', key: 'users', type: 'textarea' },
  ],
}

const USER_TYPES: UserType[] = [
  'Business Owner', 'Startup Founder', 'School Representative',
  'NGO / Organization', 'Individual', 'Other',
]

const PROJECT_TYPES: ProjectType[] = [
  'Website', 'Mobile App', 'Business System', 'School Management System',
  'AI Chatbot', 'SaaS Platform', 'E-commerce Store', 'Business Automation', 'Other',
]

const BUDGETS = ['Under $200', '$200 - $500', '$500 - $1000', '$1000+']

const TIMELINES = ['ASAP', 'Within 1 Month', 'Within 3 Months', 'Flexible']

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface CollectedData {
  userType: string
  projectType: string
  discovery: Record<string, string>
  budget: string
  timeline: string
  name: string
  email: string
  phone: string
  whatsapp: string
  company: string
  location: string
}

function generateId(): string {
  const stored = localStorage.getItem('ai_assistant_session')
  if (stored) return stored
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  localStorage.setItem('ai_assistant_session', id)
  return id
}

function buildProjectBrief(data: CollectedData): string {
  const lines = [
    'PROJECT SUMMARY',
    '',
    `Client: ${data.name}`,
    data.company ? `Company: ${data.company}` : '',
    '',
    `Project: ${data.projectType}`,
    `Client Type: ${data.userType}`,
    '',
    'Requirements:',
  ]

  const disc = Object.entries(data.discovery).filter(([, v]) => v.trim())
  for (const [key, val] of disc) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
    lines.push(`- ${label}: ${val}`)
  }

  lines.push('', `Budget: ${data.budget}`, `Timeline: ${data.timeline}`)
  lines.push('', 'Contact:', `- Email: ${data.email}`, `- Phone: ${data.phone}`)
  if (data.whatsapp) lines.push(`- WhatsApp: ${data.whatsapp}`)
  if (data.location) lines.push(`- Location: ${data.location}`)

  return lines.filter(l => l).join('\n')
}

interface StorageState {
  step: Step
  messages: Message[]
  data: CollectedData
  answeredQuestions: string[]
}

function loadState(): StorageState | null {
  try {
    const raw = localStorage.getItem('ai_assistant_state')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(state: StorageState) {
  try { localStorage.setItem('ai_assistant_state', JSON.stringify(state)) } catch {}
}

export default function ChatWindow() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('welcome')
  const [messages, setMessages] = useState<Message[]>([])
  const [data, setData] = useState<CollectedData>({
    userType: '', projectType: '', discovery: {}, budget: '', timeline: '',
    name: '', email: '', phone: '', whatsapp: '', company: '', location: '',
  })
  const [discoveryAnswers, setDiscoveryAnswers] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [unread, setUnread] = useState(1)
  const sessionId = useRef(generateId())
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentData = { ...data, discovery: { ...data.discovery, ...discoveryAnswers } }

  // Restore state from localStorage
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setStep(saved.step)
      setMessages(saved.messages)
      setData(saved.data)
      if (saved.step === 'discovery') {
        setDiscoveryAnswers(saved.data.discovery)
      }
      if (saved.step === 'submitted') setSubmitted(true)
    } else {
      setMessages([
        {
          role: 'assistant',
          content:
            `### Welcome to **GENERAS CORE**\n\n` +
            `I help businesses, schools, startups, and organizations identify software, AI, automation, and digital solutions.\n\n` +
            `Let's start by understanding your needs.`,
        },
      ])
    }
  }, [])

  // Persist state
  useEffect(() => {
    saveState({ step, messages, data: currentData, answeredQuestions: Object.keys(discoveryAnswers) })
  }, [step, messages, data, discoveryAnswers])

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, step])

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setUnread(0)
    }
  }, [isOpen])

  const addUserMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: 'user', content }])
  }, [])

  const addBotMessage = useCallback((content: string) => {
    setMessages(prev => [...prev, { role: 'assistant', content }])
  }, [])

  const goToStep = useCallback((next: Step) => {
    setStep(next)
  }, [])

  // Step transitions
  const handleUserType = useCallback((type: UserType) => {
    addUserMessage(type)
    setData(prev => ({ ...prev, userType: type }))
    setTimeout(() => {
      addBotMessage('What type of project are you looking for?')
      goToStep('project_type')
    }, 400)
  }, [addUserMessage, addBotMessage, goToStep])

  const handleProjectType = useCallback((type: ProjectType) => {
    addUserMessage(type)
    const qs = DISCOVERY_QUESTIONS[type] || DISCOVERY_QUESTIONS['Other']
    setData(prev => ({ ...prev, projectType: type }))
    setDiscoveryAnswers({})
    setTimeout(() => {
      if (type === 'School Management System') {
        addBotMessage(
          `Great choice! I specialize in school management systems.\n\nLet me ask a few questions to understand your requirements better.`
        )
      } else if (type === 'AI Chatbot') {
        addBotMessage(
          `Excellent! AI chatbots are transforming how businesses engage with customers.\n\nLet me gather some details to design the right solution.`
        )
      } else {
        addBotMessage(`Let me ask you a few questions to understand your requirements better.`)
      }
      goToStep('discovery')
    }, 500)
  }, [addUserMessage, addBotMessage, goToStep])

  const handleDiscoverySubmit = useCallback(() => {
    const qs = DISCOVERY_QUESTIONS[data.projectType] || DISCOVERY_QUESTIONS['Other']
    const allFilled = qs.every(q => discoveryAnswers[q.key]?.trim())

    if (!allFilled) {
      addBotMessage('Please answer all the questions above so I can create an accurate project brief.')
      return
    }

    setIsLoading(true)
    setData(prev => ({ ...prev, discovery: discoveryAnswers }))

    addUserMessage('I have answered all questions')

    setTimeout(() => {
      setIsLoading(false)
      addBotMessage('Thank you! Now, what is your budget range for this project?')
      goToStep('budget')
    }, 800)
  }, [data.projectType, discoveryAnswers, addUserMessage, addBotMessage, goToStep])

  const handleBudget = useCallback((budget: string) => {
    addUserMessage(budget)
    setData(prev => ({ ...prev, budget }))
    setTimeout(() => {
      addBotMessage('What is your preferred timeline for this project?')
      goToStep('timeline')
    }, 400)
  }, [addUserMessage, addBotMessage, goToStep])

  const handleTimeline = useCallback((timeline: string) => {
    addUserMessage(timeline)
    setData(prev => ({ ...prev, timeline }))
    setTimeout(() => {
      addBotMessage(
        `Excellent! I have all the information I need.\n\n` +
        `Please provide your contact details so I can prepare your project brief.`
      )
      goToStep('contact')
    }, 400)
  }, [addUserMessage, addBotMessage, goToStep])

  const handleContactSubmit = useCallback((formData: LeadFormData) => {
    addUserMessage(`Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}`)
    setData(prev => ({ ...prev, ...formData }))
    setTimeout(() => {
      addBotMessage('Here is your project summary. Please review and confirm.')
      goToStep('summary')
    }, 400)
  }, [addUserMessage, addBotMessage, goToStep])

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true)
    const fullData = { ...currentData }
    const brief = buildProjectBrief(fullData)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fullData,
          sessionId: sessionId.current,
          chatTranscript: messages.map(m => ({ role: m.role, content: m.content })),
          projectBrief: brief,
        }),
      })
      const result = await res.json()
      setSubmitted(true)

      addUserMessage('I confirm and submit my project requirements')
      addBotMessage(
        `### Thank You, ${fullData.name}! 🎉\n\n` +
        `Your project brief has been submitted successfully.\n\n` +
        `**What happens next:**\n` +
        `1. I will review your requirements within 24 hours\n` +
        `2. You will receive a personalized proposal via email\n` +
        `3. We can schedule a call to discuss next steps\n\n` +
        `For immediate response, reach out on WhatsApp.`
      )
      goToStep('submitted')
    } catch {
      addBotMessage('Something went wrong. Please try again or contact us directly on WhatsApp.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentData, messages, addUserMessage, addBotMessage, goToStep])

  const handleEdit = useCallback(() => {
    setMessages(prev => prev.slice(0, -1))
    addBotMessage('Please provide your contact details so I can prepare your project brief.')
    goToStep('contact')
  }, [addBotMessage, goToStep])

  const handleReset = useCallback(() => {
    localStorage.removeItem('ai_assistant_state')
    localStorage.removeItem('ai_assistant_session')
    setStep('welcome')
    setMessages([
      {
        role: 'assistant',
        content:
          `### Welcome to **GENERAS CORE**\n\n` +
          `I help businesses, schools, startups, and organizations identify software, AI, automation, and digital solutions.\n\n` +
          `Let's start by understanding your needs.`,
      },
    ])
    setData({ userType: '', projectType: '', discovery: {}, budget: '', timeline: '', name: '', email: '', phone: '', whatsapp: '', company: '', location: '' })
    setDiscoveryAnswers({})
    setSubmitted(false)
  }, [])

  const discoveryQ = DISCOVERY_QUESTIONS[data.projectType] || DISCOVERY_QUESTIONS['Other']

  const renderInteraction = () => {
    if (step === 'welcome') {
      return (
        <div className="px-4 py-3">
          <button onClick={() => goToStep('user_type')} className="w-full bg-yellow-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
            <CheckCircle size={15} /> Start Consultation
          </button>
        </div>
      )
    }

    if (step === 'user_type') {
      return (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {USER_TYPES.map(type => (
            <button key={type} onClick={() => handleUserType(type)}
              className="text-xs font-medium px-3.5 py-2 rounded-full border border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-colors">
              {type}
            </button>
          ))}
        </div>
      )
    }

    if (step === 'project_type') {
      return (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {PROJECT_TYPES.map(type => (
            <button key={type} onClick={() => handleProjectType(type)}
              className="text-xs font-medium px-3.5 py-2 rounded-full border border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-colors">
              {type}
            </button>
          ))}
        </div>
      )
    }

    if (step === 'discovery') {
      return (
        <div className="px-4 py-3 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Project Requirements</p>
          {discoveryQ.map(q => (
            <div key={q.key}>
              <label className="text-xs text-gray-600 mb-1 block">{q.question}</label>
              {q.type === 'textarea' ? (
                <textarea
                  rows={2}
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none bg-white"
                  value={discoveryAnswers[q.key] || ''}
                  onChange={e => setDiscoveryAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                  placeholder="Type your answer..."
                />
              ) : q.type === 'yesno' ? (
                <div className="flex gap-2">
                  {['Yes', 'No'].map(opt => (
                    <button key={opt} type="button" onClick={() => setDiscoveryAnswers(prev => ({ ...prev, [q.key]: opt }))}
                      className={`text-xs font-medium px-4 py-1.5 rounded-full border transition-colors ${
                        discoveryAnswers[q.key] === opt
                          ? 'bg-yellow-600 text-white border-yellow-600'
                          : 'border-gray-300 text-gray-600 hover:border-yellow-400'
                      }`}>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
                  value={discoveryAnswers[q.key] || ''}
                  onChange={e => setDiscoveryAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                  placeholder="Type your answer..."
                />
              )}
            </div>
          ))}
          <button onClick={handleDiscoverySubmit} disabled={isLoading}
            className="w-full bg-yellow-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading ? 'Processing...' : 'Submit Requirements'} <Send size={14} />
          </button>
        </div>
      )
    }

    if (step === 'budget') {
      return (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {BUDGETS.map(b => (
            <button key={b} onClick={() => handleBudget(b)}
              className="text-xs font-medium px-4 py-2 rounded-full border border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-colors">
              {b}
            </button>
          ))}
        </div>
      )
    }

    if (step === 'timeline') {
      return (
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {TIMELINES.map(t => (
            <button key={t} onClick={() => handleTimeline(t)}
              className="text-xs font-medium px-4 py-2 rounded-full border border-yellow-200 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 transition-colors">
              {t}
            </button>
          ))}
        </div>
      )
    }

    if (step === 'contact') {
      return <LeadForm onSubmit={handleContactSubmit} />
    }

    if (step === 'summary') {
      const waMsg = encodeURIComponent(
        `🔔 *New Project Brief*%0a*Name:* ${currentData.name}%0a*Project:* ${currentData.projectType}%0a*Budget:* ${currentData.budget}%0a*Contact:* ${currentData.phone || currentData.email}`
      )
      return (
        <ProjectSummary
          data={currentData}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
          isSubmitting={isSubmitting}
          whatsappLink={`https://wa.me/250794144738?text=${waMsg}`}
        />
      )
    }

    if (step === 'submitted') {
      return (
        <div className="px-4 py-3">
          <button onClick={handleReset} className="w-full bg-gray-100 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-200 transition-colors">
            Start New Consultation
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-gray-800 rotate-90 scale-110' : 'bg-yellow-600 hover:bg-yellow-700 hover:scale-110'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open AI Business Consultant'}
      >
        {isOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
            {unread}
          </span>
        )}
      </button>

      <div className={`fixed bottom-24 left-1 sm:left-6 z-50 w-[92vw] sm:w-[400px] max-w-[calc(100vw-1.5rem)] sm:max-w-[400px] h-[75dvh] sm:h-[640px] max-h-[calc(100dvh-10rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-left ${
        isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-yellow-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold">GENERAS Business Consultant</h3>
              <p className="text-[11px] text-yellow-200">Project Discovery & Advisory</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {submitted && (
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/30 text-green-200">
                Submitted
              </span>
            )}
            <button onClick={handleReset} className="text-[11px] text-yellow-200 hover:text-white underline transition-colors" title="Start over">
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-1 bg-gray-50/50">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 bg-white flex-shrink-0 max-h-[320px] overflow-y-auto">
          {renderInteraction()}
        </div>
      </div>
    </>
  )
}
