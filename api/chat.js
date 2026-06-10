// Vercel Serverless Function: /api/chat
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge')

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
    } catch (_) {}
  }
  knowledgeCache = content
  return content
}

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

function handleProjectRequest() {
  const projectsPath = path.join(KNOWLEDGE_DIR, 'projects.md')
  try {
    if (fs.existsSync(projectsPath)) {
      const raw = fs.readFileSync(projectsPath, 'utf-8').trim()
      const clean = raw.split('\n').filter(l => !l.includes('[Add Your') && !l.includes('[List') && !l.includes('[Brief')).join('\n').trim()
      if (clean.length > 80) return `${clean}\n\n---\nWant to discuss a custom project? [Book a consultation](https://wa.me/250794144738)`
    }
  } catch (_) {}
  return "### My Projects\n\nProjects are being updated. Check back soon.\n\n**Have an idea?** Tell me about it and I'll design a system for you."
}

function detectMode(message) {
  const m = message.toLowerCase()
  if (/(?:book|consult|hire|cost|price|quote|how\s+much|i (?:want|need|would like).*(?:build|create|develop|website|app|system))/i.test(m)) return 'booking'
  if (/(?:startup|idea|saas|make\s+money|side\s+hustle|passive\s+income|entrepreneur|i have (?:money|skills|capital|budget)|what can i build)/i.test(m)) return 'startup_generator'
  if (/(?:problem|business|opportunity|system|automate|digitiz|solution|pain point|inefficient|manual|process|improve|optimize|i have (?:a|an) (?:business|idea|problem|company)|what (?:system|software|tool) (?:should|can)|analyze)/i.test(m)) return 'opportunity_scanner'
  if (/(?:validate|score|rate my|evaluate|assess|idea worth|should i build|is this a good)/i.test(m)) return 'idea_validation'
  return 'portfolio'
}

function determineLeadLabel(scores) {
  if (scores.budget >= 6 && scores.intent >= 6 && scores.clarity >= 5) return 'hot'
  if (scores.intent >= 7) return 'hot'
  const avg = (scores.budget + scores.intent + scores.clarity + scores.businessValue) / 4
  if (avg >= 5) return 'warm'
  return 'cold'
}

async function sendEmailNotification(data) {
  const key = process.env.VITE_RESEND_API_KEY
  if (!key) return
  const html = `
    <h1>New Lead from AI Strategist</h1>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${data.name || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${data.phone || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${data.email || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Project</td><td style="padding:8px;border:1px solid #ddd">${data.projectType || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Budget</td><td style="padding:8px;border:1px solid #ddd">${data.budget || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Description</td><td style="padding:8px;border:1px solid #ddd">${data.description || 'N/A'}</td></tr>
    </table>`
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.VITE_FROM_EMAIL || 'onboarding@resend.dev', to: process.env.VITE_ADMIN_EMAIL || 'generaskagiraneza@gmail.com', subject: `New Lead: ${data.name || 'Anonymous'}`, html }),
    })
  } catch (_) {}
}

async function sendWhatsAppNotification(data) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID
  const token = process.env.ULTRAMSG_TOKEN
  const ownerWhatsApp = process.env.OWNER_WHATSAPP || '250794144738'
  if (!instanceId || !token) return
  const text =
    `🔔 *New Lead - GENERAS CORE*\n` +
    `*Name:* ${data.name || 'Anonymous'}\n` +
    `*Phone:* ${data.phone || 'N/A'}\n` +
    `*Email:* ${data.email || 'N/A'}\n` +
    `*Project:* ${data.projectType || 'N/A'}\n` +
    `*Budget:* ${data.budget || 'N/A'}\n` +
    `*Status:* ${data.leadLabel?.toUpperCase() || 'NEW'}\n\n` +
    `*Description:* ${(data.description || 'N/A').substring(0, 200)}`
  try {
    await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, to: ownerWhatsApp, body: text }),
    })
  } catch (_) {}
}

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
Show identity, tech, services. End with CTA.`,
    opportunity_scanner: `MODE — OPPORTUNITY SCANNER
Analyze idea. Output problems, system opportunities, AI, automation, revenue models.
End with: "Want me to design a full system blueprint?"`,
    startup_generator: `MODE — STARTUP GENERATOR
Generate startup/SaaS ideas, monetization models, MVP roadmap.`,
    idea_validation: `MODE — IDEA VALIDATION
Score 0-10: market demand, revenue potential, difficulty, competition, Rwanda fit.
Output final score + recommendation.`,
    booking: `MODE — BOOKING ENGINE
Collect name, email, phone, country, project type, budget, deadline, description.
Save, notify, show booking link.`,
  }

  return `${base}\n\n${modes[mode] || modes.portfolio}\n\nKNOWLEDGE BASE:\n${knowledge}\n\nLEAD SCORING:
- HOT: budget + clear idea + urgency
- WARM: some interest
- COLD: browsing

End with JSON:
---
{"leadScore":{"budget":0,"intent":0,"clarity":0,"businessValue":0},"mode":"portfolio","collectContact":false,"name":"","email":"","phone":"","projectType":"","budget":""}
---`
}

function getStatePrompt(state) {
  const prompts = {
    new_user: 'The user just started. Welcome them, offer quick actions. DO NOT show projects unless asked.',
    idea_input: 'The user is describing a business idea. Apply Opportunity Scanner. Analyze, find opportunities, recommend next steps.',
    clarification: 'The user is clarifying. Ask: "Tell me about your project so I can help structure it into a system." DO NOT reset to welcome.',
    booking_intent: 'The user wants to build something. Collect their info, guide to booking.',
  }
  return prompts[state] || ''
}

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
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
  })
  const chat = model.startChat({ history: formatHistoryForGemini(history) })
  const result = await chat.sendMessage(message)
  return result.response.text()
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => { try { resolve(JSON.parse(body)) } catch (e) { reject(e) } })
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { message, history = [], sessionId = `session_${Date.now()}`, conversationState: prevState = 'new_user', messageCount = 0 } = await parseBody(req)
    if (!message) return res.status(400).json({ error: 'Message required' })

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not configured' })

    const supabase = createClient(process.env.VITE_AI_SUPABASE_URL, process.env.VITE_AI_SUPABASE_SERVICE_ROLE_KEY)

    const state = detectState(message, prevState, messageCount)

    // PROJECT_REQUEST: return projects directly, no AI
    if (state === 'project_request') {
      const projectResponse = handleProjectRequest()
      try {
        await supabase.from('ai_conversations').insert([
          { session_id: sessionId, role: 'user', content: message, mode: 'portfolio' },
          { session_id: sessionId, role: 'assistant', content: projectResponse, mode: 'portfolio' },
        ])
      } catch (_) {}
      return res.json({ response: projectResponse, conversationState: state, leadScore: { budget: 0, intent: 0, clarity: 0, businessValue: 0 }, leadLabel: 'cold', mode: 'portfolio', collectContact: false })
    }

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
      } catch (_) {}
    }

    const cleanResponse = responseText.replace(/---\s*\n\{[\s\S]*?\}\s*$/, '').trim()

    try {
      await supabase.from('ai_conversations').insert([
        { session_id: sessionId, role: 'user', content: message, mode },
        { session_id: sessionId, role: 'assistant', content: cleanResponse, mode },
      ])
    } catch (_) {}

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
      } catch (_) {}
    }

    const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || '250794144738'
    const waMsg = encodeURIComponent(`🔔 *New Lead*%0a*Name:* ${leadData.name || 'Anonymous'}%0a*Project:* ${leadData.projectType || 'N/A'}%0a*Budget:* ${leadData.budget || 'N/A'}%0a*Contact:* ${leadData.phone || leadData.email || 'N/A'}`)

    res.json({
      response: cleanResponse,
      conversationState: state,
      leadScore: { budget: leadData.budgetScore, intent: leadData.intentScore, clarity: leadData.clarityScore, businessValue: leadData.businessValueScore },
      leadLabel: leadData.leadLabel,
      mode: leadData.mode,
      collectContact: leadData.collectContact,
      whatsappLink: leadData.leadLabel === 'hot' && leadData.collectContact ? `https://wa.me/${OWNER_WHATSAPP}?text=${waMsg}` : null,
    })

  } catch (error) {
    console.error('Chat error:', error)
    const fallback = handleProjectRequest()
    res.json({ response: fallback, conversationState: 'project_request', leadScore: { budget: 0, intent: 0, clarity: 0, businessValue: 0 }, leadLabel: 'cold', mode: 'portfolio', collectContact: false })
  }
}
