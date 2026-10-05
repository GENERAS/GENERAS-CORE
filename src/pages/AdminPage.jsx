import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import { getAnalyticsSummary } from '../utils/analytics'
import {
  FaChartLine, FaGraduationCap, FaBrain, FaCode, FaCoffee, FaNewspaper,
  FaVideo, FaImages, FaCrown, FaUsers, FaComments, FaCog, FaAward,
  FaUser, FaBriefcase, FaStar, FaFileAlt, FaRobot, FaEnvelope, FaHandshake, FaFileInvoice,
  FaHome, FaBars, FaTimes, FaSignOutAlt, FaChevronLeft
} from 'react-icons/fa'
import AdminDashboard from '../components/admin/AdminDashboard'
import AcademicManager from '../components/admin/AcademicManager'
import AcademicReportsManager from '../components/admin/AcademicReportsManager'
import ProjectsManager from '../components/admin/ProjectsManager'
import TradingManager from '../components/admin/TradingManager'
import SkillsManager from '../components/admin/SkillsManager'
import BlogManager from '../components/admin/BlogManager'
import VideoManager from '../components/admin/VideoManager'
import PhotoManager from '../components/admin/PhotoManager'
import SupporterManager from '../components/admin/SupporterManager'
import CoffeeManager from '../components/admin/CoffeeManager'
import FollowerManager from '../components/admin/FollowerManager'
import CommentModerator from '../components/admin/CommentModerator'
import CertificatesManager from '../components/admin/CertificatesManager'
import MentorshipManager from '../components/admin/MentorshipManager'
import ProjectInquiriesManager from '../components/admin/ProjectInquiriesManager'
import TestimonialsManager from '../components/admin/TestimonialsManager'
import AiLeadsManager from '../components/admin/AiLeadsManager'
import ContactMessagesManager from '../components/admin/ContactMessagesManager'
import CollaborationManager from '../components/admin/CollaborationManager'
import QuotesManager from '../components/admin/QuotesManager'
import AnalyticsAdmin from '../components/admin/AnalyticsAdmin'
import NotificationCenter from '../components/admin/NotificationCenter'
import SettingsManager from '../components/admin/SettingsManager'

const navSections = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
      { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    ]
  },
  {
    title: 'Content',
    items: [
      { id: 'blogs', label: 'Blogs', icon: FaNewspaper },
      { id: 'projects', label: 'Projects', icon: FaCode },
      { id: 'videos', label: 'Videos', icon: FaVideo },
      { id: 'photos', label: 'Photos', icon: FaImages },
      { id: 'testimonials', label: 'Testimonials', icon: FaStar },
      { id: 'certificates', label: 'Certificates', icon: FaAward },
    ]
  },
  {
    title: 'Academic',
    items: [
      { id: 'academic', label: 'Academic Levels', icon: FaGraduationCap },
      { id: 'academic-reports', label: 'School Reports', icon: FaFileAlt },
      { id: 'skills', label: 'Skills', icon: FaBrain },
    ]
  },
  {
    title: 'Business',
    items: [
      { id: 'trading', label: 'Trading', icon: FaChartLine },
      { id: 'coffee', label: 'Coffee Supporters', icon: FaCoffee },
      { id: 'supporters', label: 'Supporters', icon: FaCrown },
    ]
  },
  {
    title: 'Engagement',
    items: [
      { id: 'mentorship', label: 'Mentorship', icon: FaUser },
      { id: 'inquiries', label: 'Inquiries', icon: FaBriefcase },
      { id: 'ai-leads', label: 'AI Leads', icon: FaRobot },
      { id: 'contact-messages', label: 'Messages', icon: FaEnvelope },
      { id: 'collaborations', label: 'Collaborations', icon: FaHandshake },
      { id: 'quotes', label: 'Quotes & Orders', icon: FaFileInvoice },
      { id: 'comments', label: 'Comments', icon: FaComments },
      { id: 'followers', label: 'Followers', icon: FaUsers },
    ]
  },
  {
    title: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: FaCog },
    ]
  }
]

const allTabs = navSections.flatMap(s => s.items)

export default function AdminPage() {
  const { user, profile, isAdmin, loading, signOut } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const mainRef = useRef(null)

  const [badges, setBadges] = useState({})

  const loadBadges = useCallback(async () => {
    const queries = [
      { id: 'comments', q: () => supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_approved', false) },
      { id: 'ai-leads', q: () => supabase.from('ai_leads').select('*', { count: 'exact', head: true }).eq('lead_label', 'new') },
      { id: 'inquiries', q: () => supabase.from('project_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new') },
      { id: 'contact-messages', q: () => supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false) },
      { id: 'collaborations', q: () => supabase.from('collaboration_requests').select('*', { count: 'exact', head: true }).eq('status', 'new') },
      { id: 'quotes', q: () => supabase.from('service_quotes').select('*', { count: 'exact', head: true }).eq('status', 'new') },
      { id: 'testimonials', q: () => supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('status', 'pending') },
      { id: 'supporters', q: () => supabase.from('coffee_supporters').select('*', { count: 'exact', head: true }).neq('payment_status', 'verified') },
    ]
    const settled = await Promise.allSettled(queries.map(({ q }) => q()))
    const next = {}
    queries.forEach(({ id }, i) => {
      const r = settled[i]
      next[id] = r.status === 'fulfilled' && r.value.error == null ? (r.value.count || 0) : 0
    })
    const [newApps, pendingVerify] = await Promise.allSettled([
      supabase.from('mentorship_applications').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      supabase.from('mentorship_applications').select('*', { count: 'exact', head: true }).eq('payment_status', 'awaiting_verification'),
    ])
    next.mentorship = (newApps.status === 'fulfilled' ? newApps.value.count || 0 : 0) + (pendingVerify.status === 'fulfilled' ? pendingVerify.value.count || 0 : 0)
    next.analytics = getAnalyticsSummary().todayViews
    setBadges(next)
  }, [])

  useEffect(() => {
    loadBadges()
    const badgeTables = ['comments', 'ai_leads', 'project_inquiries', 'contact_submissions', 'collaboration_requests', 'service_quotes', 'testimonials', 'coffee_supporters', 'mentorship_applications']
    const badgeChannel = badgeTables.reduce(
      (channel, table) =>
        channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => loadBadges()),
      supabase.channel('admin_sidebar_badges')
    )
    badgeChannel.subscribe()
    const onFocus = () => loadBadges()
    window.addEventListener('focus', onFocus)
    return () => {
      supabase.removeChannel(badgeChannel)
      window.removeEventListener('focus', onFocus)
    }
  }, [activeTab, loadBadges])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNav = (id) => {
    setActiveTab(id)
    setMobileOpen(false)
    mainRef.current?.scrollTo(0, 0)
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-600 border-t-transparent"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    navigate('/admin-login')
    return null
  }

  const currentLabel = allTabs.find(t => t.id === activeTab)?.label || 'Dashboard'

  const SidebarContent = ({ collapsed }) => (
    <div className="flex flex-col h-full">
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {!collapsed ? (
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>GENERAS</span>
          </Link>
        ) : (
          <Link to="/" className="flex justify-center">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          </Link>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className={`px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              const badgeCount = badges[item.id] || 0
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 mb-0.5 ${
                    isActive
                      ? 'bg-yellow-600 text-white shadow-sm'
                      : isDark
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <span className="relative flex-shrink-0">
                    <Icon className="w-4 h-4" />
                    {collapsed && badgeCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {badgeCount > 99 ? '99+' : badgeCount}
                      </span>
                    )}
                  </span>
                  {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                  {!collapsed && badgeCount > 0 && (
                    <span className={`ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      isActive ? 'bg-white text-yellow-700' : 'bg-red-500 text-white'
                    }`}>
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={`p-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {profile?.full_name || user.email?.split('@')[0]}
              </p>
              <p className={`text-xs truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Admin
              </p>
            </div>
            <button
              onClick={() => { signOut(); navigate('/') }}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-red-400' : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'}`}
              title="Sign Out"
            >
              <FaSignOutAlt className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { signOut(); navigate('/') }}
            className={`w-full flex justify-center p-2 rounded-lg transition-colors ${isDark ? 'text-gray-400 hover:bg-gray-700 hover:text-red-400' : 'text-gray-400 hover:bg-gray-100 hover:text-red-500'}`}
            title="Sign Out"
          >
            <FaSignOutAlt className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className={`h-dvh overflow-hidden flex ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 h-full z-30 transition-all duration-200 border-r ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } ${sidebarOpen ? 'w-60' : 'w-16'}`}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className={`relative w-64 h-full ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
            <button
              onClick={() => setMobileOpen(false)}
              className={`absolute top-3 right-3 p-1.5 rounded-lg ${isDark ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <FaTimes className="w-4 h-4" />
            </button>
            <SidebarContent collapsed={false} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar */}
        <header className={`flex-shrink-0 z-20 flex items-center justify-between px-4 lg:px-6 h-14 border-b backdrop-blur-sm ${
          isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(true)
                } else {
                  setSidebarOpen(!sidebarOpen)
                }
              }}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              {(mobileOpen || sidebarOpen) && window.innerWidth >= 1024
                ? <FaChevronLeft className="w-4 h-4" />
                : <FaBars className="w-4 h-4" />
              }
            </button>
            <h1 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {currentLabel}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Link
              to="/"
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title="View Site"
            >
              <FaHome className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main ref={mainRef} className="flex-1 p-4 lg:p-6 overflow-y-auto overscroll-contain">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'academic' && <AcademicManager />}
          {activeTab === 'academic-reports' && <AcademicReportsManager />}
          {activeTab === 'skills' && <SkillsManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'trading' && <TradingManager />}
          {activeTab === 'coffee' && <CoffeeManager />}
          {activeTab === 'blogs' && <BlogManager />}
          {activeTab === 'videos' && <VideoManager />}
          {activeTab === 'photos' && <PhotoManager />}
          {activeTab === 'supporters' && <SupporterManager />}
          {activeTab === 'followers' && <FollowerManager />}
          {activeTab === 'comments' && <CommentModerator />}
          {activeTab === 'settings' && <SettingsManager />}
          {activeTab === 'certificates' && <CertificatesManager />}
          {activeTab === 'mentorship' && <MentorshipManager />}
          {activeTab === 'inquiries' && <ProjectInquiriesManager />}
          {activeTab === 'ai-leads' && <AiLeadsManager />}
          {activeTab === 'contact-messages' && <ContactMessagesManager />}
          {activeTab === 'collaborations' && <CollaborationManager />}
          {activeTab === 'quotes' && <QuotesManager />}
          {activeTab === 'analytics' && <AnalyticsAdmin />}
          {activeTab === 'testimonials' && <TestimonialsManager />}
        </main>
      </div>
    </div>
  )
}
