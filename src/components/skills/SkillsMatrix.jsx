import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

// Inline SVG icons - no external libraries
const IconCode = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
)

const IconTrendingUp = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const IconBriefcase = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const iconMap = {
  development: IconCode,
  trading: IconTrendingUp,
  entrepreneurial: IconBriefcase
}

export default function SkillsMatrix() {
  const [skills, setSkills] = useState([])
  const [activeCategory, setActiveCategory] = useState('development')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const { data } = await supabase
        .from('skills')
        .select('*')
        .order('display_order')
      
      setSkills(data || [])
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    { id: 'development', label: 'Development', icon: 'development', color: 'text-yellow-600' },
    { id: 'trading', label: 'Trading', icon: 'trading', color: 'text-yellow-600' },
    { id: 'entrepreneurial', label: 'Entrepreneurial', icon: 'entrepreneurial', color: 'text-yellow-600' }
  ]

  const filteredSkills = skills.filter(skill => skill.category === activeCategory)

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        Skills Matrix
      </h2>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => {
          const IconComponent = iconMap[cat.icon]
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                activeCategory === cat.id
                  ? 'bg-yellow-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <IconComponent />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Skills List */}
      {filteredSkills.length === 0 ? (
        <p className="text-center text-gray-600 py-8">
          No skills added yet. Go to Admin Panel → Skills to add your skills.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map(skill => (
            <div key={skill.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-800">{skill.skill_name}</span>
                <span className="text-sm text-gray-600">{skill.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-600 rounded-full transition-all duration-500"
                  style={{ width: `${skill.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}