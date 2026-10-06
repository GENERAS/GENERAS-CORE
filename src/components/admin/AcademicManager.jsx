import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUpload } from 'react-icons/fa'
import { useTheme } from '../../context/ThemeContext'

export default function AcademicManager() {
  const { isDark } = useTheme()
  const [levels, setLevels] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ level_name: '', school_name: '', start_year: '', end_year: '', status: 'planned', description: '', display_order: 1 })
  const [loading, setLoading] = useState(true)

  const bg = isDark ? 'bg-gray-800' : 'bg-white'
  const bgSub = isDark ? 'bg-gray-700/50' : 'bg-gray-50'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const text = isDark ? 'text-white' : 'text-gray-900'
  const textSub = isDark ? 'text-gray-300' : 'text-gray-600'
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500' // eslint-disable-line no-unused-vars
  const inputBg = isDark ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  const focusRing = 'focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500'

  const loadLevels = async () => {
    try {
      const { data } = await supabase.from('academic_levels').select('*').order('display_order')
      setLevels(data || [])
    } catch (err) {
      console.error('Error loading academic levels:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLevels()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await supabase.from('academic_levels').update(form).eq('id', editing)
      alert('Level updated')
    } else {
      await supabase.from('academic_levels').insert([form])
      alert('Level added')
    }
    resetForm()
    loadLevels()
  }

  const handleEdit = (level) => {
    setEditing(level.id)
    setForm(level)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this level?')) {
      await supabase.from('academic_levels').delete().eq('id', id)
      loadLevels()
    }
  }

  const resetForm = () => {
    setEditing(null)
    setForm({ level_name: '', school_name: '', start_year: '', end_year: '', status: 'planned', description: '', display_order: 1 })
  }

  if (loading) return <div className={text}>Loading...</div>

  return (
    <div>
      <h2 className={`text-2xl font-bold mb-4 ${text}`}>Academic Levels</h2>
      <form onSubmit={handleSubmit} className={`${bg} ${border} border p-4 rounded-lg mb-6 space-y-3`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="text" placeholder="Level Name" value={form.level_name} onChange={e => setForm({...form, level_name: e.target.value})} className={`${inputBg} ${focusRing} border rounded px-3 py-2`} required />
          <input type="text" placeholder="School Name" value={form.school_name} onChange={e => setForm({...form, school_name: e.target.value})} className={`${inputBg} ${focusRing} border rounded px-3 py-2`} required />
          <input type="text" placeholder="Start Year" value={form.start_year} onChange={e => setForm({...form, start_year: e.target.value})} className={`${inputBg} ${focusRing} border rounded px-3 py-2`} />
          <input type="text" placeholder="End Year" value={form.end_year} onChange={e => setForm({...form, end_year: e.target.value})} className={`${inputBg} ${focusRing} border rounded px-3 py-2`} />
          <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={`${inputBg} ${focusRing} border rounded px-3 py-2`}>
            <option value="completed">Completed</option><option value="building">Building</option><option value="planned">Planned</option>
          </select>
          <input type="number" placeholder="Display Order" value={form.display_order} onChange={e => setForm({...form, display_order: parseInt(e.target.value)})} className={`${inputBg} ${focusRing} border rounded px-3 py-2`} />
        </div>
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className={`w-full ${inputBg} ${focusRing} border rounded px-3 py-2`} rows="2"></textarea>
        <div className="flex gap-2">
          <button type="submit" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"><FaSave /> {editing ? 'Update' : 'Add'}</button>
          {editing && <button type="button" onClick={resetForm} className={`${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'} px-4 py-2 rounded transition-colors`}>Cancel</button>}
        </div>
      </form>

      <div className="space-y-2">
        {levels.map(level => (
          <div key={level.id} className={`${bgSub} ${border} border rounded-lg p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2`}>
            <div className={`flex-1 min-w-0 ${textSub}`}><span className={`font-bold ${text}`}>{level.level_name}</span> – {level.school_name} ({level.start_year}-{level.end_year}) <span className={`text-xs ${bgSub === 'bg-gray-700/50' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} px-2 py-0.5 rounded`}>{level.status}</span></div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(level)} className={isDark ? 'text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-500'}><FaEdit /></button>
              <button onClick={() => handleDelete(level.id)} className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}><FaTrash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
