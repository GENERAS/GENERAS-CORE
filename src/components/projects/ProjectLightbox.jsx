import { useState, useEffect, useCallback } from 'react'
import { FaChevronLeft, FaChevronRight, FaTimes, FaGithub, FaExternalLinkAlt } from 'react-icons/fa'

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
 * Full-screen project viewer.
 *
 * The portfolio previously showed only projects.image_url with the description
 * clamped to two lines, so anything the admin uploaded into project_images was
 * invisible to visitors and the write-up could not be read in full. This opens
 * on click and steps through every screenshot with the arrow buttons or the
 * keyboard.
 */
export default function ProjectLightbox({ project, images = [], onClose }) {
  const [index, setIndex] = useState(0)
  const [showInfo, setShowInfo] = useState(true)

  const total = images.length
  const safeIndex = total ? Math.min(index, total - 1) : 0

  const go = useCallback((delta) => {
    if (!total) return
    setIndex(prev => (prev + delta + total) % total)
  }, [total])

  // Arrow keys move between screenshots, Escape closes. Without this the only
  // way to reach the later images was the small on-screen chevrons.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
      else if (e.key === 'Escape') onClose()
      else if (e.key.toLowerCase() === 'i') setShowInfo(v => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose, total])

  // Stop the page behind the overlay from scrolling underneath it.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  // Reset when a different project is opened. ProjectsPage passes a key based
  // on the project id, so React remounts this and the state starts fresh.
  if (!project) return null

  const current = images[safeIndex]
  const badge = STATUS_BADGES[project.status] || 'bg-slate-700 text-slate-200 border-slate-500'

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} screenshots`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-4 sm:p-5 shrink-0">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{project.title}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {total > 0
              ? `Screenshot ${safeIndex + 1} of ${total}`
              : 'No screenshots uploaded yet'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {total > 1 && (
            <span className="hidden sm:inline text-xs text-gray-400 border border-gray-700 rounded px-2 py-1">
              ← → to browse · Esc to close
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16">
        {current ? (
          <img
            src={current}
            alt={`${project.title} screenshot ${safeIndex + 1}`}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <div className="text-center text-gray-500 px-6">
            <p className="text-lg mb-1">No screenshots for this project yet.</p>
            <p className="text-sm">An admin can add them from Admin → Projects.</p>
          </div>
        )}

        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 text-white hover:bg-yellow-500 hover:text-slate-900 transition"
            >
              <FaChevronLeft className="text-xl" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 text-white hover:bg-yellow-500 hover:text-slate-900 transition"
            >
              <FaChevronRight className="text-xl" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3 sm:p-4 shrink-0 justify-start sm:justify-center">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              aria-label={`Go to screenshot ${i + 1}`}
              aria-current={i === safeIndex}
              className={`w-16 h-11 sm:w-20 sm:h-14 rounded border-2 overflow-hidden shrink-0 transition ${
                i === safeIndex ? 'border-yellow-500' : 'border-transparent opacity-50 hover:opacity-90'
              }`}
            >
              <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Full details: the description is shown in full here, not clamped */}
      <div className="shrink-0 border-t border-gray-800 bg-gray-900/95 max-h-[45vh] overflow-y-auto">
        <button
          onClick={() => setShowInfo(v => !v)}
          className="w-full flex items-center justify-between px-4 sm:px-6 py-3 text-left"
        >
          <span className="text-sm font-semibold text-white">Project details</span>
          <span className="text-xs text-gray-400">{showInfo ? 'Hide' : 'Show'}</span>
        </button>

        {showInfo && (
          <div className="px-4 sm:px-6 pb-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge}`}>
                {STATUS_TEXT[project.status] || project.status}
              </span>
              {project.category && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300 border border-gray-700">
                  {project.category}
                </span>
              )}
            </div>

            {/* Whitespace preserved so pasted paragraphs keep their breaks. */}
            {project.description && (
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {project.description}
              </p>
            )}

            {project.tech_stack?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech, i) => (
                  <span
                    key={`${tech}-${i}`}
                    className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300 border border-gray-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white transition"
                >
                  <FaGithub /> View code
                </a>
              )}
              {project.live_demo_url && (
                <a
                  href={project.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white transition"
                >
                  <FaExternalLinkAlt /> Live demo
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}