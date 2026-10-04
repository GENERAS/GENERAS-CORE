import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import CommentsSection from '../components/comments/CommentsSection'
import ProjectLightbox from '../components/projects/ProjectLightbox'
import Loader from '../components/common/Loader'

// Simple inline SVG icons - no external libraries
const IconHeart = ({ filled }) => (
  <svg className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const IconEye = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const IconGithub = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const IconExternal = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

const IconArrowRight = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
)

const IconStar = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const IconCode = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const IconRocket = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" clipRule="evenodd" />
  </svg>
)

const IconCheck = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
)

const IconLayer = () => (
  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
  </svg>
)

const IconClose = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// Force scroll to top
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}

// Presentation layer for each project: the accent gradient doubles as the
// "type" banner so cards read like case studies instead of plain thumbnails.
const ACCENTS = [
  { match: /clinic/i, type: 'Clinic Management System', gradient: 'from-purple-500 to-pink-600' },
  { match: /duk(a|)linka|marketplace|multi-?vendor|vendor/i, type: 'Multi-Vendor Marketplace', gradient: 'from-emerald-500 to-teal-600' },
  { match: /e-?commerce|shop|store|market/i, type: 'E-commerce Platform', gradient: 'from-emerald-500 to-teal-600' },
  { match: /trading|trader|journal/i, type: 'Trading Systems', gradient: 'from-amber-500 to-orange-600' },
  { match: /lake|kivu/i, type: 'Mobile Application', gradient: 'from-cyan-500 to-blue-600' },
  { match: /portfolio|website/i, type: 'Web Application', gradient: 'from-sky-500 to-indigo-600' },
  { match: /legacy/i, type: 'Platform Rebuild', gradient: 'from-slate-500 to-slate-600' },
]

const CATEGORY_ACCENTS = {
  web: { type: 'Web Application', gradient: 'from-sky-500 to-indigo-600' },
  mobile: { type: 'Mobile Application', gradient: 'from-cyan-500 to-blue-600' },
  trading: { type: 'Trading Systems', gradient: 'from-amber-500 to-orange-600' },
  ai: { type: 'AI Solution', gradient: 'from-fuchsia-500 to-rose-600' },
}

const accentFor = (project) => {
  const title = project.title || ''
  const hit = ACCENTS.find(a => a.match.test(title))
  if (hit) return hit
  return CATEGORY_ACCENTS[project.category] || { type: 'Digital Solution', gradient: 'from-yellow-500 to-yellow-600' }
}

// Compact "read more" popup: full description + a peek at the screenshots,
// without pushing the cards on the page any taller.
function ProjectQuickView({ project, images, onClose, onOpenGallery }) {
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!project) return null
  const accent = accentFor(project)

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} details`}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className={`bg-gradient-to-br ${accent.gradient} px-5 sm:px-6 py-5 flex items-start justify-between gap-4`}>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/85">{accent.type}</p>
            <h3 className="text-2xl font-bold text-white mt-0.5 break-words">{project.title}</h3>
            <p className="text-xs text-white/85 mt-1 flex items-center gap-3 flex-wrap">
              {project.client_name && <span>Built for {project.client_name}</span>}
              <span className="inline-flex items-center gap-1"><IconEye /> {project.views ?? 0} views</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 w-9 h-9 rounded-full bg-black/25 hover:bg-black/40 text-white flex items-center justify-center transition"
          >
            <IconClose />
          </button>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 py-5">
          {images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-3 mb-4">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => onOpenGallery(i)}
                  className="shrink-0 h-24 w-36 rounded-lg overflow-hidden bg-slate-900 ring-1 ring-gray-700 hover:ring-yellow-500 transition"
                >
                  <img src={src} alt={`${project.title} screenshot ${i + 1}`} loading="lazy" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{project.description}</p>

          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tech_stack.map((tech, i) => (
                <span key={i} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">{tech}</span>
              ))}
            </div>
          )}

          {(project.github_url || project.live_demo_url) && (
            <div className="flex flex-wrap gap-4 mt-5 text-sm font-medium">
              {project.live_demo_url && (
                <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-yellow-500 hover:text-yellow-400">
                  <IconExternal /> Live demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gray-300 hover:text-yellow-500">
                  <IconGithub /> Source code
                </a>
              )}
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Questions about this system?</p>
            <CommentsSection contentType="project" contentId={project.id} compact />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 px-5 sm:px-6 py-4 border-t border-gray-800 bg-gray-900/80">
          {images.length > 0 && (
            <button
              onClick={() => onOpenGallery(0)}
              className="sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold transition-colors duration-200"
            >
              See all {images.length} screenshots <IconArrowRight />
            </button>
          )}
          <Link
            to="/contact"
            onClick={onClose}
            className={`${images.length > 0 ? 'sm:flex-1' : ''} inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-200 hover:border-yellow-500 hover:text-yellow-500 text-sm font-semibold transition-colors duration-200`}
          >
            Request a similar system
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  useScrollToTop()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('projectFavorites') || '[]')
    }
    return []
  })
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [imagesByProject, setImagesByProject] = useState({})
  const [activeProject, setActiveProject] = useState(null)
  const [quickView, setQuickView] = useState(null)

  useEffect(() => {
    loadProjects()

    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => loadProjects()
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'project_images' },
        () => loadProjects()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadProjects = async () => {
    try {
      const [{ data, error }, galleryRes] = await Promise.all([
        supabase.from('projects').select('*').order('display_order'),
        supabase.from('project_images').select('project_id, image_url').order('sort_order')
      ])

      if (error) throw error
      setProjects(data || [])

      // Group the screenshots the admin uploaded so each card can offer them.
      const grouped = {}
      ;(galleryRes.data || []).forEach(img => {
        if (!grouped[img.project_id]) grouped[img.project_id] = []
        grouped[img.project_id].push(img.image_url)
      })
      setImagesByProject(grouped)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cover first, then anything from the gallery. Falls back to the single
  // image_url so projects with no gallery rows still open.
  const imagesFor = (project) => {
    const gallery = imagesByProject[project.id] || []
    return [...new Set([project.image_url, ...gallery].filter(Boolean))]
  }

  const openProject = (project) => setActiveProject(project)

  const toggleFavorite = (projectId) => {
    const newFavorites = favorites.includes(projectId)
      ? favorites.filter(id => id !== projectId)
      : [...favorites, projectId]
    
    setFavorites(newFavorites)
    localStorage.setItem('projectFavorites', JSON.stringify(newFavorites))
  }

  const categories = ['all', ...new Set(projects.map(p => p.category))]

  const filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory)

  const featuredProjects = projects.filter(p => p.is_featured).slice(0, 3)
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'completed').length,
    live: projects.filter(p => p.live_demo_url).length,
    techs: [...new Set(projects.flatMap(p => p.tech_stack || []))].length
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40', text: 'Completed', icon: <IconCheck /> },
      building: { bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40', text: 'In Progress', icon: <IconRocket /> },
      planned: { bg: 'bg-white/10 text-gray-300 border-white/20', text: 'Planned', icon: <IconLayer /> }
    }
    const s = badges[status] || badges.planned
    return (
      <span className={`${s.bg} border px-2 py-1 rounded-full text-xs flex items-center gap-1 whitespace-nowrap backdrop-blur-sm`}>
        {s.icon} {s.text}
      </span>
    )
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-24 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[yellow-600] rounded-xl flex items-center justify-center">
                <IconCode className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">
                  Project Portfolio
                </h1>
                <p className="text-xs text-gray-600">{projects.length} projects</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <IconCheck className="text-yellow-600" />
                <span className="text-gray-600">Completed:</span>
                <span className="font-semibold text-gray-800">{stats.completed}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IconRocket className="text-yellow-600" />
                <span className="text-gray-600">Live:</span>
                <span className="font-semibold text-gray-800">{stats.live}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Sticky Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              {/* Main Navigation */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Filter
                </h3>
                <nav className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 ${
                        selectedCategory === cat 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex-1 text-left">{cat === 'all' ? 'All Projects' : cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                      <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                        {cat === 'all' ? projects.length : projects.filter(p => p.category === cat).length}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* View Toggle */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  View Mode
                </h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm transition-colors duration-200 ${viewMode === 'grid' ? 'bg-yellow-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Grid
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm transition-colors duration-200 ${viewMode === 'list' ? 'bg-yellow-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Projects</span>
                    <span className="font-semibold text-gray-800">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Technologies</span>
                    <span className="font-semibold text-gray-800">{stats.techs}+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* HERO SECTION */}
            <div className="bg-white rounded-3xl p-6 border border-gray-300">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img 
                      src="/owner-photo.jpg" 
                      alt="Generas Kagiraneza" 
                      loading="lazy" className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect fill='%23fbbf24' width='160' height='160'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%231f2937'%3EPhoto%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800">Project Portfolio</h2>
                  <p className="text-gray-600">
                    Explore my work in web development, mobile apps, trading systems, and blockchain solutions
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <IconStar className="text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-800">Featured Projects</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {featuredProjects.map(project => {
                    const shots = imagesFor(project)
                    const accent = accentFor(project)
                    return (
                    <div
                      key={project.id}
                      onClick={() => openProject(project)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openProject(project))}
                      className="group flex flex-col bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 hover:shadow-2xl hover:-translate-y-1 shadow-xl transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative h-44 bg-slate-900 overflow-hidden">
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.title} loading="lazy" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <IconCode className="text-4xl text-yellow-500" />
                          </div>
                        )}

                        <div className="absolute top-2 right-2">
                          {getStatusBadge(project.status)}
                        </div>
                        {shots.length > 1 && (
                          <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                            {shots.length} screenshots
                          </span>
                        )}
                        <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                          <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                            View project
                          </span>
                        </span>
                      </div>

                      <div className={`bg-gradient-to-br ${accent.gradient} px-5 py-4`}>
                        <div className="text-xs font-semibold uppercase tracking-wider text-white/85">{accent.type}</div>
                        <h3 className="text-xl font-bold text-white mt-0.5">{project.title}</h3>
                      </div>

                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-3">{project.description}</p>
                        <button
                          onClick={e => { e.stopPropagation(); setQuickView(project) }}
                          className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-500 hover:text-yellow-400 mb-4 transition-colors duration-200"
                        >
                          Read more <IconArrowRight />
                        </button>
                        {project.tech_stack && project.tech_stack.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.tech_stack.slice(0, 3).map((tech, i) => (
                              <span key={i} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">{tech}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    )
                  })}
                </div>
              </div>
            )}

{/* Projects Grid/List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "space-y-4"
            }>
              {filteredProjects.map(project => {
                const shots = imagesFor(project)
                const accent = accentFor(project)
                const techLimit = viewMode === 'grid' ? 4 : 6
                return (
                <div
                  key={project.id}
                  onClick={() => openProject(project)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), openProject(project))}
                  className={`group flex flex-col bg-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 hover:shadow-2xl shadow-xl transition-all duration-300 cursor-pointer ${viewMode === 'grid' ? '' : 'md:flex-row'}`}
                >
                  {/* Screenshot cover: object-contain letterboxes against the dark backdrop rather than cropping */}
                  <div className={`relative bg-slate-900 shrink-0 ${viewMode === 'list' ? 'md:w-80' : ''}`}>
                    <div className={`relative w-full overflow-hidden ${viewMode === 'list' ? 'h-56 md:h-full md:min-h-[320px]' : 'h-56'}`}>
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <IconCode className="text-5xl text-yellow-500 group-hover:text-yellow-400 transition-colors duration-200" />
                        </div>
                      )}

                      {/* Screenshot count + hover veil */}
                      {shots.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                          {shots.length} screenshots
                        </span>
                      )}
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors duration-300">
                        <span className="text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          View project
                        </span>
                      </span>
                      {shots.length === 0 && (
                        <span className="absolute left-3 right-3 bottom-3 bg-black/70 text-white/90 text-[11px] px-2 py-1.5 rounded text-center leading-snug backdrop-blur-sm">
                          No screenshots yet
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavorite(project.id) }}
                      aria-label="Favourite"
                      className={`absolute top-3 left-3 p-2 rounded-full transition-colors duration-200 ${favorites.includes(project.id) ? 'text-yellow-500 bg-yellow-500/15 ring-1 ring-yellow-400/40' : 'text-gray-300 bg-black/50 hover:bg-black/70'}`}
                    >
                      <IconHeart filled={favorites.includes(project.id)} />
                    </button>

                    {/* Status */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* Accent banner + body share one column so list mode stays readable */}
                  <div className={`flex flex-col flex-1 min-w-0 ${viewMode === 'list' ? 'md:flex-1' : ''}`}>
                  {/* Accent banner: project type + title */}
                  <div className={`bg-gradient-to-br ${accent.gradient} px-5 py-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-white/85">
                        {accent.type}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-white/90">
                        <IconEye />
                        <span>{project.views ?? 0}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mt-1">
                      {project.title}
                    </h3>
                    {project.client_name && (
                      <p className="text-xs text-white/85 mt-1">Built for {project.client_name}</p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
                      {project.description}
                    </p>

                    <button
                      onClick={e => { e.stopPropagation(); setQuickView(project) }}
                      className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-500 hover:text-yellow-400 mb-4 transition-colors duration-200"
                    >
                      Read more <IconArrowRight />
                    </button>

                    {/* Tech Stack */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {project.tech_stack.slice(0, techLimit).map((tech, i) => (
                            <span key={i} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
                              {tech}
                            </span>
                          ))}
                          {project.tech_stack.length > techLimit && (
                            <span className="text-xs text-gray-400 px-2 py-1 self-center">+{project.tech_stack.length - techLimit}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {shots.length === 0 && (
                      <p className="text-xs text-gray-400 mb-4">
                        Screenshots coming soon —{' '}
                        <Link to="/contact" onClick={e => e.stopPropagation()} className="text-yellow-500 hover:underline font-semibold">
                          contact us
                        </Link>{' '}
                        to see similar results.
                      </p>
                    )}

                    {/* Actions */}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-gray-800">
                      <div className="flex gap-4">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-yellow-500 transition-colors duration-200"
                          >
                            <IconGithub />
                            <span>Code</span>
                          </a>
                        )}
                        {project.live_demo_url && (
                          <a
                            href={project.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
                          >
                            <IconExternal />
                            <span>Live</span>
                          </a>
                        )}
                      </div>

                      {project.project_value && (
                        <span className="text-xs text-gray-400">{project.project_value}</span>
                      )}
                    </div>

                    {/* Opens the gallery viewer; the card itself stays compact */}
                    {shots.length > 0 ? (
                      <button
                        onClick={e => { e.stopPropagation(); openProject(project) }}
                        className="mt-auto w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold transition-colors duration-200"
                      >
                        View {shots.length > 1 ? `${shots.length} screenshots` : 'screenshot'} <IconArrowRight />
                      </button>
                    ) : (
                      <Link
                        to="/contact"
                        onClick={e => e.stopPropagation()}
                        className="mt-auto w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold transition-colors duration-200"
                      >
                        Request similar system <IconArrowRight />
                      </Link>
                    )}
                  </div>
                  </div>
                </div>
                )
              })}
            </div>

            {/* Empty State */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center text-3xl text-gray-600">
                  &lt;/&gt;
                </div>
                <p className="text-lg text-gray-700 mb-2">No projects found</p>
                <p className="text-sm text-gray-600 mb-4">Try selecting a different category</p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200"
                >
                  View All Projects
                </button>
              </div>
            )}

            {/* Bottom CTA */}
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-300">
              <h2 className="text-xl font-bold mb-2 text-gray-800">Have a project in mind?</h2>
              <p className="text-gray-600 mb-4">Let's build something amazing together</p>
              <Link 
                to="/hire-me"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Hire Me <IconArrowRight />
              </Link>
            </div>
          </div>

          {/* RIGHT SIDEBAR - Stats */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 space-y-4">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconCheck className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconRocket className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.live}</p>
                  <p className="text-xs text-gray-600">Live Demos</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconCode className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{stats.techs}+</p>
                  <p className="text-xs text-gray-600">Technologies</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <IconStar className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{featuredProjects.length}</p>
                  <p className="text-xs text-gray-600">Featured</p>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Completion Rate
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold text-gray-800">{stats.completed}/{stats.total}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-600 transition-all duration-300"
                        style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {quickView && (
        <ProjectQuickView
          project={quickView}
          images={imagesFor(quickView)}
          onClose={() => setQuickView(null)}
          onOpenGallery={() => {
            setActiveProject(quickView)
            setQuickView(null)
          }}
        />
      )}

      {activeProject && (
        <ProjectLightbox
          key={activeProject.id}
          project={activeProject}
          images={imagesFor(activeProject)}
          onClose={() => setActiveProject(null)}
        />
      )}
    </div>
  )
}