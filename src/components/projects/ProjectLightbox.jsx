import { useState, useEffect, useCallback } from 'react'
import {
  FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaTimes,
  FaGithub, FaExternalLinkAlt, FaInfoCircle
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
 * Full-screen project viewer.
 *
 * Two things drove the redesign.
 *
 * Size: the first version laid the image out as a flex child between a header
 * and a details panel that was open by default and capped at 45vh. On a normal
 * laptop that left the screenshot roughly 430px tall, so a 1080p capture was
 * displayed at a fraction of the size it was uploaded at. The image now takes
 * the entire viewport and every control floats above it, so nothing competes
 * with it for space. Details are a drawer that is closed until asked for.
 *
 * Legibility: object-contain everywhere. object-cover was cropping screenshots
 * to the corners of a card, hiding most of what was actually built.
 */
export default function ProjectLightbox({ project, images = [], onClose }) {
  const [index, setIndex] = useState(0)
  // Always on. The description used to sit behind an icon in the top-right
  // corner, which most visitors never found, so the write-up was effectively
  // invisible. It now overlays the bottom of the image at all times.
  const [showInfo, setShowInfo] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  const total = images.length
  const safeIndex = total ? Math.min(index, total - 1) : 0

  const go = useCallback((delta) => {
    if (!total) return
    setIndex(prev => (prev + delta + total) % total)
  }, [total])

  // Arrows step through the shots, Escape closes, I toggles the write-up and
  // Z switches between fitting the image and showing it at 100%.
  useEffect(() => {
    const onKey = (e) => {
      switch (e.key) {
        case 'ArrowRight': e.preventDefault(); go(1); break
        case 'ArrowLeft': e.preventDefault(); go(-1); break
        case 'Escape': onClose(); break
        case 'Tab':
          // Keep focus inside the viewer while it is open.
          if (!e.shiftKey && document.activeElement === document.body) go(1)
          break
        default:
          if (e.key.toLowerCase() === 'i') setShowInfo(v => !v)
          if (e.key.toLowerCase() === 'z') setZoomed(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // Stop the page scrolling behind the overlay.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [])

  if (!project) return null

  const current = images[safeIndex]
  const badge = STATUS_BADGES[project.status] || 'bg-slate-700 text-slate-200 border-slate-500'

  return (
    <div className="fixed inset-0 z-50 bg-black" role="dialog" aria-modal="true" aria-label={`${project.title} screenshots`}>
      {/* Stage: the image gets the whole viewport. Everything else floats. */}
      <div className={`absolute inset-0 flex items-center justify-center ${zoomed ? 'overflow-auto' : ''}`}>
        {current ? (
          <img
            src={current}
            alt={`${project.title} screenshot ${safeIndex + 1}`}
            className={zoomed ? 'max-w-none max-h-none' : 'max-w-full max-h-full object-contain'}
          />
        ) : (
          <div className="text-center text-gray-300 px-6 max-w-md -translate-y-16">
            <p className="text-sm mb-3">No screenshots have been published for this project yet.</p>
            <p className="text-xs text-gray-500">The full write-up is below.</p>
          </div>
        )}

        {/* Arrows sit on the image edges so they never steal width. */}
        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous screenshot"
              className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 flex items-center justify-start group"
            >
              <span className="ml-2 sm:ml-4 p-3 rounded-full bg-black/60 text-white group-hover:bg-yellow-500 group-hover:text-slate-900 transition">
                <FaChevronLeft className="text-xl" />
              </span>
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next screenshot"
              className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 flex items-center justify-end group"
            >
              <span className="mr-2 sm:mr-4 p-3 rounded-full bg-black/60 text-white group-hover:bg-yellow-500 group-hover:text-slate-900 transition">
                <FaChevronRight className="text-xl" />
              </span>
            </button>
          </>
        )}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 to-transparent p-4 sm:p-5 flex items-start justify-between gap-4 pointer-events-none">
        <div className="min-w-0 pointer-events-auto">
          <h2 className="text-lg sm:text-2xl font-bold text-white truncate">{project.title}</h2>
          <p className="text-sm text-gray-300 mt-0.5">
            {total > 0 ? `Screenshot ${safeIndex + 1} of ${total}` : 'No screenshots yet'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
          {current && (
            <button
              onClick={() => setZoomed(z => !z)}
              aria-label={zoomed ? 'Fit image to screen' : 'View at full size'}
              title={zoomed ? 'Fit to screen (Z)' : 'Full size (Z)'}
              className="p-2 rounded-lg text-gray-200 hover:text-slate-900 hover:bg-yellow-500 transition"
            >
              {zoomed ? <FiMinimize2 className="text-lg" /> : <FiMaximize2 className="text-lg" />}
            </button>
          )}
          <button
            onClick={() => setShowInfo(v => !v)}
            aria-label={showInfo ? 'Hide description' : 'Show description'}
            title={showInfo ? 'Hide description (I)' : 'Show description (I)'}
            className={`p-2 rounded-lg transition ${showInfo ? 'bg-yellow-500 text-slate-900' : 'text-gray-200 hover:text-slate-900 hover:bg-yellow-500'}`}
          >
            <FaInfoCircle className="text-lg" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-gray-200 hover:text-slate-900 hover:bg-yellow-500 transition"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      </div>

      {/* Bottom stack: thumbnails then the description, both floating over the
          image so nothing here reduces the size the screenshot is shown at. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end">
        {/* Thumbnail strip */}
        {total > 1 && (
          <div className="px-3 sm:px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto justify-start sm:justify-center">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to screenshot ${i + 1}`}
                  aria-current={i === safeIndex}
                  className={`w-16 h-11 sm:w-24 sm:h-16 rounded border-2 overflow-hidden shrink-0 transition ${
                    i === safeIndex ? 'border-yellow-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Description, permanently visible unless explicitly collapsed. */}
        <div className={`bg-gray-900/95 backdrop-blur border-t border-gray-700/70 transition-all duration-300 ${showInfo ? 'max-h-[42vh] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="overflow-y-auto px-4 sm:px-8 py-4 sm:py-5 max-w-4xl mx-auto space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badge}`}>
                {STATUS_TEXT[project.status] || project.status}
              </span>
              {project.category && (
                <span className="px-2.5 py-1 rounded-full text-xs bg-gray-800 text-gray-300 border border-gray-700">
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

            {/* Shown in full, never clamped. The collapsed state simply cuts the
                height of this panel, and the text stays scrollable inside it. */}
            {project.description && (
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                {project.description}
              </p>
            )}

            {project.tech_stack?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech, i) => (
                  <span
                    key={`${tech}-${i}`}
                    className="px-2.5 py-1 rounded-full text-xs bg-gray-800 text-gray-200 border border-gray-700"
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white transition"
                >
                  <FaGithub /> View code
                </a>
              )}
              {project.live_demo_url && (
                <a
                  href={project.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-yellow-500 hover:text-slate-900 text-sm font-medium text-white transition"
                >
                  <FaExternalLinkAlt /> Live demo
                </a>
              )}
              <button
                onClick={() => setExpanded(v => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-xs font-medium text-gray-300 hover:text-white hover:border-gray-500 transition"
              >
                {expanded ? 'Fewer details' : 'More details'}
              </button>
            </div>

            {expanded && (
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm border-t border-gray-800 pt-4">
                {project.client_name && (
                  <div><dt className="text-gray-500 text-xs">Client</dt><dd className="text-gray-200">{project.client_name}</dd></div>
                )}
                {project.project_value && (
                  <div><dt className="text-gray-500 text-xs">Value</dt><dd className="text-gray-200">{project.project_value}</dd></div>
                )}
                <div><dt className="text-gray-500 text-xs">Inquiry ID</dt><dd className="text-gray-200">{project.inquiry_id || '—'}</dd></div>
                <div>
                  <dt className="text-gray-500 text-xs">Added</dt>
                  <dd className="text-gray-200">{new Date(project.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            )}
          </div>
        </div>

          {/* Collapse control sits directly under the description rather than
              in a corner, so it is where a visitor already is looking. */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowInfo(v => !v)}
              aria-label={showInfo ? 'Hide description' : 'Show description'}
              title={showInfo ? 'Hide description (I)' : 'Show description (I)'}
              className="flex items-center gap-1.5 px-5 py-2 rounded-t-xl bg-gray-800/95 hover:bg-gray-700 text-xs font-medium text-gray-200 transition"
            >
              {showInfo ? (
                <>Hide description <FaChevronDown className="text-xs" /></>
              ) : (
                <><FaChevronUp className="text-xs" /> Show description</>
              )}
            </button>
          </div>
      </div>
    </div>
  )
}