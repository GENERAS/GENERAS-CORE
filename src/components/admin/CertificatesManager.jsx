import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaAward, FaBox, FaFileAlt } from 'react-icons/fa'
import ImageUploader, {
  inputCls, labelCls, panelCls, btnPrimary, btnGhost, Notice, pickFields, deleteStoredFiles
} from './AdminUI'

const BUCKET = 'certificates'

const EMPTY_FORM = {
  title: '',
  issuer: '',
  issue_date: '',
  expiry_date: '',
  certificate_url: '',
  credential_id: '',
  verification_url: '',
  category: 'development',
  certificate_type: 'digital',
  has_hard_copy: false,
  hard_copy_location: '',
  hard_copy_notes: '',
  hard_copy_image_url: ''
}

// id, likes and created_at are server-owned. The old code updated with the
// entire form object, which put a stale likes value back over the real count.
const FORM_FIELDS = [
  'title', 'issuer', 'issue_date', 'expiry_date', 'certificate_url',
  'credential_id', 'verification_url', 'category', 'certificate_type',
  'has_hard_copy', 'hard_copy_location', 'hard_copy_notes', 'hard_copy_image_url'
]

export default function CertificatesManager() {
  const [certificates, setCertificates] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })
  const [form, setForm] = useState(EMPTY_FORM)

  const flash = (type, text) => {
    setNotice({ type, text })
    if (type !== 'error') setTimeout(() => setNotice({ type: '', text: '' }), 4000)
  }

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('issue_date', { ascending: false })

      if (error) throw error
      setCertificates(data || [])
    } catch (error) {
      flash('error', 'Could not load certificates: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.title.trim()) return flash('error', 'Please enter a title')
    if (!form.issuer.trim()) return flash('error', 'Please enter an issuer')

    setSaving(true)
    setNotice({ type: '', text: '' })

    const payload = {
      ...pickFields(form, FORM_FIELDS),
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      issue_date: form.issue_date || null,
      expiry_date: form.expiry_date || null,
      certificate_url: form.certificate_url || null,
      verification_url: form.verification_url || null,
      hard_copy_image_url: form.hard_copy_image_url || null
    }

    try {
      if (editing && editing !== 'new') {
        const { error } = await supabase
          .from('certificates')
          .update(payload)
          .eq('id', editing)

        if (error) throw error
        flash('success', 'Certificate updated')
      } else {
        const { error } = await supabase
          .from('certificates')
          .insert([payload])

        if (error) throw error
        flash('success', 'Certificate added')
      }

      resetForm()
      loadCertificates()
    } catch (error) {
      flash('error', 'Save failed: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (cert) => {
    setEditing(cert.id)
    setForm({
      title: cert.title || '',
      issuer: cert.issuer || '',
      issue_date: cert.issue_date || '',
      expiry_date: cert.expiry_date || '',
      certificate_url: cert.certificate_url || '',
      credential_id: cert.credential_id || '',
      verification_url: cert.verification_url || '',
      category: cert.category || 'development',
      certificate_type: cert.certificate_type || 'digital',
      has_hard_copy: cert.has_hard_copy || false,
      hard_copy_location: cert.hard_copy_location || '',
      hard_copy_notes: cert.hard_copy_notes || '',
      hard_copy_image_url: cert.hard_copy_image_url || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (cert) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return

    // Clear the stored hard copy file too, otherwise replacing it repeatedly
    // leaves orphans in the bucket.
    if (cert.hard_copy_image_url) {
      await deleteStoredFiles([cert.hard_copy_image_url])
    }

    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', cert.id)

      if (error) throw error
      flash('success', 'Certificate deleted')
      loadCertificates()
    } catch (error) {
      flash('error', 'Delete failed: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setNotice({ type: '', text: '' })
  }

  if (loading) {
    return <div className="text-center py-12">Loading certificates...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaAward className="text-amber-500" />
          Certificates Manager
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing('new')}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add Certificate
          </button>
        )}
      </div>

      {/* Certificate Form */}
      {editing !== null && (
        <form onSubmit={handleSubmit} className={panelCls + ' mb-8 space-y-5 max-h-[70vh] overflow-y-auto'}>
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-slate-900 py-2 z-10">
            <h3 className="text-xl font-semibold text-white">
              {editing === 'new' ? 'Add New Certificate' : 'Edit Certificate'}
            </h3>
            <button type="button" onClick={resetForm} aria-label="Close form"
              className="text-slate-400 hover:text-white">
              Cancel
            </button>
          </div>

          <Notice notice={notice} />

          <div className="grid grid-cols-2 gap-4">
            {/* Basic Info */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={e => setForm({...form, title: e.target.value})}
                className={inputCls}
                placeholder="e.g., Web Development Fundamentals"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issuer *</label>
              <input
                type="text"
                required
                value={form.issuer}
                onChange={e => setForm({...form, issuer: e.target.value})}
                className={inputCls}
                placeholder="e.g., Coursera, Binance Academy"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                className={inputCls}
              >
                <option value="development">Development</option>
                <option value="trading">Trading</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium mb-1">Issue Date</label>
              <input
                type="date"
                value={form.issue_date}
                onChange={e => setForm({...form, issue_date: e.target.value})}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date (optional)</label>
              <input
                type="date"
                value={form.expiry_date}
                onChange={e => setForm({...form, expiry_date: e.target.value})}
                className={inputCls}
              />
            </div>

            {/* Certificate Type Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Certificate Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({...form, certificate_type: 'digital'})}
                  className={`p-4 rounded-lg border-2 transition ${
                    form.certificate_type === 'digital'
                      ? 'border-yellow-500 bg-blue-500/20'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <FaLink className="text-2xl mx-auto mb-2" />
                  <div className="font-semibold">Digital Certificate</div>
                  <div className="text-xs text-gray-400">PDF or Image URL</div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({...form, certificate_type: 'physical'})}
                  className={`p-4 rounded-lg border-2 transition ${
                    form.certificate_type === 'physical'
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <FaBox className="text-2xl mx-auto mb-2" />
                  <div className="font-semibold">Hard Copy Certificate</div>
                  <div className="text-xs text-gray-400">Physical certificate with photo</div>
                </button>
              </div>
            </div>

            {/* DIGITAL CERTIFICATE FIELDS */}
            {(form.certificate_type === 'digital') && (
              <>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Certificate URL (PDF or Image)</label>
                  <input
                    type="url"
                    value={form.certificate_url}
                    onChange={e => setForm({...form, certificate_url: e.target.value})}
                    className={inputCls}
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Verification URL (optional)</label>
                  <input
                    type="url"
                    value={form.verification_url}
                    onChange={e => setForm({...form, verification_url: e.target.value})}
                    className={inputCls}
                    placeholder="https://verify.example.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Credential ID</label>
                  <input
                    type="text"
                    value={form.credential_id}
                    onChange={e => setForm({...form, credential_id: e.target.value})}
                    className={inputCls}
                    placeholder="e.g., ABC123DEF"
                  />
                </div>
              </>
            )}

            {/* HARD COPY CERTIFICATE FIELDS */}
            {(form.certificate_type === 'physical') && (
              <>
                <div className="col-span-2">
                  <ImageUploader
                    bucket={BUCKET}
                    prefix="hard-copies"
                    single
                    id="cert-hard-copy"
                    label="Photo of Hard Copy Certificate"
                    hint="A photo of the physical certificate, up to 5MB. Optional."
                    value={form.hard_copy_image_url ? [form.hard_copy_image_url] : []}
                    onChange={list => setForm({ ...form, hard_copy_image_url: list[0] || '' })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Hard Copy Location</label>
                  <input
                    type="text"
                    value={form.hard_copy_location}
                    onChange={e => setForm({...form, hard_copy_location: e.target.value})}
                    className={inputCls}
                    placeholder="e.g., Filing cabinet, Portfolio folder, Safe"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Additional Notes</label>
                  <textarea
                    value={form.hard_copy_notes}
                    onChange={e => setForm({...form, hard_copy_notes: e.target.value})}
                    className={inputCls}
                    rows="2"
                    placeholder="Condition, frame, special markings, etc."
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.has_hard_copy}
                      onChange={e => setForm({...form, has_hard_copy: e.target.checked})}
                      className="w-5 h-5 accent-yellow-500"
                    />
                    <span className="flex items-center gap-1">
                      <FaFileAlt /> I have the physical certificate in my possession
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-4 sticky bottom-0 bg-slate-900 py-3 border-t-2 border-slate-700">
            <button type="submit" disabled={saving} className={btnPrimary}>
              <FaSave /> {saving ? 'Saving...' : editing === 'new' ? 'Add Certificate' : 'Update Certificate'}
            </button>
            <button type="button" onClick={resetForm} className={btnGhost}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Certificates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map(cert => (
          <div key={cert.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{cert.title}</h3>
                <p className="text-sm text-gray-400">{cert.issuer}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                cert.certificate_type === 'digital' 
                  ? 'bg-yellow-600' 
                  : 'bg-amber-600'
              }`}>
                {cert.certificate_type === 'digital' ? '💻 Digital' : '📦 Hard Copy'}
              </span>
            </div>

            <div className="text-sm space-y-1 mb-3">
              {cert.issue_date && (
                <p>📅 Issued: {new Date(cert.issue_date).toLocaleDateString()}</p>
              )}
              {cert.credential_id && (
                <p>🔑 ID: {cert.credential_id}</p>
              )}
              {cert.certificate_type === 'physical' && cert.hard_copy_location && (
                <p className="flex items-center gap-1 text-amber-400">
                  <FaBox /> {cert.hard_copy_location}
                </p>
              )}
            </div>

            {/* Image Preview for Hard Copy */}
            {cert.certificate_type === 'physical' && cert.hard_copy_image_url && (
              <div className="mb-3">
                <img 
                  src={cert.hard_copy_image_url} 
                  alt={cert.title}
                  loading="lazy" className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                  onClick={() => window.open(cert.hard_copy_image_url, '_blank')}
                />
              </div>
            )}

            <div className="flex gap-2">
              {cert.certificate_url && (
                <a
                  href={cert.certificate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300 text-sm flex items-center gap-1"
                >
                  View Certificate →
                </a>
              )}
              {cert.verification_url && (
                <a
                  href={cert.verification_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-sm flex items-center gap-1"
                >
                  <FaLink /> Verify
                </a>
              )}
            </div>

            {cert.hard_copy_notes && (
              <p className="text-xs text-gray-500 mt-2 italic">📝 {cert.hard_copy_notes}</p>
            )}

            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-700">
              <button onClick={() => handleEdit(cert)} className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300">
                <FaEdit />
              </button>
              <button onClick={() => handleDelete(cert)} className="text-red-400 hover:text-red-300">
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FaAward className="text-4xl mx-auto mb-3" />
          <p>No certificates yet. Add your first certificate!</p>
        </div>
      )}
    </div>
  )
}
