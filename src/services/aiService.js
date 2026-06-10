const API_BASE = '/api'

export async function sendMessage({ message, history = [], sessionId, conversationState = 'new_user', messageCount = 0 }) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, sessionId, conversationState, messageCount }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function submitBooking(data) {
  const res = await fetch(`${API_BASE}/booking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function submitLead(data) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to submit lead')
  return res.json()
}

export async function getLeads() {
  const res = await fetch(`${API_BASE}/leads`)
  if (!res.ok) throw new Error('Failed to fetch leads')
  return res.json()
}

export function generateSessionId() {
  const stored = localStorage.getItem('ai_session_id')
  if (stored) return stored
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  localStorage.setItem('ai_session_id', id)
  return id
}
