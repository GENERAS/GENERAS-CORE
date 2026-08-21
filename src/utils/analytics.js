const STORAGE_KEY = 'generas_analytics'

function getAnalytics() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveAnalytics(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function trackPageView(path) {
  const analytics = getAnalytics()
  const today = new Date().toISOString().split('T')[0]

  if (!analytics.pageViews) analytics.pageViews = {}
  if (!analytics.pageViews[path]) analytics.pageViews[path] = {}
  if (!analytics.pageViews[path][today]) analytics.pageViews[path][today] = 0
  analytics.pageViews[path][today]++

  if (!analytics.dailyTotals) analytics.dailyTotals = {}
  if (!analytics.dailyTotals[today]) analytics.dailyTotals[today] = 0
  analytics.dailyTotals[today]++

  if (!analytics.totalViews) analytics.totalViews = 0
  analytics.totalViews++

  if (!analytics.firstVisit) analytics.firstVisit = today
  analytics.lastVisit = today

  saveAnalytics(analytics)
}

export function getAnalyticsSummary() {
  const analytics = getAnalytics()
  const today = new Date().toISOString().split('T')[0]

  const last7 = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    last7.push({
      date: key,
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      views: analytics.dailyTotals?.[key] || 0
    })
  }

  const topPages = Object.entries(analytics.pageViews || {})
    .map(([path, days]) => ({
      path,
      total: Object.values(days).reduce((sum, v) => sum + v, 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  return {
    totalViews: analytics.totalViews || 0,
    firstVisit: analytics.firstVisit,
    lastVisit: analytics.lastVisit,
    last7Days: last7,
    todayViews: analytics.dailyTotals?.[today] || 0,
    topPages
  }
}

export function trackEvent(category, action, label) {
  const analytics = getAnalytics()
  if (!analytics.events) analytics.events = []
  analytics.events.push({
    category,
    action,
    label,
    timestamp: new Date().toISOString()
  })
  if (analytics.events.length > 100) analytics.events = analytics.events.slice(-100)
  saveAnalytics(analytics)
}
