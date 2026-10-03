import { useState, useEffect, useCallback } from 'react'
import {
  FaChevronLeft, FaChevronRight, FaTimes, FaGithub, FaExternalLinkAlt,
  FaInfoCircle, FaBookOpen
} from 'react-icons/fa'
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi'

const STATUS_BADGES = {
  completed: 'bg-green-500/20 text-green-300 border-green-500/40',
  building: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  planned: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
}

const STATUS_TEXT = {
  completed: 'Completed',
  building: 'In progress',
  planned: 'Planned'
}

/**
 * Full-screen project gallery with a dedicated description modal.
 *
 * The previous bottom overlay crowded the screenshot and hid details behind
 * a toggle. This keeps the image completely unobstructed, gives large,
 * obvious arrow navigation (< and >), shows every uploaded screenshot, and
 * presents the full description in a clean, scrollable modal.
 */
export default function ProjectLightbox({ project, images = [], onClose }) {
  const [index, setIndex] = useState(0)
  const [showDesc, setShowDesc] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const total = images.length
  const safeIndex = total ? Math.min(index, total - 1) : 0

  const go = useCallback((delta) => {
    if (!total) return
    setIndex(prev => (prev + delta + total) % total)
  }, [total])

  useEffect(() => {
    const onKey = (e) => {
      // Close description modal first, else close viewer
      if (showDesc) {
        if (e.key === 'Escape') { e.preventDefault(); setShowDesc(false) }
        return
      }

      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); go(1); break
        case 'ArrowLeft': e.preventDefault(); go(-1); break
        case 'Escape': e.preventDefault(); onClose(); break
        case 'd': case 'D': setShowDesc(true); break
        case 'z': case 'Z': setZoomed(z => !z); break
        default: break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose, showDesc])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  if (!project) return null

  const current = images[safeIndex]
  const badge = STATUS_BADGES[project.status] || 'bg-slate-700 text-slate-200 border-slate-500'

  return (
    <>
      {/* Main screenshot viewer with split layout: left = screenshots, right = description */}
      <div className="fixed inset-0 z-50 bg-gray-950" role="dialog" aria-modal="true" aria-label={`${project.title} gallery`}>
        <div className="absolute inset-0 flex flex-col lg:flex-row">
          {/* Left: Screenshots */}
          <div className="relative flex-1 h-1/2 lg:h-full bg-black">
            <div className={`absolute inset-0 flex items-center justify-center ${zoomed ? 'overflow-auto' : ''}`}>
              {current ? (
                <img
                  src={current}
                  alt={`${project.title} screenshot ${safeIndex + 1}`}
                  className={zoomed ? 'max-w-none max-h-none' : 'max-w-full max-h-full object-contain'}
                />
              ) : (
                <div className="text-center text-gray-400 px-6 max-w-md">
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">{project.title}</h3>
                  <p className="text-sm">No screenshots have been published for this project yet.</p>
                </div>
              )}

              {total > 1 && (
                <>
                  <button
                    onClick={() => go(-1)}
                    aria-label="Previous screenshot (←)"
                    title="Previous (←)"
                    className="absolute left-0 top-0 bottom-0 w-16 sm:w-20 flex items-center justify-start group"
                  >
                    <span className="ml-2 sm:ml-3 p-3 rounded-full bg-black/70 text-white group-hover:bg-yellow-500 group-hover:text-slate-900 shadow-lg transition">
                      <FaChevronLeft className="text-xl sm:text-2xl" />
                    </span>
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Next screenshot (→)"
                    title="Next (→)"
                    className="absolute right-0 top-0 bottom-0 w-16 sm:w-20 flex items-center justify-end group"
                  >
                    <span className="mr-2 sm:mr-3 p-3 rounded-full bg-black/70 text-white group-hover:bg-yellow-500 group-hover:text-slate-900 shadow-lg transition">
                      <FaChevronRight className="text-xl sm:text-2xl" />
                    </span>
                  </button>
                </>
              )}

              {/* Count overlay */}
              {total > 0 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 text-gray-200 text-xs font-medium shadow-lg">
                  {safeIndex + 1} / {total}
                </div>
              )}

              {/* Zoom */}
              {current && (
                <button
                  onClick={() => setZoomed(z => !z)}
                  aria-label={zoomed ? 'Fit to screen (Z)' : 'Full size (Z)'}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/70 text-gray-100 hover:text-slate-900 hover:bg-yellow-500 text-xs font-medium transition shadow-lg"
                >
                  {zoomed ? <FiMinimize2 /> : <FiMaximize2 />}
                  <span className="hidden sm:inline">{zoomed ? 'Fit' : 'Full size'}</span>
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {total > 1 && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 to-transparent px-3 sm:px-4 py-3">
                <div className="flex gap-2 overflow-x-auto justify-start sm:justify-center">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      onClick={() => setIndex(i)}
                      aria-label={`Go to screenshot ${i + 1}`}
                      aria-current={i === safeIndex}
                      className={`w-16 h-11 sm:w-20 sm:h-14 rounded border-2 overflow-hidden shrink-0 transition shadow-lg ${
                        i === safeIndex ? 'border-yellow-500 scale-105' : 'border-transparent opacity-60 hover:opacity-90'
                      }`}
                    >
                      <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Description panel (modal-like, but side-by-side) */}
          <div className="relative w-full lg:w-[480px] xl:w-[560px] h-1/2 lg:h-full flex flex-col bg-gray-950 border-t lg:border-t-0 lg:border-l border-gray-800/80">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-gray-800/80 bg-gradient-to-b from-gray-950 to-gray-950/95">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-white line-clamp-2">{project.title}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge}`}>
                    {STATUS_TEXT[project.status] || project.status}
                  </span>
                  {project.category && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs bg-gray-900 text-gray-300 border border-gray-800/80">
                      {project.category}
                    </span>
                  )}
                  {project.start_date && (
                    <span className="text-xs text-gray-400">
                      {new Date(project.start_date).getFullYear()}
                      {project.end_date ? ` - ${new Date(project.end_date).getFullYear()}` : ' - present'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close gallery (Esc)"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900/80 transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {project.description && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    About this project
                  </h3>
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {project.description}
                  </p>
                </div>
              )}

              {project.tech_stack?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Built with
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, i) => (
                      <span
                        key={`${tech}-${i}`}
                        className="px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-900/90 text-gray-200 border border-gray-800/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(project.client_name || project.project_value || project.inquiry_id || project.created_at) && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Project details
                  </h3>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {project.client_name && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Client</dt>
                        <dd className="text-gray-200 mt-0.5">{project.client_name}</dd>
                      </div>
                    )}
                    {project.project_value && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Value</dt>
                        <dd className="text-gray-200 mt-0.5">{project.project_value}</dd>
                      </div>
                    )}
                    {project.inquiry_id && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Inquiry ID</dt>
                        <dd className="text-gray-200 mt-0.5">{project.inquiry_id}</dd>
                      </div>
                    )}
                    {project.created_at && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Added</dt>
                        <dd className="text-gray-200 mt-0.5">
                          {new Date(project.created_at).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {(project.github_url || project.live_demo_url) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900/95 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white border border-gray-800/80 transition shadow-sm"
                    >
                      <FaGithub /> View code
                    </a>
                  )}
                  {project.live_demo_url && (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900/95 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white border border-gray-800/80 transition shadow-sm"
                    >
                      <FaExternalLinkAlt /> Live demo
                    </a>
                  )}
                </div>
              )}

              {total > 0 && (
                <p className="text-xs text-gray-500 pt-2">
                  Use ← and → to navigate screenshots • Press Z to toggle full size • Esc to close
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description modal */}
      {showDesc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} project details`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDesc(false)
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[95vh] bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-gray-800 bg-gray-950/95">
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-white truncate">{project.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badge}`}>
                    {STATUS_TEXT[project.status] || project.status}
                  </span>
                  {project.category && (
                    <span className="px-2.5 py-1 rounded-full text-xs bg-gray-900 text-gray-300 border border-gray-800">
                      {project.category}
                    </span>
                  )}
                  {project.start_date && (
                    <span className="text-xs text-gray-400">
                      {new Date(project.start_date).getFullYear()}
                      {project.end_date ? ` - ${new Date(project.end_date).getFullYear()}` : ' - present'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowDesc(false)}
                aria-label="Close description modal (Esc)"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Full description */}
              {project.description && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    About this project
                  </h4>
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Tech stack */}
              {project.tech_stack?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Built with
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tech_stack.map((tech, i) => (
                      <span
                        key={`${tech}-${i}`}
                        className="px-3 py-1 rounded-full text-xs sm:text-sm bg-gray-900 text-gray-200 border border-gray-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project details */}
              {(project.client_name || project.project_value || project.inquiry_id || project.created_at) && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Project details
                  </h4>
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {project.client_name && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Client</dt>
                        <dd className="text-gray-200 mt-0.5">{project.client_name}</dd>
                      </div>
                    )}
                    {project.project_value && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Project value</dt>
                        <dd className="text-gray-200 mt-0.5">{project.project_value}</dd>
                      </div>
                    )}
                    {project.inquiry_id && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Inquiry ID</dt>
                        <dd className="text-gray-200 mt-0.5">{project.inquiry_id}</dd>
                      </div>
                    )}
                    {project.created_at && (
                      <div>
                        <dt className="text-gray-500 text-xs uppercase tracking-wide">Added</dt>
                        <dd className="text-gray-200 mt-0.5">
                          {new Date(project.created_at).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Links */}
              {(project.github_url || project.live_demo_url) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white border border-gray-800 transition"
                    >
                      <FaGithub /> View source code
                    </a>
                  )}
                  {project.live_demo_url && (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white border border-gray-800 transition"
                    >
                      <FaExternalLinkAlt /> Live demo
                    </a>
                  )}
                </div>
              )}

              {/* Screenshots count */}
              {total > 0 && (
                <div className="text-xs text-gray-500 border-t border-gray-900 pt-4">
                  {total} screenshot{total === 1 ? '' : 's'} • Use ← and → in the gallery to navigate
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-5 sm:p-6 border-t border-gray-800 bg-gray-950/95 flex justify-end">
              <button
                onClick={() => setShowDesc(false)}
                className="px-5 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-sm font-semibold transition"
              >
                Back to screenshots
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}