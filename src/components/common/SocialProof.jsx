import { useState, useEffect } from 'react'
import { TrendingUp, Users, Briefcase, Star, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { trackPageView, getAnalyticsSummary } from '../../utils/analytics'

export default function SocialProof() {
  const [counts, setCounts] = useState({
    projects: 0,
    testimonials: 0,
    mentees: 0,
    visitors: 0,
  })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    loadCounts()
    const interval = setInterval(loadCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    const el = document.getElementById('social-proof')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const loadCounts = async () => {
    try {
      const [projects, testimonials, mentees] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('testimonials').select('*', { count: 'exact', head: true }).eq('is_approved', true),
        supabase.from('mentorship_applications').select('*', { count: 'exact', head: true }).eq('payment_status', 'verified'),
      ])

      const analytics = getAnalyticsSummary()

      setCounts({
        projects: projects.count || 0,
        testimonials: testimonials.count || 0,
        mentees: mentees.count || 0,
        visitors: analytics.totalViews || 0,
      })
    } catch (err) {
      console.error('Social proof error:', err)
    }
  }

  const stats = [
    { icon: Briefcase, label: 'Projects Delivered', value: counts.projects, color: 'text-blue-500' },
    { icon: Users, label: 'Mentees Trained', value: counts.mentees, color: 'text-green-500' },
    { icon: Star, label: 'Client Reviews', value: counts.testimonials, color: 'text-yellow-500' },
    { icon: Eye, label: 'Page Views', value: counts.visitors, color: 'text-purple-500' },
  ]

  return (
    <div id="social-proof" className="py-12 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto px-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className={`text-center transition-all duration-700 ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-3 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {visible ? stat.value.toLocaleString() : '0'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
