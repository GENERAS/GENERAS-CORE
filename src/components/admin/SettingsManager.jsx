import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { uploadFile } from './AdminUI'
import { useTheme } from '../../context/ThemeContext'
import { FaUser, FaGlobe, FaLock, FaSave, FaCheck, FaUpload, FaPalette, FaExclamationTriangle, FaSpinner, FaGithub, FaLinkedin, FaTwitter, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa'

export default function SettingsManager() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('public')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [user, setUser] = useState(null)

  const [profile, setProfile] = useState({
    full_name: '', bio: '', job_title: '', headline: '', subheadline: '', location: '', avatar_url: ''
  })

  const [siteSettings, setSiteSettings] = useState({
    site_name: '', site_description: '', primary_color: '#3b82f6',
    social_github: '', social_linkedin: '', social_twitter: '', social_youtube: '',
    social_instagram: '', social_whatsapp: '', maintenance_mode: false
  })

  useEffect(() => { loadSettings() }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      if (!currentUser) { setMessage({ type: 'error', text: 'Not authenticated' }); return }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '', bio: profileData.bio || '', job_title: profileData.job_title || '',
          headline: profileData.headline || '', subheadline: profileData.subheadline || '',
          location: profileData.location || '', avatar_url: profileData.avatar_url || ''
        })
      }

      const { data: siteData } = await supabase.from('site_settings').select('*').limit(1).maybeSingle()
      if (siteData) {
        setSiteSettings({
          site_name: siteData.site_name || '', site_description: siteData.site_description || '',
          primary_color: siteData.primary_color || '#3b82f6',
          social_github: siteData.social_github || '', social_linkedin: siteData.social_linkedin || '',
          social_twitter: siteData.social_twitter || '', social_youtube: siteData.social_youtube || '',
          social_instagram: siteData.social_instagram || '', social_whatsapp: siteData.social_whatsapp || '',
          maintenance_mode: siteData.maintenance_mode || false
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return
    try {
      setSaving(true); setMessage({ type: '', text: '' })
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() })
      if (error) throw error
      setMessage({ type: 'success', text: 'Profile saved successfully!' })
    } catch (error) {
      console.error('Save error:', error); setMessage({ type: 'error', text: 'Failed to save profile' })
    } finally { setSaving(false) }
  }

  const saveSiteSettings = async () => {
    try {
      setSaving(true); setMessage({ type: '', text: '' })
      const { data: existing } = await supabase.from('site_settings').select('id').limit(1).maybeSingle()
      const settingsData = { ...siteSettings, updated_at: new Date().toISOString() }
      if (existing) {
        const { error } = await supabase.from('site_settings').update(settingsData).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('site_settings').insert(settingsData)
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Save error:', error); setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally { setSaving(false) }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return
    try {
      setUploadingAvatar(true)
      const publicUrl = await uploadFile('avatars', file, 'avatars')
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      setMessage({ type: 'success', text: 'Avatar uploaded. Click Save Profile to keep it.' })
    } catch (error) {
      // Previously every failure reported "Storage bucket avatars not found",
      // which hid the real cause (the bucket had no INSERT policy at all).
      console.error('Avatar upload error:', error)
      setMessage({ type: 'error', text: 'Avatar upload failed: ' + error.message })
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const bg = isDark ? 'bg-gray-800' : 'bg-white'
  const bgSub = isDark ? 'bg-gray-700/50' : 'bg-gray-50'
  const border = isDark ? 'border-gray-700' : 'border-gray-200'
  const text = isDark ? 'text-white' : 'text-gray-900'
  const textSub = isDark ? 'text-gray-300' : 'text-gray-600'
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500'
  const inputBg = isDark ? 'bg-gray-900/50 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
  const focusRing = 'focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500'

  const tabs = [
    { id: 'public', label: 'Public Profile', icon: FaUser },
    { id: 'site', label: 'Site Settings', icon: FaGlobe },
    { id: 'social', label: 'Social Links', icon: FaInstagram },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <FaSpinner className={`w-6 h-6 animate-spin ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${
          message.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {message.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
          {message.text}
        </div>
      )}

      <div className={`flex gap-1 p-1 rounded-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-600 text-white shadow-sm'
                  : `${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-white'}`
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'public' && (
        <div className="space-y-6">
          <div className={`${bg} rounded-xl border ${border} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10"><FaUser className="w-5 h-5 text-yellow-600" /></div>
              <div>
                <h3 className={`text-lg font-semibold ${text}`}>Public Profile</h3>
                <p className={`text-sm ${textMuted}`}>This information is visible to visitors on your website.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-yellow-500" />
              ) : (
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <FaUser className={`w-8 h-8 ${textMuted}`} />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" id="avatar-upload" disabled={uploadingAvatar} />
                  <label htmlFor="avatar-upload" className={`inline-flex items-center gap-2 px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg cursor-pointer transition text-sm font-medium ${uploadingAvatar ? 'opacity-60' : ''}`}>
                    <FaUpload /> {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                  </label>
                  {profile.avatar_url && (
                    <button type="button" onClick={() => setProfile({ ...profile, avatar_url: '' })}
                      className="text-sm text-red-400 hover:text-red-300 underline">Remove</button>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input type="url" value={profile.avatar_url} onChange={e => setProfile({ ...profile, avatar_url: e.target.value })}
                    placeholder="...or paste an image URL"
                    className={`text-sm px-3 py-1.5 rounded-lg border ${inputBg}`} />
                </div>
                <p className={`text-xs mt-1.5 ${textMuted}`}>Recommended: 400x400px, up to 5MB</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'full_name', required: true, placeholder: 'Your full name' },
                { label: 'Job Title', key: 'job_title', placeholder: 'e.g., Full-Stack Developer & Trader' },
                { label: 'Location', key: 'location', placeholder: 'e.g., Kigali, Rwanda' },
                { label: 'Hero Headline', key: 'headline', placeholder: 'Main headline on homepage' },
                { label: 'Hero Subheadline', key: 'subheadline', placeholder: 'Subtitle under headline' },
              ].map(field => (
                <div key={field.key}>
                  <label className={`block text-sm font-medium mb-1.5 ${textSub}`}>{field.label}{field.required && ' *'}</label>
                  <input
                    type="text"
                    value={profile[field.key]}
                    onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className={`w-full px-4 py-2.5 rounded-lg border outline-none transition ${inputBg} ${focusRing}`}
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textSub}`}>Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none resize-none transition ${inputBg} ${focusRing}`}
                  placeholder="Short bio about yourself..."
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition text-sm"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {activeTab === 'site' && (
        <div className="space-y-6">
          <div className={`${bg} rounded-xl border ${border} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10"><FaGlobe className="w-5 h-5 text-yellow-600" /></div>
              <div>
                <h3 className={`text-lg font-semibold ${text}`}>Site Settings</h3>
                <p className={`text-sm ${textMuted}`}>Global configuration for your website.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textSub}`}>Site Name</label>
                <input
                  type="text"
                  value={siteSettings.site_name}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, site_name: e.target.value }))}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition ${inputBg} ${focusRing}`}
                  placeholder="Your site name"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textSub}`}>Site Description (SEO)</label>
                <textarea
                  value={siteSettings.site_description}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, site_description: e.target.value }))}
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none resize-none transition ${inputBg} ${focusRing}`}
                  placeholder="Description for search engines..."
                />
                <p className={`text-xs mt-1 ${textMuted}`}>This appears in Google search results</p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1.5 ${textSub} flex items-center gap-2`}>
                  <FaPalette className="w-4 h-4" /> Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={siteSettings.primary_color}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={siteSettings.primary_color}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className={`flex-1 px-4 py-2.5 rounded-lg border outline-none transition ${inputBg} ${focusRing}`}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              <div className={`flex items-center gap-3 p-4 rounded-lg border ${isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'}`}>
                <input
                  type="checkbox"
                  id="maintenance"
                  checked={siteSettings.maintenance_mode}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <label htmlFor="maintenance" className={`flex items-center gap-2 cursor-pointer font-medium ${text}`}>
                  <FaExclamationTriangle className="text-yellow-600" /> Maintenance Mode
                </label>
              </div>
              <p className={`text-xs ${textMuted} ml-8`}>
                When enabled, visitors will see a "Coming Soon" message instead of your site.
              </p>
            </div>
          </div>

          <button
            onClick={saveSiteSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition text-sm"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? 'Saving...' : 'Save Site Settings'}
          </button>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className={`${bg} rounded-xl border ${border} p-6`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/10"><FaInstagram className="w-5 h-5 text-yellow-600" /></div>
              <div>
                <h3 className={`text-lg font-semibold ${text}`}>Social Links</h3>
                <p className={`text-sm ${textMuted}`}>Your social media profiles (visible to visitors).</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: 'WhatsApp Number', key: 'social_whatsapp', icon: FaWhatsapp, placeholder: '250794144738 (without +)', help: 'Format: country code + number, no spaces or +' },
                { label: 'GitHub URL', key: 'social_github', icon: FaGithub, placeholder: 'https://github.com/yourusername' },
                { label: 'LinkedIn URL', key: 'social_linkedin', icon: FaLinkedin, placeholder: 'https://linkedin.com/in/yourusername' },
                { label: 'X (Twitter) URL', key: 'social_twitter', icon: FaTwitter, placeholder: 'https://x.com/yourusername' },
                { label: 'YouTube URL', key: 'social_youtube', icon: FaYoutube, placeholder: 'https://youtube.com/@yourchannel' },
                { label: 'Instagram URL', key: 'social_instagram', icon: FaInstagram, placeholder: 'https://instagram.com/yourusername' },
              ].map(field => {
                const Icon = field.icon
                return (
                  <div key={field.key}>
                    <label className={`block text-sm font-medium mb-1.5 ${textSub} flex items-center gap-2`}>
                      <Icon className="w-4 h-4" /> {field.label}
                    </label>
                    <input
                      type="url"
                      value={siteSettings[field.key]}
                      onChange={(e) => setSiteSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className={`w-full px-4 py-2.5 rounded-lg border outline-none transition ${inputBg} ${focusRing}`}
                      placeholder={field.placeholder}
                    />
                    {field.help && <p className={`text-xs mt-1 ${textMuted}`}>{field.help}</p>}
                  </div>
                )
              })}
            </div>
          </div>

          <button
            onClick={saveSiteSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition text-sm"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
            {saving ? 'Saving...' : 'Save Social Links'}
          </button>
        </div>
      )}
    </div>
  )
}
