// Vercel Serverless Function: /api/leads
import { createClient } from '@supabase/supabase-js'

async function sendEmailNotification(data) {
  const key = process.env.VITE_RESEND_API_KEY
  if (!key) return
  const html = `
    <h1>New Lead from AI Assistant</h1>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif">
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Name</td><td style="padding:8px;border:1px solid #ddd">${data.name || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #ddd">${data.email || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Phone</td><td style="padding:8px;border:1px solid #ddd">${data.phone || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Project</td><td style="padding:8px;border:1px solid #ddd">${data.projectType || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Budget</td><td style="padding:8px;border:1px solid #ddd">${data.budget || 'N/A'}</td></tr>
      <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold">Timeline</td><td style="padding:8px;border:1px solid #ddd">${data.timeline || 'N/A'}</td></tr>
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
  if (!instanceId || !token) return
  const text =
    `🔔 *New Lead - GENERAS CORE*\n` +
    `*Name:* ${data.name || 'Anonymous'}\n` +
    `*Phone:* ${data.phone || 'N/A'}\n` +
    `*Email:* ${data.email || 'N/A'}\n` +
    `*Project:* ${data.projectType || 'N/A'}\n` +
    `*Budget:* ${data.budget || 'N/A'}\n` +
    `*Timeline:* ${data.timeline || 'N/A'}`
  try {
    await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, to: process.env.OWNER_WHATSAPP || '250794144738', body: text }),
    })
  } catch (_) {}
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const supabase = createClient(
    process.env.VITE_AI_SUPABASE_URL,
    process.env.VITE_AI_SUPABASE_SERVICE_ROLE_KEY
  )

  // ─── POST: Create a new lead ─────────────────────────────────
  if (req.method === 'POST') {
    try {
      const body = await parseBody(req)
      const { data: lead, error } = await supabase.from('ai_leads').insert({
        name: body.name || null,
        email: body.email || null,
        phone: body.phone || null,
        whatsapp: body.whatsapp || null,
        company: body.company || null,
        location: body.location || null,
        user_type: body.userType || null,
        project_type: body.projectType || null,
        discovery_answers: body.discovery || null,
        budget_range: body.budget || null,
        timeline: body.timeline || null,
        chat_transcript: body.chatTranscript || null,
        project_brief: body.projectBrief || null,
        source: 'ai_assistant',
        lead_label: 'new',
      }).select().single()

      if (error) throw error

      sendEmailNotification(body)
      sendWhatsAppNotification(body)

      return res.json({ success: true, lead })
    } catch (error) {
      console.error('Lead create error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  // ─── GET: List leads ─────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { data: leads, error } = await supabase
        .from('ai_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const { count: totalConversations } = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true })

      const breakdown = { hot: 0, warm: 0, cold: 0 }
      if (leads) leads.forEach(l => { if (breakdown[l.lead_label] !== undefined) breakdown[l.lead_label]++ })

      return res.json({
        leads,
        analytics: {
          totalLeads: leads?.length || 0,
          totalConversations: totalConversations || 0,
          leadBreakdown: breakdown,
        },
      })
    } catch (error) {
      console.error('Leads error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
