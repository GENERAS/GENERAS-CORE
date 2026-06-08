import { useEffect, useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import Loader from '../components/common/Loader'

// Inline SVG icons
const IconRocket = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" clipRule="evenodd" />
  </svg>
)

const IconCode = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const IconBrain = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const IconUsers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const IconShield = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const IconCpu = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
)

const IconGlobe = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)

const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const IconCheck = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

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

  const NewAnnouncement = () => {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-300 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <IconRocket className="text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">New Training Available</h2>
        </div>
        <p className="text-gray-600 mb-4 leading-relaxed">
          A new training has just been uploaded. Check it out now!
          <br />
          Limited spots available for this mentorship batch
        </p>
        <div className="flex items-center gap-3">
          <Link to="/service" className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors duration-200">
            Get Mentorship
          </Link>
          <Link to="/hire-me" className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors duration-200">
            Hire Me
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[yellow-600] rounded-xl flex items-center justify-center">
                <IconRocket className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">
                  Generas Core
                </h1>
                <p className="text-xs text-gray-600">Building Digital Systems</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <IconCode className="text-yellow-600" />
                <span className="text-gray-600">Projects:</span>
                <span className="font-semibold text-gray-800">{stats.projects}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconBrain className="text-yellow-600" />
                <span className="text-gray-600">Academic:</span>
                <span className="font-semibold text-gray-800">{stats.academic_levels}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconUsers className="text-yellow-600" />
                <span className="text-gray-600">Community:</span>
                <span className="font-semibold text-gray-800">{stats.supporters}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Mobile Quick Navigation - Only visible on mobile */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <Link to="/projects" className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <IconCode className="text-yellow-600 mb-1" />
                <span className="text-sm font-medium text-gray-800">Projects</span>
                <span className="text-xs text-gray-500">{stats.projects}</span>
              </Link>
              <Link to="/academic" className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <IconBrain className="text-yellow-600 mb-1" />
                <span className="text-sm font-medium text-gray-800">Academic</span>
                <span className="text-xs text-gray-500">{stats.academic_levels}</span>
              </Link>
              <Link to="/trading" className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <IconShield className="text-yellow-600 mb-1" />
                <span className="text-sm font-medium text-gray-800">Trading</span>
                <span className="text-xs text-gray-500">{stats.trades}</span>
              </Link>
              <Link to="/community" className="flex flex-col items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <IconUsers className="text-yellow-600 mb-1" />
                <span className="text-sm font-medium text-gray-800">Community</span>
                <span className="text-xs text-gray-500">{stats.supporters}</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Quick Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Main Navigation */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Quick Links
                </h3>
                <nav className="space-y-1">
                  {[
                    { id: 'projects', label: 'Projects', count: stats.projects, link: '/projects' },
                    { id: 'academic', label: 'Academic', count: stats.academic_levels, link: '/academic' },
                    { id: 'trading', label: 'Trading', count: stats.trades, link: '/trading' },
                    { id: 'community', label: 'Community', count: stats.supporters, link: '/community' },
                  ].map(item => (
                    <Link
                      key={item.id}
                      to={item.link}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 text-gray-600 hover:bg-gray-100"
                    >
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Followers</span>
                    <span className="font-semibold text-gray-800">{stats.followers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Days Active</span>
                    <span className="font-semibold text-gray-800">{stats.days_active}+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* HERO SECTION */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                {/* Photo Section */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-yellow-500/30 shadow-2xl">
                    <img 
                      src="/owner-photo.jpg" 
                      alt="Generas Kagiraneza" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect fill='%23fbbf24' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%231f2937'%3EAdd Your Photo%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1">
                  {/* Small Badge */}
                  <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-4 py-2 mb-6">
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
                      SOFTWARE • AI • DIGITAL SYSTEMS • EDUCATION
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    Building Digital Systems That Solve Real Problems.
                  </h1>

                  {/* Supporting Text */}
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed max-w-2xl">
                    I'm Generas Kagiraneza, founder of Generas Core.
                    <br /><br />
                    I design, build, and improve software, AI-powered solutions, and digital systems that help individuals, businesses, and communities work smarter, grow faster, and create more opportunities.
                    <br /><br />
                    From web applications and automation tools to AI systems and educational platforms, my mission is to turn ideas into scalable solutions that create real value.
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link 
                      to="/projects"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      Explore My Work <IconArrowRight />
                    </Link>
                    <Link 
                      to="/contact"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-all duration-300"
                    >
                      Let's Connect
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ANNOUNCEMENT */}
            <NewAnnouncement />

            {/* WHO I AM + WHAT I DO */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img 
                      src="/owner-photo.jpg" 
                      alt="Generas Kagiraneza" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect fill='%23fbbf24' width='160' height='160'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%231f2937'%3EPhoto%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                      <IconBrain className="text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Who I Am & What I Do</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    I am a Software Developer, AI Systems Builder, and Digital Innovator passionate about solving challenges through technology.
                    <br /><br />
                    Through Generas Core, I build software products, AI solutions, automation systems, educational platforms, and digital tools that simplify complexity and create opportunities.
                    <br /><br />
                    I believe that great systems can transform businesses, empower individuals, and shape the future.
                  </p>
                </div>
              </div>
            </div>

            {/* WHO I HELP */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <IconUsers className="text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Who I Help</h2>
              </div>
              <p className="text-gray-600 mb-4">I work with:</p>
              <ul className="space-y-3">
                {[
                  'Entrepreneurs looking to digitize and grow their businesses.',
                  'Startups building innovative products and services.',
                  'Organizations seeking efficient software and automation solutions.',
                  'Students and learners who want to develop technology and digital skills.',
                  'Individuals exploring AI, software development, and digital opportunities.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-yellow-600 mt-1"><IconCheck /></span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* WHY TRUST ME */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <IconShield className="text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Why Work With Me</h2>
              </div>
              <p className="text-gray-600 mb-4">
                I focus on building solutions that are practical, scalable, and user-centered.
                <br /><br />
                My approach combines:
              </p>
              <ul className="space-y-3">
                {['Software Engineering', 'Artificial Intelligence', 'Systems Thinking', 'Product Development', 'Continuous Learning'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-yellow-600 mt-1"><IconCheck /></span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 mt-4">
                Rather than chasing trends, I focus on understanding problems deeply and creating systems that generate long-term value.
              </p>
            </div>

            {/* WHAT I HAVE BUILT */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <IconCode className="text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">What I've Built</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Over time, I have worked on projects involving:
              </p>
              <ul className="space-y-3">
                {[
                  'Web Applications',
                  'AI-Powered Tools',
                  'Portfolio Platforms',
                  'Educational Systems',
                  'Automation Solutions',
                  'Digital Product Concepts',
                  'Financial and Trading Tools'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-yellow-600 mt-1"><IconCheck /></span>
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 mt-4">
                Each project strengthens my understanding of technology, users, and business systems.
              </p>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{stats.projects}</div>
                  <div className="text-xs text-gray-600 mt-1">Projects Built</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{stats.academic_levels}</div>
                  <div className="text-xs text-gray-600 mt-1">Levels Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{stats.trades}</div>
                  <div className="text-xs text-gray-600 mt-1">Trades Recorded</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">{stats.days_active}+</div>
                  <div className="text-xs text-gray-600 mt-1">Days Active</div>
                </div>
              </div>
            </div>

            {/* HOW I CAN HELP */}
            <div className="bg-white rounded-2xl p-6 border border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <IconRocket className="text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">How I Can Help You</h2>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'Software Development', desc: 'Building modern web applications and digital platforms.' },
                  { title: 'AI Solutions', desc: 'Developing AI-powered tools, workflows, and intelligent systems.' },
                  { title: 'Automation', desc: 'Reducing repetitive work through smart digital processes.' },
                  { title: 'Product Development', desc: 'Turning ideas into scalable digital products.' },
                  { title: 'Technology Consulting', desc: 'Helping individuals and businesses choose the right technology solutions.' }
                ].map((service, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0 mt-0.5">
                      <IconCpu className="text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{service.title}</h3>
                      <p className="text-sm text-gray-600">{service.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* THE GENERAS CORE ECOSYSTEM */}
            <div className="bg-gradient-to-br from-yellow-50 to-white rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <IconGlobe className="text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Generas Core Ecosystem</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Generas Core is built around five pillars:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Systems', desc: 'Building software that solves real-world problems.' },
                  { name: 'AI', desc: 'Creating intelligent tools and workflows.' },
                  { name: 'Capital', desc: 'Exploring digital finance and emerging technologies.' },
                  { name: 'Academy', desc: 'Sharing knowledge and empowering growth.' },
                  { name: 'Labs', desc: 'Researching, experimenting, and building the future.' }
                ].map((pillar, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-yellow-100">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-white font-bold text-sm">{pillar.name[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1">{pillar.name}</h3>
                      <p className="text-sm text-gray-600">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CLOSING STATEMENT */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Technology is not just about code.</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                It is about creating systems that improve lives, unlock opportunities, and build a better future.
                <br /><br />
                That is the mission behind Generas Core.
              </p>
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Let's Build Something Meaningful Together <IconArrowRight />
              </Link>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Stats & Quick Actions */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconCode className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.projects}</p>
                  <p className="text-xs text-gray-600">Projects</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconBrain className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.academic_levels}</p>
                  <p className="text-xs text-gray-600">Academic</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconShield className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.trades}</p>
                  <p className="text-xs text-gray-600">Trades</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconUsers className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.supporters}</p>
                  <p className="text-xs text-gray-600">Supporters</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link to="/service" className="block w-full text-center px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors duration-200">
                    Get Mentorship
                  </Link>
                  <Link to="/hire-me" className="block w-full text-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors duration-200">
                    Hire Me
                  </Link>
                  <Link to="/contact" className="block w-full text-center px-4 py-3 border border-gray-300 hover:border-yellow-400 text-gray-700 rounded-xl font-semibold transition-colors duration-200">
                    Contact
                  </Link>
                </div>
              </div>

              {/* Skills Matrix */}
              <Suspense fallback={<div className="bg-white rounded-2xl p-4 border border-gray-200">Loading...</div>}>
                <div className="bg-white rounded-2xl p-4 border border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    Skills
                  </h3>
                  <SkillsMatrix />
                </div>
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* BLOGS SECTION */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-300">
          <Suspense fallback={<div className="text-center py-8 text-gray-500">Loading blogs...</div>}>
            <BlogsSection />
          </Suspense>
        </div>
      </div>

      {/* CONTACT FORM */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-6 border border-gray-300">
          <Suspense fallback={<div className="text-center py-8 text-gray-500">Loading contact form...</div>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}