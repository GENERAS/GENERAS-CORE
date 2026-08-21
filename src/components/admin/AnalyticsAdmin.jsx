import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { getAnalyticsSummary } from '../../utils/analytics'
import { Eye, TrendingUp, Calendar, BarChart3 } from 'lucide-react'

export default function AnalyticsAdmin() {
  const [analytics, setAnalytics] = useState(null)
  const [dbCounts, setDbCounts] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const local = getAnalyticsSummary()

    try {
      const [projects, inquiries, mentorship, aiLeads, contactMsgs] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('project_inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('mentorship_applications').select('*', { count: 'exact', head: true }),
        supabase.from('ai_leads').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }),
      ])

      setDbCounts({
        projects: projects.count || 0,
        inquiries: inquiries.count || 0,
        mentorship: mentorship.count || 0,
        aiLeads: aiLeads.count || 0,
        contactMsgs: contactMsgs.count || 0,
      })
    } catch (err) {
      console.error('Analytics DB error:', err)
    }

    setAnalytics(local)
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  const maxViews = Math.max(...(analytics?.last7Days?.map(d => d.views) || [1]), 1)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Page Views</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.todayViews}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">First Visit</p>
              <p className="text-sm font-bold text-gray-900">{analytics.firstVisit || 'N/A'}</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Last Visit</p>
              <p className="text-sm font-bold text-gray-900">{analytics.lastVisit || 'N/A'}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Last 7 days chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Page Views (Last 7 Days)</h3>
        <div className="flex items-end gap-3 h-40">
          {analytics.last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">{day.views}</span>
              <div
                className="w-full bg-blue-500 rounded-t-md transition-all duration-500"
                style={{ height: `${(day.views / maxViews) * 100}%`, minHeight: day.views > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-gray-500 mt-2">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top pages */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Top Pages</h3>
        {analytics.topPages.length === 0 ? (
          <p className="text-gray-500 text-sm">No page views tracked yet</p>
        ) : (
          <div className="space-y-2">
            {analytics.topPages.map((page, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-gray-700 font-mono">{page.path}</span>
                <span className="text-sm font-semibold text-gray-900">{page.total} views</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DB counts */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Database Records</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(dbCounts).map(([key, val]) => (
            <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-900">{val}</p>
              <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
