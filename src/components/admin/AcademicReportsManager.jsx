import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaFilePdf, FaImages, FaUserTie } from 'react-icons/fa'
import ImageUploader, {
  inputCls, labelCls, panelCls, btnPrimary, btnGhost, Notice,
  FileOrUrlField, pickFields, deleteStoredFiles
} from './AdminUI'

const BUCKET = 'photos'

// id and created_at are server-owned; the old update sent the whole form row.
const FORM_FIELDS = [
  'level_id', 'report_type', 'title', 'description', 'file_url',
  'thumbnail_url', 'academic_year', 'display_order', 'is_featured'
]

export default function AcademicReportsManager() {
  const [levels, setLevels] = useState([])
  const [reports, setReports] = useState([])
  const [selectedLevel, setSelectedLevel] = useState('')
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState({ type: '', text: '' })

  const flash = (type, text) => {
    setNotice({ type, text })
    if (type !== 'error') setTimeout(() => setNotice({ type: '', text: '' }), 4000)
  }
  
  const [form, setForm] = useState({
    level_id: '',
    report_type: 'school_report',
    title: '',
    description: '',
    file_url: '',
    thumbnail_url: '',
    academic_year: '',
    display_order: 0,
    is_featured: false
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load academic levels
      const { data: levelsData } = await supabase
        .from('academic_levels')
        .select('*')
        .order('display_order')
      
      if (levelsData) {
        setLevels(levelsData)
      }

      // Load reports
      const { data: reportsData } = await supabase
        .from('academic_level_reports')
        .select('*, academic_levels(level_name)')
        .order('display_order')
      
      if (reportsData) {
        setReports(reportsData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.level_id) return flash('error', 'Please select a level')
    if (!form.file_url) return flash('error', 'Please upload a file or paste a link')

    setSaving(true)
    setNotice({ type: '', text: '' })

    const payload = {
      ...pickFields(form, FORM_FIELDS),
      title: form.title.trim(),
      level_id: Number(form.level_id),
      display_order: Number(form.display_order) || 0
    }

    try {
      if (editing) {
        const { error } = await supabase
          .from('academic_level_reports')
          .update(payload)
          .eq('id', editing)

        if (error) throw error
        flash('success', 'Report updated')
      } else {
        const { error } = await supabase
          .from('academic_level_reports')
          .insert([payload])

        if (error) throw error
        flash('success', 'Report added')
      }

      resetForm()
      loadData()
    } catch (error) {
      flash('error', 'Save failed: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (report) => {
    setEditing(report.id)
    setForm({
      level_id: report.level_id,
      report_type: report.report_type,
      title: report.title,
      description: report.description || '',
      file_url: report.file_url,
      thumbnail_url: report.thumbnail_url || '',
      academic_year: report.academic_year || '',
      display_order: report.display_order || 0,
      is_featured: report.is_featured || false
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (report) => {
    if (!confirm('Delete this report/photo?')) return

    // Clear the stored files as well, otherwise they stay in the bucket after
    // the row is gone.
    await deleteStoredFiles([report.file_url, report.thumbnail_url])

    try {
      const { error } = await supabase
        .from('academic_level_reports')
        .delete()
        .eq('id', report.id)

      if (error) throw error
      flash('success', 'Report deleted')
      loadData()
    } catch (error) {
      flash('error', 'Delete failed: ' + error.message)
    }
  }

  const resetForm = () => {
    setEditing(null)
    setForm({
      level_id: selectedLevel,
      report_type: 'school_report',
      title: '',
      description: '',
      file_url: '',
      thumbnail_url: '',
      academic_year: '',
      display_order: 0,
      is_featured: false
    })
    setNotice({ type: '', text: '' })
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'school_report': return <FaFilePdf className="text-red-400" />
      case 'uniform_photo': return <FaUserTie className="text-yellow-600 dark:text-yellow-400" />
      case 'school_photo': return <FaImages className="text-green-400" />
      default: return <FaFilePdf className="text-gray-400" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'school_report': return 'School Report'
      case 'uniform_photo': return 'Uniform Photo'
      case 'school_photo': return 'School Photo'
      default: return type
    }
  }

  const filteredReports = selectedLevel 
    ? reports.filter(r => r.level_id === selectedLevel)
    : reports

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Academic Reports & Photos</h2>
        <p className="text-gray-400 text-sm">Total: {reports.length} items</p>
      </div>

      {/* Level Filter */}
      <div className="flex gap-4 items-center bg-slate-800/50 p-4 rounded-lg">
        <label className="text-gray-400">Filter by Level:</label>
        <select 
          value={selectedLevel} 
          onChange={(e) => setSelectedLevel(e.target.value)}
          className={inputCls}
        >
          <option value="">All Levels</option>
          {levels.map(level => (
            <option key={level.id} value={level.id}>
              {level.level_name} ({level.school_name})
            </option>
          ))}
        </select>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={panelCls + ' space-y-5'}>
          <Notice notice={notice} />
        <h3 className="font-bold text-lg mb-4">
          {editing ? 'Edit Report/Photo' : 'Add New Report/Photo'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm block mb-1">Academic Level *</label>
            <select 
              value={form.level_id} 
              onChange={e => setForm({...form, level_id: e.target.value})}
              className={inputCls}
              required
            >
              <option value="">Select Level</option>
              {levels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.level_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm block mb-1">Type *</label>
            <select 
              value={form.report_type} 
              onChange={e => setForm({...form, report_type: e.target.value})}
              className={inputCls}
            >
              <option value="school_report">School Report</option>
              <option value="uniform_photo">Uniform Photo</option>
              <option value="school_photo">School Photo</option>
            </select>
          </div>
          
          <div>
            <label className="text-gray-400 text-sm block mb-1">Title *</label>
            <input 
              type="text" 
              placeholder="e.g., Grade 7 Report Card"
              value={form.title} 
              onChange={e => setForm({...form, title: e.target.value})}
              className={inputCls}
              required
            />
          </div>
          
          <div>
            <label className="text-gray-400 text-sm block mb-1">Academic Year</label>
            <input 
              type="text" 
              placeholder="e.g., 2023-2024"
              value={form.academic_year} 
              onChange={e => setForm({...form, academic_year: e.target.value})}
              className={inputCls}
            />
          </div>
        </div>
        
        <div>
          <label className="text-gray-400 text-sm block mb-1">Description</label>
          <textarea 
            placeholder="Brief description..."
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})}
            className={inputCls}
            rows="2"
          />
        </div>
        
        {/* File Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileOrUrlField
            bucket={BUCKET}
            prefix="academic-reports"
            id="report-file"
            label="Report file *"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            hint="A PDF of the report, or an image if it is a photo report."
            value={form.file_url}
            onChange={url => setForm({ ...form, file_url: url })}
          />

          <ImageUploader
            bucket={BUCKET}
            prefix="academic-reports"
            single
            id="report-thumbnail"
            label="Thumbnail (optional)"
            hint="Shown on the public reports page."
            value={form.thumbnail_url ? [form.thumbnail_url] : []}
            onChange={list => setForm({ ...form, thumbnail_url: list[0] || '' })}
          />
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="featured"
              checked={form.is_featured} 
              onChange={e => setForm({...form, is_featured: e.target.checked})}
              className="w-5 h-5 accent-yellow-500"
            />
            <label htmlFor="featured" className="text-sm">Featured</label>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Display Order:</label>
            <input 
              type="number" 
              value={form.display_order} 
              onChange={e => setForm({...form, display_order: parseInt(e.target.value) || 0})}
              className={inputCls + ' w-24'}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            type="submit" 
            className={btnPrimary} disabled={saving}
          >
            <FaSave /> {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button 
              type="button" 
              onClick={resetForm}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <FaTimes /> Cancel
            </button>
          )}
        </div>
      </form>

      {/* Reports List */}
      <div className="space-y-3">
        <h3 className="font-bold">
          {selectedLevel 
            ? `Reports/Photos for ${levels.find(l => l.id === selectedLevel)?.level_name || 'Selected Level'}`
            : 'All Reports & Photos'
          }
        </h3>
        
        {filteredReports.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No reports or photos found. {selectedLevel && 'Add some above!'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(report => (
              <div 
                key={report.id} 
                className={`bg-slate-800/50 rounded-lg p-4 border ${
                  report.is_featured ? 'border-amber-500/50' : 'border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-2xl">{getTypeIcon(report.report_type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{report.title}</h4>
                    <p className="text-xs text-gray-400">
                      {report.academic_levels?.level_name}
                    </p>
                    <p className="text-xs text-blue-400">
                      {getTypeLabel(report.report_type)}
                      {report.academic_year && ` • ${report.academic_year}`}
                    </p>
                    {report.is_featured && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Preview */}
                {report.thumbnail_url ? (
                  <img 
                    src={report.thumbnail_url} 
                    alt={report.title}
                    loading="lazy" className="w-full h-32 object-cover rounded mb-3"
                  />
                ) : report.file_url?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                  <img 
                    src={report.file_url} 
                    alt={report.title}
                    loading="lazy" className="w-full h-32 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-700 rounded flex items-center justify-center mb-3">
                    <span className="text-4xl">{getTypeIcon(report.report_type)}</span>
                  </div>
                )}
                
                {report.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                    {report.description}
                  </p>
                )}
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(report)}
                    className="bg-blue-600/50 hover:bg-yellow-600 px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(report)}
                    className="bg-red-600/50 hover:bg-red-600 px-3 py-1 rounded text-sm flex items-center gap-1"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
