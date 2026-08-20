import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Inline SVG icons - no external libraries
const IconUsers = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const IconCoffee = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 1v3M10 1v3M14 1v3" />
  </svg>
)

const IconMessageSquare = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
)

const IconNewspaper = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
)

const IconVideo = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const IconImage = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const IconTrendingUp = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    supporters: 0,
    comments: 0,
    pendingComments: 0,
    blogs: 0,
    videos: 0,
    photos: 0,
    mentorshipApps: 0,
    projectInquiries: 0,
    aiLeads: 0,
    contactMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      console.log(' Loading dashboard stats...')
      
      const [coffeeSupporters, comments, pending, blogs, videos, photos, mentorship, projects, aiLeads, contactMsgs] = await Promise.all([
        supabase.from('coffee_supporters').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('mentorship_applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('project_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('ai_leads').select('*', { count: 'exact', head: true }),
        supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false),
      ])

      console.log(' Stats loaded:', {
        comments: comments.count,
        pending: pending.count,
        coffeeSupporters: coffeeSupporters.count
      })

      setStats({
        supporters: coffeeSupporters.count || 0,
        comments: comments.count || 0,
        pendingComments: pending.count || 0,
        blogs: blogs.count || 0,
        videos: videos.count || 0,
        photos: photos.count || 0,
        mentorshipApps: mentorship.count || 0,
        projectInquiries: projects.count || 0,
        aiLeads: aiLeads.count || 0,
        contactMessages: contactMsgs.count || 0,
      })
    } catch (error) {
      console.error(' Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  // Manual refresh button
  const handleRefresh = () => {
    setLoading(true)
    loadStats()
  }

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <button 
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <span className="text-white"><IconCoffee /></span>
          Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-amber-500 mx-auto mb-2"><IconCoffee /></div>
          <div className="text-2xl font-bold">{stats.supporters}</div>
          <div className="text-xs text-gray-400">Supporters</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-blue-500 mx-auto mb-2"><IconMessageSquare /></div>
          <div className="text-2xl font-bold">{stats.comments}</div>
          <div className="text-xs text-gray-400">Total Comments</div>
          {stats.pendingComments > 0 && <div className="text-xs text-amber-500">{stats.pendingComments} pending approval</div>}
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-green-500 mx-auto mb-2"><IconNewspaper /></div>
          <div className="text-2xl font-bold">{stats.blogs}</div>
          <div className="text-xs text-gray-400">Blog Posts</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-red-500 mx-auto mb-2"><IconVideo /></div>
          <div className="text-2xl font-bold">{stats.videos}</div>
          <div className="text-xs text-gray-400">Videos</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-purple-500 mx-auto mb-2"><IconImage /></div>
          <div className="text-2xl font-bold">{stats.photos}</div>
          <div className="text-xs text-gray-400">Photos</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-cyan-500 mx-auto mb-2"><IconUsers /></div>
          <div className="text-2xl font-bold">{stats.mentorshipApps}</div>
          <div className="text-xs text-gray-400">Mentorship Apps</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-orange-500 mx-auto mb-2"><IconTrendingUp /></div>
          <div className="text-2xl font-bold">{stats.projectInquiries}</div>
          <div className="text-xs text-gray-400">Project Inquiries</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-blue-400 mx-auto mb-2"><IconTrendingUp /></div>
          <div className="text-2xl font-bold">{stats.aiLeads}</div>
          <div className="text-xs text-gray-400">AI Leads</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 text-center">
          <div className="text-yellow-400 mx-auto mb-2"><IconMessageSquare /></div>
          <div className="text-2xl font-bold">{stats.contactMessages}</div>
          <div className="text-xs text-gray-400">Unread Messages</div>
          {stats.contactMessages > 0 && <div className="text-xs text-yellow-400">{stats.contactMessages} unread</div>}
        </div>
      </div>
    </div>
  )
}