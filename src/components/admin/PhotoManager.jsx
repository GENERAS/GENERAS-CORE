import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaLock } from 'react-icons/fa'
import ImageUploader, {
  inputCls, labelCls, panelCls, btnPrimary, btnGhost, Notice, pickFields, deleteStoredFiles
} from './AdminUI'

const BUCKET = 'photos'

const EMPTY_FORM = {
  title: '',
  description: '',
  image_url: '',
  thumbnail_url: '',
  gallery_images: [],
  album_id: null,
  is_premium: false
}

// id, likes and created_at are server-owned. Previously handleEdit copied the
// whole row into form state and sent it straight back on update, so a stale
// likes value in state could overwrite the real counter.
const FORM_FIELDS = ['title', 'description', 'image_url', 'thumbnail_url', 'album_id', 'is_premium']

export default function PhotoManager() {
  const [photos, setPhotos] = useState([])
  const [albums, setAlbums] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [albumForm, setAlbumForm] = useState({ name: '', description: '' })
  const [showAlbumForm, setShowAlbumForm] = useState(false)
  const [albumFilter, setAlbumFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })

  const flash = (type, text) => {
    setNotice({ type, text })
    if (type !== 'error') setTimeout(() => setNotice({ type: '', text: '' }), 4000)
  }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [photosRes, albumsRes] = await Promise.all([
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('photo_albums').select('*').order('name')
      ])
      if (photosRes.error) throw photosRes.error
      setPhotos(photosRes.data || [])
      setAlbums(albumsRes.data || [])
    } catch (err) {
      flash('error', 'Could not load photos: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // The main image and the extra gallery images are two columns but behave
  // as one ordered list, so they are edited as one list and split on save.
  const imageList = [
    ...(form.image_url ? [form.image_url] : []),
    ...(form.gallery_images || [])
  ]

  const setImageList = (list) => {
    setForm(prev => ({
      ...prev,
      image_url: list[0] || '',
      gallery_images: list.slice(1)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) return flash('error', 'Please enter a title')
    if (!form.image_url) return flash('error', 'Please add at least one image')

    setSaving(true)
    setNotice({ type: '', text: '' })

    const payload = {
      ...pickFields(form, FORM_FIELDS),
      title: form.title.trim(),
      description: form.description.trim(),
      album_id: form.album_id ? Number(form.album_id) : null,
      is_premium: !!form.is_premium,
      gallery_images: form.gallery_images || []
    }

    try {
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('photos').update(payload).eq('id', editing)
        if (error) throw error
        flash('success', 'Photo updated')
      } else {
        const { error } = await supabase.from('photos').insert([payload])
        if (error) throw error
        flash('success', 'Photo added')
      }
      resetForm()
      loadData()
    } catch (err) {
      flash('error', 'Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateAlbum = async (e) => {
    e.preventDefault()
    const name = albumForm.name.trim()
    if (!name) return flash('error', 'Please enter an album name')

    const { error } = await supabase.from('photo_albums').insert([{
      name,
      description: albumForm.description.trim()
    }])
    if (error) return flash('error', 'Could not create album: ' + error.message)

    setShowAlbumForm(false)
    setAlbumForm({ name: '', description: '' })
    loadData()
  }

  const handleEdit = (photo) => {
    setEditing(photo.id)
    setForm({
      title: photo.title || '',
      description: photo.description || '',
      image_url: photo.image_url || '',
      thumbnail_url: photo.thumbnail_url || '',
      gallery_images: photo.gallery_images || [],
      album_id: photo.album_id ?? null,
      is_premium: !!photo.is_premium
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (photo) => {
    if (!confirm(`Delete "${photo.title}"? Its stored image files are removed too.`)) return

    // Drop the stored files first, while we still have their URLs. If the row
    // delete fails the files can be re-uploaded; the reverse would orphan them.
    await deleteStoredFiles([photo.image_url, photo.thumbnail_url, ...(photo.gallery_images || [])])

    const { error } = await supabase.from('photos').delete().eq('id', photo.id)
    if (error) return flash('error', 'Delete failed: ' + error.message)

    if (editing === photo.id) resetForm()
    flash('success', 'Photo deleted')
    loadData()
  }

  const resetForm = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setNotice({ type: '', text: '' })
  }

  if (loading) return <div className="text-white">Loading photos...</div>

  const visiblePhotos = albumFilter === 'all'
    ? photos
    : photos.filter(p => String(p.album_id) === String(albumFilter))

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Photo Gallery Manager</h2>

      <Notice notice={notice} />

      {showAlbumForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className={panelCls + ' w-full max-w-md'}>
            <h3 className="text-xl font-bold text-white mb-4">Create New Album</h3>
            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label htmlFor="album-name" className={labelCls}>Album name</label>
                <input id="album-name" type="text" value={albumForm.name}
                  onChange={e => setAlbumForm({ ...albumForm, name: e.target.value })}
                  className={inputCls} required />
              </div>
              <div>
                <label htmlFor="album-desc" className={labelCls}>Description</label>
                <textarea id="album-desc" rows="2" value={albumForm.description}
                  onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className={inputCls} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className={btnPrimary}>Create</button>
                <button type="button" onClick={() => setShowAlbumForm(false)} className={btnGhost}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setEditing('new')} className={btnPrimary}><FaPlus /> Add Photo</button>
        <button onClick={() => setShowAlbumForm(true)} className={btnGhost}><FaPlus /> New Album</button>
      </div>

      {(editing === 'new' || editing) && (
        <form onSubmit={handleSubmit} className={panelCls + ' mb-6 space-y-5'}>
          <h3 className="text-xl font-bold text-white">
            {editing === 'new' ? 'Add New Photo' : 'Edit Photo'}
          </h3>

          {/* Previously this block only rendered for new photos, so images
              could not be added or changed while editing an existing one. */}
          <ImageUploader
            bucket={BUCKET}
            prefix="gallery"
            value={imageList}
            onChange={setImageList}
            id="photo-images"
            label="Photos"
            hint="Upload several at once or paste URLs. The first image is the main photo, the rest form the gallery."
          />

          <div>
            <label htmlFor="photo-title" className={labelCls}>Title</label>
            <input id="photo-title" type="text" placeholder="Photo title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className={inputCls} />
          </div>

          <div>
            <label htmlFor="photo-desc" className={labelCls}>Description</label>
            <textarea id="photo-desc" rows="3" placeholder="Photo description"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className={inputCls} />
          </div>

          <div>
            <label htmlFor="photo-album" className={labelCls}>Album</label>
            <select id="photo-album" value={form.album_id ?? ''}
              onChange={e => setForm({ ...form, album_id: e.target.value || null })}
              className={inputCls}>
              <option value="">No Album</option>
              {albums.map(album => <option key={album.id} value={album.id}>{album.name}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_premium}
              onChange={e => setForm({ ...form, is_premium: e.target.checked })}
              className="w-5 h-5 accent-yellow-500" />
            <span className="text-slate-200 font-medium">Premium (supporters only)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className={btnPrimary}>
              <FaSave /> {saving ? 'Saving...' : editing === 'new' ? 'Add Photo' : 'Update Photo'}
            </button>
            <button type="button" onClick={resetForm} className={btnGhost}>Cancel</button>
          </div>
        </form>
      )}

      {/* Filter buttons used to call setAlbums([]), which cleared the album
          list feeding the select above and changed nothing else. */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setAlbumFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${
            albumFilter === 'all'
              ? 'bg-yellow-500 text-slate-900 border-yellow-500'
              : 'bg-slate-800 text-slate-200 border-slate-600 hover:border-slate-400'
          }`}>
          All ({photos.length})
        </button>
        {albums.map(album => (
          <button key={album.id} onClick={() => setAlbumFilter(album.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium border-2 ${
              String(albumFilter) === String(album.id)
                ? 'bg-yellow-500 text-slate-900 border-yellow-500'
                : 'bg-slate-800 text-slate-200 border-slate-600 hover:border-slate-400'
            }`}>
            {album.name} ({photos.filter(p => String(p.album_id) === String(album.id)).length})
          </button>
        ))}
      </div>

      {visiblePhotos.length === 0 ? (
        <p className="text-slate-300">No photos yet. Use "Add Photo" to upload some.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visiblePhotos.map(photo => (
            <div key={photo.id} className="relative group aspect-square bg-slate-800 border-2 border-slate-600 rounded-lg overflow-hidden">
              <img src={photo.image_url} alt={photo.title} loading="lazy" className="w-full h-full object-cover" />
              {photo.is_premium && <FaLock className="absolute top-2 right-2 text-amber-500" />}
              {(photo.gallery_images || []).length > 0 && (
                <span className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-full">
                  +{photo.gallery_images.length}
                </span>
              )}
              <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button onClick={() => handleEdit(photo)} aria-label={`Edit ${photo.title}`}
                  className="bg-yellow-500 text-slate-900 p-2 rounded"><FaEdit /></button>
                <button onClick={() => handleDelete(photo)} aria-label={`Delete ${photo.title}`}
                  className="bg-red-600 text-white p-2 rounded"><FaTrash /></button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-xs text-white truncate">
                {photo.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}