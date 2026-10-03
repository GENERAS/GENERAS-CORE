import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Loader from '../components/common/Loader'
import {
  Star, ExternalLink, Image as ImageIcon, Mic, Play, Pause,
  Building2, Globe, ArrowRight, ChevronLeft, ChevronRight,
  BadgeCheck, Quote, Sparkles, Filter, Search, X, Maximize2
} from 'lucide-react'

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 })

  useEffect(() => {
    loadTestimonials()
  }, [filter])

  const loadTestimonials = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('status', 'approved')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .order('submitted_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('project_type', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      console.error('Error loading testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAudio = (audioUrl, lang) => {
    if (playingAudio?.url === audioUrl) {
      playingAudio.audio.pause()
      setPlayingAudio(null)
      return
    }
    if (playingAudio?.audio) {
      playingAudio.audio.pause()
    }
    const audio = new Audio(audioUrl)
    audio.play()
    setPlayingAudio({ url: audioUrl, audio, lang })
    audio.onended = () => setPlayingAudio(null)
  }

  const getAllImages = (t) => {
    const imgs = []
    if (t.project_screenshot) imgs.push(t.project_screenshot)
    if (Array.isArray(t.project_screenshots)) {
      t.project_screenshots.forEach(s => { if (s && !imgs.includes(s)) imgs.push(s) })
    }
    return imgs
  }

  const openLightbox = (images, start = 0) => {
    if (images.length === 0) return
    setLightbox({ open: true, images, index: start })
  }

  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 })
  const nextImg = () => setLightbox(l => ({ ...l, index: (l.index + 1) % l.images.length }))
  const prevImg = () => setLightbox(l => ({ ...l, index: (l.index - 1 + l.images.length) % l.images.length }))

  useEffect(() => {
    if (!lightbox.open) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') nextImg()
      if (e.key === 'ArrowLeft') prevImg()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox.open])

  const filtered = testimonials.filter(t => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      t.client_name?.toLowerCase().includes(q) ||
      t.client_company?.toLowerCase().includes(q) ||
      t.project_title?.toLowerCase().includes(q) ||
      t.testimonial_text?.toLowerCase().includes(q)
    )
  })

  const categories = [
    { id: 'all', label: 'All', count: testimonials.length },
    { id: 'website', label: 'Websites', count: testimonials.filter(t => t.project_type === 'website').length },
    { id: 'web_app', label: 'Web Apps', count: testimonials.filter(t => t.project_type === 'web_app').length },
    { id: 'mobile', label: 'Mobile', count: testimonials.filter(t => t.project_type === 'mobile').length },
    { id: 'ecommerce', label: 'E-commerce', count: testimonials.filter(t => t.project_type === 'ecommerce').length },
    { id: 'branding', label: 'Branding', count: testimonials.filter(t => t.project_type === 'branding').length },
  ]

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">Trusted by growing brands</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              What My Clients <span className="text-yellow-400">Say</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-300 leading-relaxed">
              Real results from real businesses. Explore the work, hear their voices, and see the impact delivered.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-yellow-400" />
                <span>Verified testimonials</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                <span>Live project previews</span>
              </div>
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-yellow-400" />
                <span>Voice testimonials</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition ${
                    filter === cat.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                  {cat.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${filter === cat.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                      {cat.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search client, company, project..."
                className="w-full pl-9 pr-9 py-2.5 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No testimonials found</h3>
            <p className="text-gray-600">Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {filtered.map((t) => {
              const images = getAllImages(t)
              const hasVoice = t.voice_message_en || t.voice_message_rw
              const voiceUrl = t.voice_message_en || t.voice_message_rw
              const voiceLang = t.voice_message_en ? 'EN' : 'RW'

              return (
                <article
                  key={t.id}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Project preview */}
                  {images.length > 0 && (
                    <div className="relative aspect-[16/9] sm:aspect-[16/10] bg-slate-950 overflow-hidden">
                      <img
                        src={images[0]}
                        alt={`${t.project_title} screenshot`}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      {images.length > 1 && (
                        <button
                          onClick={() => openLightbox(images, 0)}
                          className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-medium hover:bg-black/80 transition shadow-lg"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          {images.length} screenshots
                        </button>
                      )}
                      {t.is_featured && (
                        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500 text-slate-900 text-xs font-semibold shadow-lg">
                          <Sparkles className="w-3.5 h-3.5" />
                          Featured
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                            {t.project_title || 'Project'}
                          </h3>
                          <BadgeCheck className="w-5 h-5 text-yellow-600 shrink-0" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                          {t.client_company && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Building2 className="w-4 h-4 shrink-0" />
                              <span className="truncate font-medium">{t.client_company}</span>
                            </div>
                          )}
                          {t.client_name && <span className="text-gray-400">— {t.client_name}</span>}
                          {t.client_position && <span className="text-gray-400">({t.client_position})</span>}
                        </div>
                        {t.project_link && (
                          <a
                            href={t.project_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-yellow-700 hover:text-yellow-800"
                          >
                            <Globe className="w-4 h-4" />
                            Visit website
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {t.rating && (
                        <div className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full bg-yellow-50 border border-yellow-200">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quote */}
                    {t.testimonial_text && (
                      <blockquote className="relative pl-5 sm:pl-6">
                        <Quote className="absolute left-0 top-0 w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 -scale-x-100" />
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-wrap break-words">
                          {t.testimonial_text}
                        </p>
                      </blockquote>
                    )}

                    {/* Voice */}
                    {hasVoice && (
                      <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            onClick={() => toggleAudio(voiceUrl, voiceLang)}
                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition shadow-sm shrink-0"
                            aria-label="Play voice testimonial"
                          >
                            {playingAudio?.url === voiceUrl ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Voice testimonial</p>
                            <p className="text-xs text-gray-500">{voiceLang === 'EN' ? 'English' : 'Kinyarwanda'}</p>
                          </div>
                        </div>
                        <Mic className="w-5 h-5 text-gray-400 shrink-0" />
                      </div>
                    )}

                    {/* Results */}
                    {((t.clients_before !== null && t.clients_after !== null) || (t.revenue_before !== null && t.revenue_after !== null)) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {t.clients_before !== null && t.clients_after !== null && (
                          <div className="p-3 rounded-xl border border-gray-200 bg-white">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Clients</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{t.clients_before}</span>
                              <ArrowRight className="w-4 h-4 text-yellow-600" />
                              <span className="text-base font-semibold text-gray-900">{t.clients_after}</span>
                            </div>
                          </div>
                        )}
                        {t.revenue_before !== null && t.revenue_after !== null && (
                          <div className="p-3 rounded-xl border border-gray-200 bg-white">
                            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Revenue</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{t.revenue_before}</span>
                              <ArrowRight className="w-4 h-4 text-yellow-600" />
                              <span className="text-base font-semibold text-gray-900">{t.revenue_after}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Links */}
                    {(t.project_link || t.demo_link || images.length > 1) && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                        {t.project_link && (
                          <a
                            href={t.project_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium transition shadow-sm"
                          >
                            <Globe className="w-4 h-4" />
                            Live site
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {t.demo_link && (
                          <a
                            href={t.demo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-700 text-xs sm:text-sm font-medium transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Demo
                          </a>
                        )}
                        {images.length > 1 && (
                          <button
                            onClick={() => openLightbox(images)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 text-gray-700 text-xs sm:text-sm font-medium transition"
                          >
                            <ImageIcon className="w-4 h-4" />
                            View all screenshots
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox.open && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 sm:p-5">
            <div className="text-white text-sm sm:text-base">
              Screenshot {lightbox.index + 1} of {lightbox.images.length}
            </div>
            <button onClick={closeLightbox} className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center px-2 sm:px-16">
            <img
              src={lightbox.images[lightbox.index]}
              alt={`Screenshot ${lightbox.index + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={prevImg}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 text-white hover:bg-yellow-500 hover:text-slate-900 transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImg}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/70 text-white hover:bg-yellow-500 hover:text-slate-900 transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          {lightbox.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto justify-center p-3 sm:p-4">
              {lightbox.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setLightbox(l => ({ ...l, index: i }))}
                  className={`w-16 h-11 sm:w-20 sm:h-14 rounded border-2 overflow-hidden shrink-0 transition ${
                    i === lightbox.index ? 'border-yellow-500' : 'border-transparent opacity-50 hover:opacity-90'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}