import express from 'express'
import cors from 'cors'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

// ─── Environment ──────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const SUPABASE_URL = process.env.VITE_AI_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_AI_SUPABASE_SERVICE_ROLE_KEY
const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY
const FROM_EMAIL = process.env.VITE_FROM_EMAIL || 'onboarding@resend.dev'
const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL || 'generaskagiraneza@gmail.com'
const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || '250794144738'
const ULTRAMSG_INSTANCE_ID = process.env.ULTRAMSG_INSTANCE_ID
const ULTRAMSG_TOKEN = process.env.ULTRAMSG_TOKEN

// ─── Clients ─────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ─── Knowledge Base ───────────────────────────────────────────
const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge')

let knowledgeCache = null

function loadKnowledgeBase() {
  if (knowledgeCache) return knowledgeCache
  const files = [
    'about-generas.md', 'services.md', 'projects.md', 'pricing.md',
    'faq.md', 'rwanda-market.md', 'opportunity-framework.md',
    'startup-frameworks.md', 'booking.md', 'contact.md',
    'cost-estimation.md', 'testimonials.md',
  ]
  let content = ''
  for (const file of files) {
    try {
      const fp = path.join(KNOWLEDGE_DIR, file)
      if (fs.existsSync(fp)) content += `\n\n=== ${file.replace('.md', '')} ===\n\n${fs.readFileSync(fp, 'utf-8')}`
    } catch (err) { console.error(`Failed to read ${file}:`, err.message) }
  }
  knowledgeCache = content
  return content
}

// ─── State Machine ────────────────────────────────────────────
const STATES = {
  NEW_USER: 'new_user',
  PROJECT_REQUEST: 'project_request',
  IDEA_INPUT: 'idea_input',
  CLARIFICATION: 'clarification',
  BOOKING_INTENT: 'booking_intent',
}

function detectState(message, currentState, messageCount) {
  const m = message.toLowerCase().trim()

  if (/(?:projects?|portfolio|what (?:have|'ve) (?:you )?built|tell me about your work|show me what|your work|built (?:so far|before|already)|what can you (?:build|do|make)|past projects|previous work)/i.test(m)) return STATES.PROJECT_REQUEST

  if (/(?:budget|cost|price|how much|hire|urgent|deadline|build (?:for|me)|contact (?:you|me))/i.test(m) || /(?:i (?:want|need|would like).*(?:build|create|develop|website|app|system))/i.test(m)) return STATES.BOOKING_INTENT

  if (/^(?:no|not|nope|nah|wait|actually|i mean|correction|that'?s not|different|that'?s (?:not|wrong))/i.test(m)) return STATES.CLARIFICATION

  if (/(?:idea|business|app|website|system|platform|tool|software|i (?:want to|need|'?m (?:thinking|working)|have (?:this|an?|a )) (?:idea|business|project|concept|plan))/i.test(m) || /(?:i have (?:a|an) (?:business|idea|problem|company|project))/i.test(m) || /(?:startup|saas|automate|solve|problem|opportunity)/i.test(m)) return STATES.IDEA_INPUT

  if (messageCount <= 1 && /^(?:hi|hello|hey|greetings|good\s+(?:morning|afternoon|evening)|yo|sup|howdy|what'?s up|hey there)/i.test(m)) return STATES.NEW_USER

  if (currentState === STATES.CLARIFICATION) return STATES.CLARIFICATION

  return currentState || STATES.NEW_USER
}

// ─── Direct Project Loader (no AI) ───────────────────────────
function handleProjectRequest() {
  const projectsPath = path.join(KNOWLEDGE_DIR, 'projects.md')
  try {
    if (fs.existsSync(projectsPath)) {
      const raw = fs.readFileSync(projectsPath, 'utf-8').trim()
      const clean = raw.split('\n').filter(l => !l.includes('[Add Your') && !l.includes('[List') && !l.includes('[Brief')).join('\n').trim()
      if (clean.length > 80) return `${clean}\n\n---\nWant to discuss a custom project? [Book a consultation](https://wa.me/${OWNER_WHATSAPP})`
    }
  } catch (_) {}
  return "### My Projects\n\nProjects are being updated. Check back soon.\n\n**Have an idea?** Tell me about it and I'll design a system for you."
}

// ─── Mode Detection ──────────────────────────────────────────
function detectMode(message) {
  const m = message.toLowerCase()
  if (/(?:book|consult|hire|cost|price|quote|how\s+much|i (?:want|need|would like).*(?:build|create|develop|website|app|system))/i.test(m)) return 'booking'
  if (/(?:startup|idea|saas|make\s+money|side\s+hustle|passive\s+income|entrepreneur|i have (?:money|skills|capital|budget)|what can i build)/i.test(m)) return 'startup_generator'
  if (/(?:problem|business|opportunity|system|automate|digitiz|solution|pain point|inefficient|manual|process|improve|optimize|i have (?:a|an) (?:business|idea|problem|company)|what (?:system|software|tool) (?:should|can)|analyze)/i.test(m)) return 'opportunity_scanner'
  if (/(?:validate|score|rate my|evaluate|assess|idea worth|should i build|is this a good)/i.test(m)) return 'idea_validation'
  return 'portfolio'
}

// ─── Helpers ─────────────────────────────────────────────────
function determineLeadLabel(scores) {
  if (scores.budget >= 6 && scores.intent >= 6 && scores.clarity >= 5) return 'hot'
  if (scores.intent >= 7) return 'hot'
  const avg = (scores.budget + scores.intent + scores.clarity + scores.businessValue) / 4
  if (avg >= 5) return 'warm'
  return 'cold'
}

async function sendEmailNotification(data) {
  if (!RESEND_API_KEY) return
  const html = `
    <h1>New Lead from AI Strategist</h1>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${data.name || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${data.phone || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${data.email || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Project</td><td style="padding:8px;border:1px solid #ddd">${data.projectType || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Budget</td><td style="padding:8px;border:1px solid #ddd">${data.budget || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Lead Score</td><td style="padding:8px;border:1px solid #ddd">${data.leadLabel?.toUpperCase() || 'NEW'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Description</td><td style="padding:8px;border:1px solid #ddd">${data.description || 'N/A'}</td></tr>
    </table>`
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: ADMIN_EMAIL, subject: `New Lead: ${data.name || 'Anonymous'} - ${data.leadLabel?.toUpperCase() || 'NEW'}`, html }),
    })
    console.log('Email sent:', (await r.json()).id || 'ok')
  } catch (err) { console.error('Email failed:', err.message) }
}

async function sendWhatsAppNotification(data) {
  if (!ULTRAMSG_INSTANCE_ID || !ULTRAMSG_TOKEN) return
  const text =
    `🔔 *New Lead - GENERAS CORE*%0a` +
    `*Name:* ${data.name || 'Anonymous'}%0a` +
    `*Phone:* ${data.phone || 'N/A'}%0a` +
    `*Email:* ${data.email || 'N/A'}%0a` +
    `*Project:* ${data.projectType || 'N/A'}%0a` +
    `*Budget:* ${data.budget || 'N/A'}%0a` +
    `*Status:* ${data.leadLabel?.toUpperCase() || 'NEW'}%0a%0a` +
    `*Description:* ${(data.description || 'N/A').substring(0, 200)}`
  try {
    await fetch(`https://api.ultramsg.com/${ULTRAMSG_INSTANCE_ID}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: ULTRAMSG_TOKEN,
        to: OWNER_WHATSAPP,
        body: text.replace(/%0a/g, '\n'),
      }),
    })
    console.log('WhatsApp notification sent')
  } catch (err) { console.error('WhatsApp notification failed:', err.message) }
}

function getWhatsAppLink(data) {
  const msg = encodeURIComponent(
    `🔔 *New Lead from AI Strategist*%0a%0a` +
    `*Name:* ${data.name || 'Anonymous'}%0a` +
    `*Project:* ${data.projectType || 'N/A'}%0a` +
    `*Budget:* ${data.budget || 'N/A'}%0a` +
    `*Contact:* ${data.phone || data.email || 'N/A'}%0a` +
    `*Status:* ${data.leadLabel?.toUpperCase() || 'NEW'}`
  )
  return `https://wa.me/${OWNER_WHATSAPP}?text=${msg}`
}

// ─── Gemini Helpers ───────────────────────────────────────────
function formatHistoryForGemini(history) {
  return (history || [])
    .filter(m => m.role !== 'system')
    .slice(-20)
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
}

async function askGemini(systemPrompt, history, message) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
  })

  const chat = model.startChat({ history: formatHistoryForGemini(history) })
  const result = await chat.sendMessage(message)
  return result.response.text()
}

// ─── Build System Prompt ──────────────────────────────────────
function buildSystemPrompt(knowledge, mode) {
  const base = `You are Generas AI Strategist — a high-performance AI embedded in a portfolio website.

You are NOT a chatbot. You are a:
- Business analyst
- Systems architect
- Startup advisor
- Lead qualification engine
- Booking assistant
- Revenue opportunity generator

CORE BEHAVIOR: Every user input MUST be transformed into:
1. Problem understanding
2. System thinking
3. Business opportunity extraction
4. Software / AI solution mapping
5. Monetization potential
6. Next action (booking or contact)

Never give generic answers. Never stop at explanation. Always convert ideas into systems.

RULES:
- Never act like a generic chatbot
- Always think in systems, products, and business opportunities
- Always try to convert conversation into: Project / Lead / Booking
- Be concise, structured, analytical
- Never waste user intent
- If user mentions Rwanda, include Rwanda-specific insights (mobile money, local market, SME digitalization, education, transport, agritech)
- NEVER reset to welcome message. Remember the conversation context.
- You are mid-conversation — continue naturally from what was discussed.

RESPONSE FORMAT (use markdown):
### 1. Understanding
### 2. Analysis
### 3. Opportunities
### 4. Recommendation
### 5. Next Step`

  const modes = {
    portfolio: `MODE — PORTFOLIO MODE
User asks about who you are, projects, services, portfolio.

You must:
- Show Generas Core identity from knowledge base
- Show technologies and experience
- Show services
- End with CTA: Book consultation`,

    opportunity_scanner: `MODE — OPPORTUNITY SCANNER
User talks about any idea or business.

Output:
- Problem analysis
- System opportunities
- AI opportunities
- Automation opportunities
- Revenue models
- Suggested Generas solution

End with: "Want me to design a full system blueprint?"`,

    startup_generator: `MODE — STARTUP GENERATOR
User gives budget, interest, or skills.

Generate:
- Startup ideas
- SaaS ideas
- Monetization models
- MVP roadmap`,

    idea_validation: `MODE — IDEA VALIDATION
Score each dimension 0-10: market demand, revenue potential, difficulty, competition, Rwanda fit.
Output final score + recommendation.`,

    booking: `MODE — BOOKING ENGINE
User shows intent to build. Collect name, email, phone, country, project type, budget, deadline, description.
Then save, notify, and show booking link.`,
  }

  return `${base}\n\n${modes[mode] || modes.portfolio}\n\nKNOWLEDGE BASE:\n${knowledge}\n\nLEAD SCORING RULES:
- HOT: budget mentioned + clear idea + urgency
- WARM: some interest shown
- COLD: just browsing

IMPORTANT: At the end of your response, append JSON:
---
{"leadScore":{"budget":0,"intent":0,"clarity":0,"businessValue":0},"mode":"portfolio","collectContact":false,"name":"","email":"","phone":"","projectType":"","budget":""}
---`
}

function getStatePrompt(state) {
  const prompts = {
    new_user: 'The user just started the conversation. Welcome them and offer quick actions. DO NOT show projects unless asked.',
    project_request: '',
    idea_input: 'The user is describing a business idea or project. Apply the Opportunity Scanner framework. Analyze, find opportunities, recommend next steps.',
    clarification: 'The user is clarifying or correcting. Ask them: "Tell me about your project so I can help structure it into a system." DO NOT reset to welcome.',
    booking_intent: 'The user wants to build something. Collect their info and guide to booking.',
  }
  return prompts[state] || ''
}

// ─── POST /api/chat ──────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], sessionId = `session_${Date.now()}`, conversationState: prevState = 'new_user', messageCount = 0 } = req.body
    if (!message) return res.status(400).json({ error: 'Message required' })
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not configured' })

    const state = detectState(message, prevState, messageCount)

    // PROJECT_REQUEST: return projects directly, no AI call
    if (state === 'project_request') {
      const projectResponse = handleProjectRequest()
      try {
        await supabase.from('ai_conversations').insert([
          { session_id: sessionId, role: 'user', content: message, mode: 'portfolio' },
          { session_id: sessionId, role: 'assistant', content: projectResponse, mode: 'portfolio' },
        ])
      } catch (_) {}

      return res.json({
        response: projectResponse,
        conversationState: state,
        leadScore: { budget: 0, intent: 0, clarity: 0, businessValue: 0 },
        leadLabel: 'cold',
        mode: 'portfolio',
        collectContact: false,
      })
    }

    // All other states: use Gemini with state context
    const mode = detectMode(message)
    const knowledge = loadKnowledgeBase()
    const modeInstructions = getStatePrompt(state)
    const systemPrompt = buildSystemPrompt(knowledge, mode) + (modeInstructions ? `\n\nCONTEXT: ${modeInstructions}` : '')

    const responseText = await askGemini(systemPrompt, history, message)

    let leadData = { budgetScore: 0, intentScore: 0, clarityScore: 0, businessValueScore: 0, leadLabel: 'cold', mode, collectContact: false, name: '', email: '', phone: '', projectType: '', budget: '', description: message }
    const jsonMatch = responseText.match(/---\s*\n({[\s\S]*?})\s*$/)
    if (jsonMatch) {
      try {
        const p = JSON.parse(jsonMatch[1])
        leadData = {
          budgetScore: p.leadScore?.budget ?? 0, intentScore: p.leadScore?.intent ?? 0,
          clarityScore: p.leadScore?.clarity ?? 0, businessValueScore: p.leadScore?.businessValue ?? 0,
          leadLabel: determineLeadLabel({ budget: p.leadScore?.budget ?? 0, intent: p.leadScore?.intent ?? 0, clarity: p.leadScore?.clarity ?? 0, businessValue: p.leadScore?.businessValue ?? 0 }),
          mode: p.mode || mode, collectContact: p.collectContact || false,
          name: p.name || '', email: p.email || '', phone: p.phone || '',
          projectType: p.projectType || '', budget: p.budget || '', description: message,
        }
      } catch (e) { console.error('Parse lead JSON error:', e.message) }
    }

    const cleanResponse = responseText.replace(/---\s*\n\{[\s\S]*?\}\s*$/, '').trim()

    try {
      await supabase.from('ai_conversations').insert([
        { session_id: sessionId, role: 'user', content: message, mode },
        { session_id: sessionId, role: 'assistant', content: cleanResponse, mode },
      ])
    } catch (dbErr) { console.error('DB store error:', dbErr.message) }

    if (leadData.leadLabel === 'hot' && leadData.collectContact) {
      try {
        const { data: lead } = await supabase.from('ai_leads').insert({
          name: leadData.name || null, email: leadData.email || null, phone: leadData.phone || null,
          project_type: leadData.projectType || null, budget_range: leadData.budget || null,
          description: message, budget_score: leadData.budgetScore, intent_score: leadData.intentScore,
          clarity_score: leadData.clarityScore, business_value_score: leadData.businessValueScore,
          lead_label: leadData.leadLabel, source: 'ai_chat',
        }).select().single()

        if (lead) {
          await supabase.from('ai_conversations').update({ lead_id: lead.id }).eq('session_id', sessionId).eq('role', 'user')
          sendEmailNotification({ ...leadData, description: message })
          sendWhatsAppNotification({ ...leadData, description: message })
        }
      } catch (dbErr) { console.error('Lead create error:', dbErr.message) }
    }

    res.json({
      response: cleanResponse,
      conversationState: state,
      leadScore: { budget: leadData.budgetScore, intent: leadData.intentScore, clarity: leadData.clarityScore, businessValue: leadData.businessValueScore },
      leadLabel: leadData.leadLabel,
      mode: leadData.mode,
      collectContact: leadData.collectContact,
      whatsappLink: leadData.leadLabel === 'hot' && leadData.collectContact ? getWhatsAppLink(leadData) : null,
    })

  } catch (error) {
    console.error('Chat error:', error)
    const fallback = handleProjectRequest()
    res.json({ response: fallback, conversationState: 'project_request', leadScore: { budget: 0, intent: 0, clarity: 0, businessValue: 0 }, leadLabel: 'cold', mode: 'portfolio', collectContact: false })
  }
})

// ─── POST /api/booking ───────────────────────────────────────
app.post('/api/booking', async (req, res) => {
  try {
    const { name, email, phone, country, projectType, budget, deadline, description, preferredDate, preferredTime } = req.body
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' })

    const { data: booking, error } = await supabase.from('ai_bookings').insert({
      name, email, phone, country, project_type: projectType, budget_range: budget,
      deadline, description, preferred_date: preferredDate, preferred_time: preferredTime,
    }).select().single()

    if (error) throw error

    const leadInfo = { name, email, phone, projectType, budget, description, leadLabel: 'booking' }
    sendEmailNotification(leadInfo)
    sendWhatsAppNotification(leadInfo)

    res.json({ success: true, booking, whatsappLink: getWhatsAppLink({ name, projectType, budget, phone, email, leadLabel: 'booking' }), message: `Thank you ${name}! Your consultation request has been received. I'll contact you within 24 hours.` })
  } catch (error) {
    console.error('Booking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /api/leads ─────────────────────────────────────────
app.post('/api/leads', async (req, res) => {
  try {
    const body = req.body
    const { data: lead, error } = await supabase.from('ai_leads').insert({
      name: body.name || null, email: body.email || null, phone: body.phone || null,
      whatsapp: body.whatsapp || null, company: body.company || null,
      location: body.location || null, user_type: body.userType || null,
      project_type: body.projectType || null, discovery_answers: body.discovery || null,
      budget_range: body.budget || null, timeline: body.timeline || null,
      chat_transcript: body.chatTranscript || null, project_brief: body.projectBrief || null,
      source: 'ai_assistant', lead_label: 'new',
    }).select().single()
    if (error) throw error
    const leadInfo = { name: body.name, email: body.email, phone: body.phone, projectType: body.projectType, budget: body.budget, description: body.projectBrief, leadLabel: 'new' }
    sendEmailNotification(leadInfo)
    sendWhatsAppNotification(leadInfo)
    res.json({ success: true, lead })
  } catch (error) { console.error('Lead create error:', error); res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /api/leads ──────────────────────────────────────────
app.get('/api/leads', async (req, res) => {
  try {
    const { data: leads, error } = await supabase.from('ai_leads').select('*').order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    res.json({ leads })
  } catch (error) { res.status(500).json({ error: 'Internal server error' }) }
})

// ─── GET /api/analytics ──────────────────────────────────────
app.get('/api/analytics', async (req, res) => {
  try {
    const { data: leads } = await supabase.from('ai_leads').select('lead_label')
    const { count: tLeads } = await supabase.from('ai_leads').select('*', { count: 'exact', head: true })
    const { count: tConv } = await supabase.from('ai_conversations').select('*', { count: 'exact', head: true })
    const { count: tBook } = await supabase.from('ai_bookings').select('*', { count: 'exact', head: true })
    const breakdown = { hot: 0, warm: 0, cold: 0 }
    if (leads) leads.forEach(l => { if (breakdown[l.lead_label] !== undefined) breakdown[l.lead_label]++ })
    res.json({ totalLeads: tLeads || 0, totalConversations: tConv || 0, totalBookings: tBook || 0, leadBreakdown: breakdown })
  } catch (error) { res.status(500).json({ error: 'Internal server error' }) }
})

const PORT = process.env.API_PORT || 3001
app.listen(PORT, () => {
  console.log(`AI Strategist API running on http://localhost:${PORT}`)
  console.log(`Knowledge base loaded (${loadKnowledgeBase().length} chars)`)
})
