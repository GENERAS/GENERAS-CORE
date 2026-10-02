import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  FaEdit, FaTrash, FaSave, FaTimes, FaGithub, FaExternalLinkAlt,
  FaUpload, FaLink, FaArrowUp, FaArrowDown, FaImages
} from 'react-icons/fa'

const BUCKET = 'project-images'

const EMPTY_FORM = {
  title: '',
  category: 'web',
  description: '',
  github_url: '',
  live_demo_url: '',
  tech_stack: [],
  image_url: '',
  status: 'building',
  display_order: 1
}

// Inputs used to sit at bg-slate-700 on a bg-slate-800 panel, one shade
// apart, with no border and no labels, so the form read as a flat grey
// block. These are deliberately high contrast: visible border, brighter
// surface than the panel behind it, and a labelled wrapper everywhere.
const inputCls =
  'w-full bg-slate-800 border-2 border-slate-500 rounded-lg px-3 py-2.5 text-white ' +
  'placeholder-slate-400 outline-none transition-colors focus:border-yellow-400 ' +
  'focus:ring-2 focus:ring-yellow-400/40'
const labelCls = 'block text-sm font-semibold text-slate-200 mb-1.5'
const panelCls = 'bg-slate-900 border-2 border-slate-700 rounded-xl p-5'

const safeFileName = (name) =>
  name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(-80)

const uniquePath = (fileName) => {
  const rand = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
  return `${Date.now()}-${rand}-${safeFileName(fileName)}`
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [imagesByProject, setImagesByProject] = useState({})
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [images, setImages] = useState([])
  const [urlInput, setUrlInput] = useState('')
  const [techInput, setTechInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })

  useEffect(() => { loadProjects() }, [])

  const flash = (type, text) => {
    setNotice({ type, text })
    if (type !== 'error') setTimeout(() => setNotice({ type: '', text: '' }), 4000)
  }

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase.from('projects').select('*').order('display_order')
      if (error) throw error
      setProjects(data || [])

      // Gallery counts + thumbnails for the list view.
      const { data: gallery } = await supabase
        .from('project_images')
        .select('project_id, image_url')
        .order('sort_order')
      const grouped = {}
      ;(gallery || []).forEach(img => {
        if (!grouped[img.project_id]) grouped[img.project_id] = []
        grouped[img.project_id].push(img.image_url)
      })
      setImagesByProject(grouped)
    } catch (err) {
      flash('error', 'Could not load projects: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setNotice({ type: '', text: '' })

    // Only the columns the form owns. Previously the whole row was spread
    // into the update, which sent id, created_at and views back as well.
    const projectData = {
      title: form.title.trim(),
      category: form.category,
      description: form.description,
      github_url: form.github_url || null,
      live_demo_url: form.live_demo_url || null,
      tech_stack: form.tech_stack.filter(t => t.trim() !== ''),
      image_url: form.image_url || images[0]?.image_url || null,
      status: form.status,
      display_order: Number(form.display_order) || 1
    }

    try {
      let projectId = editing

      if (editing) {
        const { error } = await supabase.from('projects').update(projectData).eq('id', editing)
        if (error) throw error
      } else {
        const { data, error } = await supabase.from('projects').insert([projectData]).select('id').single()
        if (error) throw error
        projectId = data.id
      }

      // Sync the gallery: insert anything new, drop anything removed.
      // Existing rows are left alone so their ids and sort_order are stable.
      const keptIds = images.filter(i => i.id).map(i => i.id)
      const { data: existing } = await supabase
        .from('project_images').select('id').eq('project_id', projectId)
      const removed = (existing || []).filter(row => !keptIds.includes(row.id)).map(row => row.id)
      if (removed.length) await supabase.from('project_images').delete().in('id', removed)

      const additions = images
        .filter(i => !i.id)
        .map((i, idx) => ({
          project_id: projectId,
          image_url: i.image_url,
          caption: i.caption || null,
          sort_order: keptIds.length + idx
        }))
      if (additions.length) {
        const { error } = await supabase.from('project_images').insert(additions)
        if (error) throw error
      }

      flash('success', editing ? 'Project updated' : 'Project added')
      resetForm()
      loadProjects()
    } catch (err) {
      flash('error', 'Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (project) => {
    setEditing(project.id)
    setForm({
      title: project.title || '',
      category: project.category || 'web',
      description: project.description || '',
      github_url: project.github_url || '',
      live_demo_url: project.live_demo_url || '',
      tech_stack: project.tech_stack || [],
      image_url: project.image_url || '',
      status: project.status || 'building',
      display_order: project.display_order ?? 1
    })
    setTechInput('')
    setUrlInput('')

    const { data: gallery } = await supabase
      .from('project_images').select('*').eq('project_id', project.id).order('sort_order')
    setImages(gallery || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all of its screenshots?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) return flash('error', 'Delete failed: ' + error.message)
    if (editing === id) resetForm()
    flash('success', 'Project deleted')
    loadProjects()
  }

  // Upload screenshots from the admin's own machine.
  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        flash('error', `${file.name} is not an image`)
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        flash('error', `${file.name} is over 5MB`)
        continue
      }

      // Compute the object path once. uniquePath is randomised, so calling
      // it again for getPublicUrl would produce a URL pointing at a
      // different, non-existent object.
      const path = uniquePath(file.name)

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false })

      if (error) {
        flash('error', `Upload failed for ${file.name}: ${error.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
      setImages(prev => [...prev, { image_url: publicUrl, caption: '' }])
    }

    setUploading(false)
    e.target.value = ''
  }

  const addImageByUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) {
      return flash('error', 'That does not look like a URL. It should start with http:// or https://')
    }
    setImages(prev => [...prev, { image_url: url, caption: '' }])
    setUrlInput('')
  }

  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index))

  const moveImage = (index, direction) => {
    setImages(prev => {
      const target = index + direction
      if (target < 0 || target >= prev.length) return prev
      const copy = [...prev]
      ;[copy[index], copy[target]] = [copy[target], copy[index]]
      return copy
    })
  }

  const addTech = () => {
    const tech = techInput.trim()
    if (tech && !form.tech_stack.includes(tech)) {
      setForm({ ...form, tech_stack: [...form.tech_stack, tech] })
    }
    setTechInput('')
  }

  const removeTech = (tech) => setForm({ ...form, tech_stack: form.tech_stack.filter(t => t !== tech) })

  const resetForm = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImages([])
    setTechInput('')
    setUrlInput('')
    setNotice({ type: '', text: '' })
  }

  const getStatusBadge = (status) => {
    const badges = { completed: 'bg-green-500/20 text-green-300 border border-green-500/40', building: 'bg-amber-500/20 text-amber-300 border border-amber-500/40', planned: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' }
    return `px-2 py-0.5 rounded-full text-xs font-medium ${badges[status] || 'bg-slate-700 text-slate-200 border border-slate-500'}`
  }

  if (loading) return <div className="text-center py-8 text-slate-300">Loading projects...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-white">Projects Manager</h2>
        {editing && (
          <span className="text-sm text-amber-300 font-medium">
            Editing: {form.title || 'untitled'}
          </span>
        )}
      </div>

      {notice.text && (
        <div className={`mb-4 px-4 py-3 rounded-lg font-medium border-2 ${
          notice.type === 'error'
            ? 'bg-red-500/15 text-red-200 border-red-500/50'
            : 'bg-green-500/15 text-green-200 border-green-500/50'
        }`}>
          {notice.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${panelCls} mb-6 space-y-5`}>
        <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-3">
          {editing ? 'Update project' : 'Add a project'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-title" className={labelCls}>Project title *</label>
            <input id="p-title" type="text" placeholder="e.g. Rwanda Bus Tickets" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} required />
          </div>
          <div>
            <label htmlFor="p-category" className={labelCls}>Category</label>
            <select id="p-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
              <option value="web">Web Application</option>
              <option value="mobile">Mobile App</option>
              <option value="blockchain">Blockchain</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="p-desc" className={labelCls}>Description *</label>
          <textarea id="p-desc" placeholder="What does this project do, and what was your role?" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls} rows="4" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-gh" className={labelCls}>GitHub URL</label>
            <input id="p-gh" type="url" placeholder="https://github.com/..." value={form.github_url}
              onChange={e => setForm({ ...form, github_url: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label htmlFor="p-demo" className={labelCls}>Live demo URL</label>
            <input id="p-demo" type="url" placeholder="https://example.com" value={form.live_demo_url}
              onChange={e => setForm({ ...form, live_demo_url: e.target.value })} className={inputCls} />
          </div>
        </div>

        {/* Tech stack */}
        <div>
          <label htmlFor="p-tech" className={labelCls}>Tech stack</label>
          <div className="flex gap-2">
            <input id="p-tech" type="text" value={techInput} onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
              placeholder="React, Tailwind, Supabase..." className={inputCls} />
            <button type="button" onClick={addTech} className="shrink-0 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-semibold px-5 rounded-lg transition-colors">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {form.tech_stack.length === 0 && <span className="text-sm text-slate-400">Nothing added yet</span>}
            {form.tech_stack.map(tech => (
              <span key={tech} className="bg-slate-800 border border-slate-600 text-slate-100 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {tech}
                <button type="button" onClick={() => removeTech(tech)} aria-label={`Remove ${tech}`} className="text-red-400 hover:text-red-300">
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Cover image */}
        <div>
          <label htmlFor="p-cover" className={labelCls}>Cover image URL</label>
          <input id="p-cover" type="url" placeholder="Shown as the project thumbnail. Leave blank to use the first screenshot."
            value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className={inputCls} />
          {form.image_url && (
            <img src={form.image_url} alt="Cover preview" className="mt-3 h-28 rounded-lg border-2 border-slate-600 object-cover" />
          )}
        </div>

        {/* Screenshots: upload from this computer, or paste a URL */}
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 bg-slate-800/40">
          <label className={labelCls}>Screenshots</label>

          <div className="flex flex-col sm:flex-row gap-3">
            <label htmlFor="p-upload"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-800 border-2 border-slate-500 text-white font-semibold hover:border-yellow-400 hover:bg-slate-700 transition-colors cursor-pointer">
              <FaUpload />
              {uploading ? 'Uploading...' : 'Upload from this computer (multiple)'}
            </label>
            <input id="p-upload" type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" disabled={uploading} />
          </div>

          <div className="flex gap-2 mt-3">
            <input type="url" value={urlInput} onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageByUrl())}
              placeholder="...or paste an image URL and press Add" className={inputCls} />
            <button type="button" onClick={addImageByUrl} className="shrink-0 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 text-white font-semibold px-5 rounded-lg transition-colors">
              <FaLink /> Add
            </button>
          </div>

          <p className="text-sm text-slate-400 mt-2">JPEG, PNG, WebP or GIF up to 5MB each. First image becomes the cover if no cover URL is set.</p>

          {images.length === 0 ? (
            <p className="text-sm text-slate-400 mt-4 flex items-center gap-2"><FaImages /> No screenshots attached yet.</p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
              {images.map((img, index) => (
                <li key={img.id || `${img.image_url}-${index}`}
                  className="bg-slate-900 border-2 border-slate-600 rounded-lg overflow-hidden relative group">
                  <img src={img.image_url} alt={img.caption || `Screenshot ${index + 1}`}
                    className="w-full h-24 object-cover" />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-yellow-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded">First</span>
                  )}
                  <div className="p-1.5 flex items-center justify-between gap-1">
                    <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0}
                      aria-label="Move earlier" className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300">
                      <FaArrowUp />
                    </button>
                    <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1}
                      aria-label="Move later" className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300">
                      <FaArrowDown />
                    </button>
                    <button type="button" onClick={() => removeImage(index)}
                      aria-label="Remove screenshot" className="p-1 rounded hover:bg-red-500/20 text-red-400">
                      <FaTrash />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="p-status" className={labelCls}>Status</label>
            <select id="p-status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
              <option value="building">🚧 Building</option>
              <option value="completed">✓ Completed</option>
              <option value="planned">📅 Planned</option>
            </select>
          </div>
          <div>
            <label htmlFor="p-order" className={labelCls}>Display order</label>
            <input id="p-order" type="number" min="1" placeholder="1" value={form.display_order}
              onChange={e => setForm({ ...form, display_order: e.target.value })} className={inputCls} />
            <p className="text-sm text-slate-400 mt-1">Lower numbers appear first.</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-slate-900 font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
            <FaSave /> {saving ? 'Saving...' : editing ? 'Update project' : 'Add project'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
              <FaTimes /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* Projects list */}
      <div className="space-y-3">
        {projects.map(project => {
          const shots = imagesByProject[project.id] || []
          return (
            <div key={project.id} className="bg-slate-900 border-2 border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
              {project.image_url ? (
                <img src={project.image_url} alt={project.title} className="w-full sm:w-28 h-20 rounded-lg object-cover border-2 border-slate-600 shrink-0" />
              ) : (
                <div className="w-full sm:w-28 h-20 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 shrink-0">
                  <FaImages />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-white text-lg">{project.title}</span>
                  <span className={getStatusBadge(project.status)}>{project.status}</span>
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  {project.tech_stack?.join(', ') || <span className="text-slate-500">No tech stack</span>}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {project.github_url && <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-yellow-400 underline"><FaGithub className="inline mr-1" /> GitHub</a>}
                  {project.live_demo_url && <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-slate-300 hover:text-yellow-400 underline"><FaExternalLinkAlt className="inline mr-1" /> Demo</a>}
                </div>
                {shots.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      {shots.slice(0, 5).map((src, i) => (
                        <img key={i} src={src} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-slate-700" />
                      ))}
                    </div>
                    <span className="text-sm text-slate-400">
                      {shots.length} screenshot{shots.length === 1 ? '' : 's'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleEdit(project)} aria-label={`Edit ${project.title}`}
                  className="px-3 py-2 rounded-lg bg-slate-800 border-2 border-slate-600 text-yellow-400 hover:border-yellow-400 transition-colors">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(project.id)} aria-label={`Delete ${project.title}`}
                  className="px-3 py-2 rounded-lg bg-slate-800 border-2 border-slate-600 text-red-400 hover:border-red-400 transition-colors">
                  <FaTrash />
                </button>
              </div>
            </div>
          )
        })}
        {projects.length === 0 && (
          <p className="text-slate-400 text-center py-8">No projects yet. Add your first one above.</p>
        )}
      </div>
    </div>
  )
}