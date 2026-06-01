import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import CommentsSection from '../components/comments/CommentsSection'

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

// Tech colors only - no icons
const getTechColor = (tech) => {
  const techLower = tech.toLowerCase()
  const colors = [
    { match: ['react', 'tailwind'], style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { match: ['next'], style: 'bg-gray-100 text-gray-700 border-gray-200' },
    { match: ['node', 'mongo'], style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { match: ['python', 'sql', 'database'], style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { match: ['javascript', 'ts'], style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { match: ['aws'], style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { match: ['docker'], style: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  ]
  
  const match = colors.find(c => c.match.some(m => techLower.includes(m)))
  return match ? match.style : 'bg-gray-100 text-gray-700 border-gray-200'
}

// Force scroll to top
const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
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

  useEffect(() => {
    loadProjects()
    
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        () => loadProjects()
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  const loadProjects = async () => {
    try {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('display_order')
      
      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

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
      completed: { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: 'Completed', icon: <IconCheck /> },
      building: { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: 'In Progress', icon: <IconRocket /> },
      planned: { bg: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: 'Planned', icon: <IconLayer /> }
    }
    const s = badges[status] || badges.planned
    return (
      <span className={`${s.bg} border px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
        {s.icon} {s.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[yellow-600]"></div>
      </div>
    )
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
            <div className="sticky top-24 space-y-4">
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
                      className="w-full h-full object-cover"
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
                  {featuredProjects.map(project => (
                    <div 
                      key={project.id}
                      className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="relative h-40 overflow-hidden">
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-yellow-100 to-yellow-100 flex items-center justify-center">
                            <IconCode className="text-4xl text-yellow-600" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1 group-hover:text-yellow-600 transition-colors duration-200 text-gray-800">{project.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Grid/List */}
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 gap-6"
              : "space-y-4"
            }>
              {filteredProjects.map(project => (
                <div 
                  key={project.id} 
                  className={`group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${viewMode === 'grid' ? '' : 'flex flex-col md:flex-row'}`}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'md:w-72 h-48 md:h-auto shrink-0' : ''}`}>
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${viewMode === 'grid' ? 'h-48' : 'h-full'}`}
                      />
                    ) : (
                      <div className={`bg-gradient-to-br from-yellow-100 to-yellow-100 flex items-center justify-center ${viewMode === 'grid' ? 'h-48' : 'h-full min-h-[200px]'}`}>
                        <IconCode className="text-5xl text-yellow-600 group-hover:text-yellow-700 transition-colors duration-200" />
                      </div>
                    )}
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(project.id)}
                      className={`absolute top-3 left-3 p-2 rounded-full transition-colors duration-200 ${favorites.includes(project.id) ? 'text-yellow-600 bg-yellow-100' : 'text-gray-600 bg-white hover:bg-gray-100'}`}
                    >
                      <IconHeart filled={favorites.includes(project.id)} />
                    </button>
                    
                    {/* Status */}
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-600 transition-colors duration-200 text-gray-800">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    {/* Tech Stack */}
                    {project.tech_stack && project.tech_stack.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1.5">
                          {project.tech_stack.slice(0, viewMode === 'grid' ? 4 : 6).map((tech, i) => {
                            const colorClass = getTechColor(tech)
                            return (
                              <span
                                key={i}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${colorClass}`}
                              >
                                {tech}
                              </span>
                            )
                          })}
                          {project.tech_stack.length > (viewMode === 'grid' ? 4 : 6) && (
                            <span className="text-xs text-gray-600 px-2 py-0.5">+{project.tech_stack.length - (viewMode === 'grid' ? 4 : 6)}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex gap-3">
                        {project.github_url && (
                          <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                          >
                            <IconGithub />
                            <span className="hidden sm:inline">Code</span>
                          </a>
                        )}
                        {project.live_demo_url && (
                          <a
                            href={project.live_demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
                          >
                            <IconExternal />
                            <span className="hidden sm:inline">Live</span>
                          </a>
                        )}
                      </div>
                      
                      {/* Views */}
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <IconEye />
                        <span>{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                    </div>
                    
                    {/* Comments - Only in grid mode */}
                    {viewMode === 'grid' && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <CommentsSection contentType="project" contentId={project.id} compact />
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
            <div className="sticky top-24 space-y-4">
              
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
    </div>
  )
}