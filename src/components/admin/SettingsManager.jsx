import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// Inline SVG icons
const IconUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const IconGlobe = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)

const IconLock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const IconSave = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
)

const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const IconUpload = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
)

const IconGithub = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
)

const IconLinkedin = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)

const IconTwitter = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)

const IconYoutube = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)

const IconInstagram = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

const IconWhatsapp = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.13 1.56 5.929L0 24l6.335-1.652c1.725.94 3.652 1.427 5.511 1.428h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.35-8.413"/>
  </svg>
)

const IconLoader = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const IconPalette = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
)

const IconAlert = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

export default function SettingsManager() {
  const [activeTab, setActiveTab] = useState('public')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [user, setUser] = useState(null)
  
  // Public Profile State
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    job_title: '',
    headline: '',
    subheadline: '',
    location: '',
    avatar_url: ''
  })
  
  // Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    site_name: '',
    site_description: '',
    primary_color: '#3b82f6',
    social_github: '',
    social_linkedin: '',
    social_twitter: '',
    social_youtube: '',
    social_instagram: '',
    social_whatsapp: '',
    maintenance_mode: false
  })

  // Load data on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      
      if (!currentUser) {
        setMessage({ type: 'error', text: 'Not authenticated' })
        return
      }
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile load error:', profileError)
      }
      
      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          job_title: profileData.job_title || '',
          headline: profileData.headline || '',
          subheadline: profileData.subheadline || '',
          location: profileData.location || '',
          avatar_url: profileData.avatar_url || ''
        })
      }
      
      // Load site settings (get first row)
      const { data: siteData, error: siteError } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single()
        
      if (siteError && siteError.code !== 'PGRST116') {
        console.error('Site settings load error:', siteError)
      }
      
      if (siteData) {
        setSiteSettings({
          site_name: siteData.site_name || '',
          site_description: siteData.site_description || '',
          primary_color: siteData.primary_color || '#3b82f6',
          social_github: siteData.social_github || '',
          social_linkedin: siteData.social_linkedin || '',
          social_twitter: siteData.social_twitter || '',
          social_youtube: siteData.social_youtube || '',
          social_instagram: siteData.social_instagram || '',
          social_whatsapp: siteData.social_whatsapp || '',
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
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        })
        
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Profile saved successfully!' })
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Failed to save profile' })
    } finally {
      setSaving(false)
    }
  }

  const saveSiteSettings = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      // Get existing settings or create new
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .single()
        
      const settingsData = {
        ...siteSettings,
        updated_at: new Date().toISOString()
      }
      
      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update(settingsData)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert(settingsData)
        if (error) throw error
      }
      
      setMessage({ type: 'success', text: 'Site settings saved successfully!' })
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Failed to save site settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !user) return
    
    try {
      setSaving(true)
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)
        
      if (uploadError) {
        // If bucket doesn't exist, show helpful message
        if (uploadError.message.includes('bucket')) {
          setMessage({ 
            type: 'error', 
            text: 'Storage bucket "avatars" not found. Please create it in Supabase Dashboard > Storage.' 
          })
          return
        }
        throw uploadError
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
        
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }))
      setMessage({ type: 'success', text: 'Avatar uploaded! Click Save to update profile.' })
    } catch (error) {
      console.error('Upload error:', error)
      setMessage({ type: 'error', text: 'Failed to upload avatar' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader />
        <span className="ml-2 text-gray-400">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Message Banner */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
          'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <IconCheck /> : <IconAlert />}
          {message.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-slate-700 pb-4">
        <button
          onClick={() => setActiveTab('public')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'public' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          <IconUser /> Public Profile
        </button>
        <button
          onClick={() => setActiveTab('site')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'site' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          <IconGlobe /> Site Settings
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            activeTab === 'social' ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
          }`}
        >
          <IconInstagram /> Social Links
        </button>
      </div>

      {/* Public Profile Tab */}
      {activeTab === 'public' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <IconUser /> Public Profile
          </h3>
          <p className="text-gray-400 text-sm">
            This information is visible to visitors on your website.
          </p>

          {/* Avatar Upload */}
          <div className="bg-slate-800/50 rounded-xl p-6">
            <label className="block text-sm font-medium mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  loading="lazy" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                  <IconUser />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <label
                  htmlFor="avatar-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition"
                >
                  <IconUpload /> Upload Photo
                </label>
                <p className="text-xs text-gray-500 mt-2">Recommended: 400x400px, max 2MB</p>
              </div>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
              <input
                type="text"
                value={profile.job_title}
                onChange={(e) => setProfile(prev => ({ ...prev, job_title: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Full-Stack Developer & Trader"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="e.g., Kigali, Rwanda"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Short bio about yourself..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hero Headline</label>
              <input
                type="text"
                value={profile.headline}
                onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Main headline on homepage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hero Subheadline</label>
              <input
                type="text"
                value={profile.subheadline}
                onChange={(e) => setProfile(prev => ({ ...prev, subheadline: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Subtitle under headline"
              />
            </div>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg font-medium transition"
          >
            {saving ? <IconLoader /> : <IconSave />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {/* Site Settings Tab */}
      {activeTab === 'site' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <IconGlobe /> Site Settings
          </h3>
          <p className="text-gray-400 text-sm">
            Global configuration for your website.
          </p>

          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
              <input
                type="text"
                value={siteSettings.site_name}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, site_name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Your site name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Description (SEO)</label>
              <textarea
                value={siteSettings.site_description}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, site_description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Description for search engines..."
              />
              <p className="text-xs text-gray-500 mt-1">This appears in Google search results</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconPalette /> Primary Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={siteSettings.primary_color}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={siteSettings.primary_color}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <input
                type="checkbox"
                id="maintenance"
                checked={siteSettings.maintenance_mode}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, maintenance_mode: e.target.checked }))}
                className="w-5 h-5 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="maintenance" className="flex items-center gap-2 cursor-pointer">
                <IconAlert />
                <span className="font-medium">Maintenance Mode</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 ml-8">
              When enabled, visitors will see a "Coming Soon" message instead of your site.
            </p>
          </div>

          <button
            onClick={saveSiteSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg font-medium transition"
          >
            {saving ? <IconLoader /> : <IconSave />}
            {saving ? 'Saving...' : 'Save Site Settings'}
          </button>
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <IconInstagram /> Social Links
          </h3>
          <p className="text-gray-400 text-sm">
            Your social media profiles (visible to visitors).
          </p>

          <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconWhatsapp /> WhatsApp Number
              </label>
              <input
                type="text"
                value={siteSettings.social_whatsapp}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, social_whatsapp: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="250794144738 (without +)"
              />
              <p className="text-xs text-gray-500 mt-1">Format: country code + number, no spaces or +</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconGithub /> GitHub URL
              </label>
              <input
                type="url"
                value={siteSettings.social_github}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, social_github: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconLinkedin /> LinkedIn URL
              </label>
              <input
                type="url"
                value={siteSettings.social_linkedin}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, social_linkedin: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconTwitter /> X (Twitter) URL
              </label>
              <input
                type="url"
                value={siteSettings.social_twitter}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, social_twitter: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://x.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconYoutube /> YouTube URL
              </label>
              <input
                type="url"
                value={siteSettings.social_youtube}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, social_youtube: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <IconInstagram /> Instagram URL
              </label>
              <input
                type="url"
                value={siteSettings.social_instagram}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, social_instagram: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="https://instagram.com/yourusername"
              />
            </div>
          </div>

          <button
            onClick={saveSiteSettings}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg font-medium transition"
          >
            {saving ? <IconLoader /> : <IconSave />}
            {saving ? 'Saving...' : 'Save Social Links'}
          </button>
        </div>
      )}
    </div>
  )
}
