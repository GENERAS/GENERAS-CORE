import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload, FaLock, FaUnlock } from 'react-icons/fa'

export default function PhotoManager() {
  const [photos, setPhotos] = useState([])
  const [albums, setAlbums] = useState([])
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', image_url: '', gallery_images: [], album_id: null, is_premium: false })
  const [albumForm, setAlbumForm] = useState({ name: '', description: '' })
  const [showAlbumForm, setShowAlbumForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    loadData()
    
    // Set up real-time subscription for photos
    const channel = supabase.channel('photo-admin-changes')
    
    channel
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'photos' },
        (payload) => {
          console.log('Photo inserted in admin:', payload)
          setPhotos(prev => [payload.new, ...prev])
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'photos' },
        (payload) => {
          console.log('Photo updated in admin:', payload)
          setPhotos(prev => prev.map(p => p.id === payload.new.id ? payload.new : p))
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'photos' },
        (payload) => {
          console.log('Photo deleted in admin:', payload)
          setPhotos(prev => prev.filter(p => p.id !== payload.old.id))
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'photo_albums' },
        (payload) => {
          console.log('Photo albums changed in admin:', payload)
          loadData()
        }
      )
      .subscribe((status) => {
        console.log('Photo admin subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadData = async () => {
    try {
      const [photosRes, albumsRes] = await Promise.all([
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
        supabase.from('photo_albums').select('*')
      ])
      setPhotos(photosRes.data || [])
      setAlbums(albumsRes.data || [])
    } catch (err) {
      console.error('Error loading photos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    setUploading(true)
    const urls = []
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `photos/${fileName}`
      const { error } = await supabase.storage.from('photos').upload(filePath, file)
      if (error) { alert('Upload error: ' + error.message); continue }
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath)
      urls.push(publicUrl)
    }
    if (urls.length > 0) {
      setForm({ ...form, image_url: urls[0], gallery_images: urls.slice(1), title: files[0].name.split('.')[0] })
    }
    setUploading(false)
  }

  const removeGalleryImage = (index) => {
    const updated = form.gallery_images.filter((_, i) => i !== index)
    setForm({ ...form, gallery_images: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('=== PHOTO FORM SUBMIT ===')
    console.log('Form state:', form)
    console.log('Editing mode:', editing)
    
    if (!form.image_url) {
      alert('Please upload an image first')
      return
    }
    
    try {
      if (editing && editing !== 'new') {
        const { error } = await supabase.from('photos').update(form).eq('id', editing)
        if (error) throw error
        alert('Photo updated successfully!')
      } else {
        const { data, error } = await supabase.from('photos').insert([{...form, created_at: new Date().toISOString()}]).select()
        console.log('Insert response:', { data, error })
        if (error) throw error
        alert('Photo added successfully! Check Community page.')
      }
      resetForm()
      loadData()
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error: ' + error.message)
    }
  }

  const handleCreateAlbum = async (e) => {
    e.preventDefault()
    await supabase.from('photo_albums').insert([albumForm])
    setShowAlbumForm(false)
    setAlbumForm({ name: '', description: '' })
    loadData()
  }

  const handleEdit = (photo) => { setEditing(photo.id); setForm(photo) }
  const handleDelete = async (id) => { if (confirm('Delete photo?')) { await supabase.from('photos').delete().eq('id', id); loadData() } }
  const resetForm = () => { setEditing(null); setForm({ title: '', description: '', image_url: '', gallery_images: [], album_id: null, is_premium: false }) }

  if (loading) return <div>Loading photos...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Photo Gallery Manager</h2>

      {/* Album Creation Modal */}
      {showAlbumForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-96">
            <h3 className="text-xl font-bold mb-4">Create New Album</h3>
            <form onSubmit={handleCreateAlbum}>
              <input type="text" placeholder="Album Name" value={albumForm.name} onChange={e => setAlbumForm({...albumForm, name: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2 mb-3" required />
              <textarea placeholder="Description" value={albumForm.description} onChange={e => setAlbumForm({...albumForm, description: e.target.value})} className="w-full bg-slate-700 rounded px-3 py-2 mb-3" rows="2"></textarea>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 px-4 py-2 rounded">Create</button>
                <button type="button" onClick={() => setShowAlbumForm(false)} className="bg-gray-600 px-4 py-2 rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => setEditing('new')} className="bg-green-600 px-4 py-2 rounded flex items-center gap-2"><FaPlus /> Add Photo</button>
        <button onClick={() => setShowAlbumForm(true)} className="bg-purple-600 px-4 py-2 rounded flex items-center gap-2"><FaPlus /> New Album</button>
      </div>

      {/* Photo Form */}
      {(editing === 'new' || editing) && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-lg mb-6 space-y-4 border border-slate-600">
          <h3 className="text-xl font-bold text-white mb-4">
            {editing === 'new' ? 'Add New Photo' : 'Edit Photo'}
          </h3>
          
          {editing === 'new' && (
            <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
              <input type="file" accept="image/*" multiple onChange={handleMultipleUpload} className="hidden" id="photo-upload" disabled={uploading} />
              <label htmlFor="photo-upload" className="cursor-pointer block">
                {uploading ? <div className="animate-spin h-8 w-8 border-b-2 border-blue-500 mx-auto"></div> : <><FaUpload className="text-2xl mx-auto mb-2" /> Click to upload images (select multiple)</>}
              </label>
            </div>
          )}

          {/* Main image + gallery images strip */}
          {form.image_url && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Main Image</label>
              <div className="relative w-32 h-32">
                <img src={form.image_url} alt="preview" loading="lazy" className="w-full h-full object-cover rounded" />
                {form.is_premium && <FaLock className="absolute top-1 right-1 text-amber-500" />}
              </div>
              {(form.gallery_images || []).length > 0 && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-2">Additional Images ({form.gallery_images.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {form.gallery_images.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 group">
                        <img src={url} alt={`Gallery ${idx + 1}`} loading="lazy" className="w-full h-full object-cover rounded" />
                        <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Existing image in edit mode (no new upload UI) */}
          {editing && editing !== 'new' && form.image_url && (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Main Image</label>
              <div className="relative w-32 h-32">
                <img src={form.image_url} alt="preview" loading="lazy" className="w-full h-full object-cover rounded" />
                {form.is_premium && <FaLock className="absolute top-1 right-1 text-amber-500" />}
              </div>
              {(form.gallery_images || []).length > 0 && (
                <div className="mt-3">
                  <label className="block text-sm text-gray-400 mb-2">Additional Images ({form.gallery_images.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {form.gallery_images.map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 group">
                        <img src={url} alt={`Gallery ${idx + 1}`} loading="lazy" className="w-full h-full object-cover rounded" />
                        <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">&times;</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Title</label>
            <input type="text" placeholder="Photo title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea placeholder="Photo description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-slate-700 rounded px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Album</label>
            <select value={form.album_id || ''} onChange={e => setForm({...form, album_id: e.target.value || null})} className="w-full bg-slate-700 rounded px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No Album</option>
              {albums.map(album => <option key={album.id} value={album.id}>{album.name}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_premium} onChange={e => setForm({...form, is_premium: e.target.checked})} className="w-4 h-4" />
            <span className="text-gray-300">Premium (supporters only)</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded font-medium transition flex items-center justify-center gap-2">
              <FaSave /> {editing === 'new' ? 'Add Photo' : 'Update Photo'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-medium transition">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Album Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setAlbums([])} className="bg-blue-600 px-3 py-1 rounded-full text-sm">All Photos</button>
        {albums.map(album => (
          <button key={album.id} className="bg-slate-700 px-3 py-1 rounded-full text-sm">{album.name}</button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {photos.map(photo => (
          <div key={photo.id} className="relative group aspect-square bg-slate-800 rounded-lg overflow-hidden">
            <img src={photo.image_url} alt={photo.title} loading="lazy" className="w-full h-full object-cover" />
            {photo.is_premium && <FaLock className="absolute top-2 right-2 text-amber-500" />}
            {(photo.gallery_images || []).length > 0 && (
              <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">+{photo.gallery_images.length}</span>
            )}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button onClick={() => handleEdit(photo)} className="bg-blue-600 p-2 rounded"><FaEdit /></button>
              <button onClick={() => handleDelete(photo.id)} className="bg-red-600 p-2 rounded"><FaTrash /></button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs truncate">{photo.title}</div>
          </div>
        ))}
      </div>
    </div>
  )
}