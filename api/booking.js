// Vercel Serverless Function: /api/booking
import { createClient } from '@supabase/supabase-js'

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => { try { resolve(JSON.parse(body)) } catch (e) { reject(e) } })
  })
}

async function sendWhatsAppNotification(data) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID
  const token = process.env.ULTRAMSG_TOKEN
  const ownerWhatsApp = process.env.OWNER_WHATSAPP || '250794144738'
  if (!instanceId || !token) return
  const text =
    `🔔 *New Booking - GENERAS CORE*\n` +
    `*Name:* ${data.name || 'Anonymous'}\n` +
    `*Phone:* ${data.phone || 'N/A'}\n` +
    `*Email:* ${data.email || 'N/A'}\n` +
    `*Project:* ${data.projectType || 'N/A'}\n` +
    `*Budget:* ${data.budget || 'N/A'}\n` +
    `*Description:* ${(data.description || 'N/A').substring(0, 200)}`
  try {
    await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, to: ownerWhatsApp, body: text }),
    })
  } catch (_) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { name, email, phone, country, projectType, budget, deadline, description, preferredDate, preferredTime } = await parseBody(req)
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' })

    const supabase = createClient(
      process.env.VITE_AI_SUPABASE_URL,
      process.env.VITE_AI_SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: booking, error } = await supabase.from('ai_bookings').insert({
      name, email, phone, country, project_type: projectType, budget_range: budget,
      deadline, description, preferred_date: preferredDate, preferred_time: preferredTime,
    }).select().single()

    if (error) throw error

    const leadInfo = { name, email, phone, projectType, budget, description }

    // Send email notification
    const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY
    if (RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: process.env.VITE_FROM_EMAIL || 'onboarding@resend.dev',
            to: process.env.VITE_ADMIN_EMAIL || 'generaskagiraneza@gmail.com',
            subject: `New Booking: ${name}`,
            html: `<h1>New Booking Request</h1><p>Name: ${name}<br>Email: ${email}<br>Phone: ${phone || 'N/A'}<br>Project: ${projectType || 'N/A'}<br>Budget: ${budget || 'N/A'}</p>`,
          }),
        })
      } catch (_) {}
    }

    // Send WhatsApp notification
    sendWhatsAppNotification(leadInfo)

    const OWNER_WHATSAPP = process.env.OWNER_WHATSAPP || '250794144738'
    const waMsg = encodeURIComponent(`🔔 *New Booking Request*%0a%0a*Name:* ${name}%0a*Project:* ${projectType || 'N/A'}%0a*Budget:* ${budget || 'N/A'}%0a*Contact:* ${phone || email}`)

    res.json({
      success: true,
      booking,
      whatsappLink: `https://wa.me/${OWNER_WHATSAPP}?text=${waMsg}`,
      message: `Thank you ${name}! Your consultation request has been received. I'll contact you within 24 hours.`,
    })

  } catch (error) {
    console.error('Booking error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
