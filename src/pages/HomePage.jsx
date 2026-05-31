import { useEffect, useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import LivingHero from '../components/hero/LivingHero'
import AboutSection from '../components/common/AboutSection'

const SkillsMatrix = lazy(() => import('../components/skills/SkillsMatrix'))
const BlogsSection = lazy(() => import('../components/blogs/BlogsSection'))
const ContactForm = lazy(() => import('../components/contact/ContactForm'))

export default function HomePage() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    academic_levels: 0,
    projects: 0,
    trades: 0,
    supporters: 0,
    followers: 0,
    days_active: 365
  })
  const [loading, setLoading] = useState(true)
  const [showAnnouncement, setShowAnnouncement] = useState(true)

  useEffect(() => {
    const dismissed = localStorage.getItem('announcement_dismissed')
    if (dismissed) {
      setShowAnnouncement(false)
    }
  }, [])

  const dismissAnnouncement = () => {
    setShowAnnouncement(false)
    localStorage.setItem('announcement_dismissed', 'true')
  }

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [academic, projects, trades, supporters, followers] = await Promise.all([
        supabase.from('academic_levels').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('trades').select('*', { count: 'exact', head: true }),
        supabase.from('coffee_supporters').select('*', { count: 'exact', head: true }),
        supabase.from('followers').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        academic_levels: academic.count || 0,
        projects: projects.count || 0,
        trades: trades.count || 0,
        supporters: supporters.count || 0,
        followers: followers.count || 0,
        days_active: 365
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { value: stats.academic_levels, label: t('stats.academic'), desc: t('stats.academicDesc') },
    { value: stats.projects, label: t('stats.projects'), desc: t('stats.projectsDesc') },
    { value: stats.trades, label: t('stats.trades'), desc: t('stats.tradesDesc') },
    { value: stats.supporters, label: t('stats.supporters'), desc: t('stats.supportersDesc') },
    { value: stats.followers, label: t('stats.followers'), desc: t('stats.followersDesc') },
    { value: stats.days_active + '+', label: t('stats.daysActive'), desc: t('stats.daysActiveDesc') }
  ]

  const NewAnnouncement = () => {
    if (!showAnnouncement) return null

    return (
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#714B67] p-6 text-white rounded-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-xs uppercase tracking-wider font-medium bg-white/20 px-3 py-1 rounded">New</span>
              <div className="flex-1">
                <p className="text-xl font-medium">
                  {t('announcement.message')}
                </p>
                <p className="text-gray-200 text-lg mt-1">
                  {t('announcement.submessage')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/service" className="bg-white text-[#714B67] px-4 py-2 text-lg font-medium hover:bg-gray-100 rounded-lg transition-colors duration-200">
                {t('announcement.getMentorship')}
              </Link>
              <Link to="/hire-me" className="bg-transparent border border-white text-white px-4 py-2 text-lg font-medium hover:bg-white/10 rounded-lg transition-colors duration-200">
                {t('announcement.hireMe')}
              </Link>
              <button onClick={dismissAnnouncement} className="text-gray-200 hover:text-white transition-colors duration-200 text-lg">
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <LivingHero />
      <NewAnnouncement />
      <AboutSection />

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {statCards.map((card, index) => (
              <div key={index} className="stat-card group">
                <div className="text-3xl font-semibold text-gray-900 mb-2 group-hover:text-[#714B67] transition-colors duration-200">{card.value}</div>
                <div className="text-xs text-gray-600 mb-1">{card.label}</div>
                <div className="text-[10px] text-gray-500">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <div className="py-20 bg-gray-50">
          <SkillsMatrix />
        </div>
      </Suspense>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card group">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">{t('sections.academic.title')}</h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                {t('sections.academic.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-500">{stats.academic_levels} {t('sections.academic.levels')}</span>
                <Link to="/academic" className="text-base text-gray-600 hover:text-[#714B67] font-medium transition-colors duration-200">{t('common.view')} →</Link>
              </div>
            </div>

            <div className="card group">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">{t('sections.projects.title')}</h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                {t('sections.projects.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-500">{stats.projects} {t('sections.projects.projects')}</span>
                <Link to="/projects" className="text-base text-gray-600 hover:text-[#714B67] font-medium transition-colors duration-200">{t('common.view')} →</Link>
              </div>
            </div>

            <div className="card group">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">{t('sections.trading.title')}</h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                {t('sections.trading.description', { count: stats.trades })}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-500">{stats.trades} {t('sections.trading.trades')}</span>
                <Link to="/trading" className="text-base text-gray-600 hover:text-[#714B67] font-medium transition-colors duration-200">{t('common.view')} →</Link>
              </div>
            </div>

            <div className="card group">
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">{t('sections.community.title')}</h2>
              <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                {t('sections.community.description')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-500">{stats.supporters} {t('sections.community.supporters')}</span>
                <Link to="/community" className="text-base text-gray-600 hover:text-[#714B67] font-medium transition-colors duration-200">{t('common.visit')} →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}>
        <div className="py-20 bg-gray-50">
          <BlogsSection />
        </div>
      </Suspense>

      <Suspense fallback={null}>
        <div className="py-20 bg-white">
          <ContactForm />
        </div>
      </Suspense>
    </div>
  )
}