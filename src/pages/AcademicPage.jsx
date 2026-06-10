import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FaFilePdf, FaAward, FaImages, FaBook, FaCalendar, FaSchool, 
  FaDownload, FaLock, FaLink, FaTimes, FaEye, FaUserTie, FaFileAlt 
} from 'react-icons/fa'
import LikeButton from '../components/likes/LikeButton'
import CommentsSection from '../components/comments/CommentsSection'
import Loader from '../components/common/Loader'

export default function AcademicPage() {
  const [levels, setLevels] = useState([])
  const [documents, setDocuments] = useState({})
  const [reports, setReports] = useState({})
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDocs, setSelectedDocs] = useState(null)
  const [showDocModal, setShowDocModal] = useState(false)
  const [selectedCert, setSelectedCert] = useState(null)
  
  // Level detail modal state
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [viewingFile, setViewingFile] = useState(null)

  useEffect(() => {
    loadAcademicData()
    loadCertificates()
    
    // Set up real-time subscriptions
    const channel = supabase
      .channel('academic-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_levels' },
        () => loadAcademicData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_documents' },
        () => loadAcademicData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'academic_level_reports' },
        () => loadAcademicData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'certificates' },
        () => loadCertificates()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadAcademicData = async () => {
    try {
      // Load all academic levels
      const { data: levelsData } = await supabase
        .from('academic_levels')
        .select('*')
        .order('display_order')

      if (levelsData) {
        setLevels(levelsData)
        
        // Load documents for each level
        const docsMap = {}
        const reportsMap = {}
        
        for (const level of levelsData) {
          // Load academic_documents
          const { data: docsData } = await supabase
            .from('academic_documents')
            .select('*')
            .eq('level_id', level.id)
          docsMap[level.id] = docsData || []
          
          // Load academic_level_reports
          const { data: reportsData } = await supabase
            .from('academic_level_reports')
            .select('*')
            .eq('level_id', level.id)
            .order('display_order')
          reportsMap[level.id] = reportsData || []
        }
        
        setDocuments(docsMap)
        setReports(reportsMap)
      }
    } catch (error) {
      console.error('Error loading academic data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCertificates = async () => {
    try {
      const { data } = await supabase
        .from('certificates')
        .select('*')
        .order('issue_date', { ascending: false })
      
      setCertificates(data || [])
    } catch (error) {
      console.error('Error loading certificates:', error)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-[yellow-600] text-white',
      building: 'bg-gray-200 text-gray-700',
      planned: 'bg-gray-200 text-gray-700'
    }
    const labels = {
      completed: '✓ Completed',
      building: '🚧 In Progress',
      planned: '📅 Planned'
    }
    return (
      <span className={`ml-3 px-2 py-1 rounded-full text-xs ${badges[status] || badges.planned}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getDocumentCounts = (levelId) => {
    const docs = documents[levelId] || []
    return {
      reports: docs.filter(d => d.document_type === 'report').length,
      certificates: docs.filter(d => d.document_type === 'certificate').length,
      photos: docs.filter(d => d.document_type === 'photo').length,
      books: docs.filter(d => d.document_type === 'book').length
    }
  }

  const getLevelReportCounts = (levelId) => {
    const levelReports = reports[levelId] || []
    return {
      schoolReports: levelReports.filter(r => r.report_type === 'school_report').length,
      uniformPhotos: levelReports.filter(r => r.report_type === 'uniform_photo').length,
      schoolPhotos: levelReports.filter(r => r.report_type === 'school_photo').length,
      total: levelReports.length
    }
  }

  const openDocumentViewer = (docs, type) => {
    setSelectedDocs({ docs, type })
    setShowDocModal(true)
  }

  const openLevelModal = (level) => {
    setSelectedLevel(level)
    setShowLevelModal(true)
  }

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'school_report': return <FaFileAlt className="text-[yellow-600]" />
      case 'uniform_photo': return <FaUserTie className="text-[yellow-600]" />
      case 'school_photo': return <FaImages className="text-[yellow-600]" />
      default: return <FaFileAlt className="text-[yellow-600]" />
    }
  }

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'school_report': return 'School Report'
      case 'uniform_photo': return 'Uniform Photo'
      case 'school_photo': return 'School Photo'
      default: return type.replace('_', ' ')
    }
  }

  const viewFile = (report) => {
    setViewingFile(report)
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVIGATION BAR */}
      <div className="sticky top-16 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[yellow-600] rounded-xl flex items-center justify-center">
                <FaAward className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">
                  Academic Journey
                </h1>
                <p className="text-xs text-gray-600">{levels.length} levels</p>
              </div>
            </div>

            {/* Quick Stats Row */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <FaSchool className="text-yellow-600" />
                <span className="text-gray-600">Levels:</span>
                <span className="font-semibold text-gray-800">{levels.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FaAward className="text-yellow-600" />
                <span className="text-gray-600">Certificates:</span>
                <span className="font-semibold text-gray-800">{certificates.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Sticky Navigation */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Main Navigation */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Filter
                </h3>
                <nav className="space-y-1">
                  {[
                    { id: 'all', icon: FaSchool, label: 'All Levels', count: levels.length },
                    { id: 'completed', icon: FaAward, label: 'Completed', count: levels.filter(l => l.status === 'completed').length },
                    { id: 'ongoing', icon: FaBook, label: 'Ongoing', count: levels.filter(l => l.status === 'ongoing').length },
                  ].map(item => (
                    <button
                      key={item.id}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 text-gray-600 hover:bg-gray-100"
                    >
                      <item.icon />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Overview
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Documents</span>
                    <span className="font-semibold text-gray-800">{Object.values(documents).flat().length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Reports</span>
                    <span className="font-semibold text-gray-800">{Object.values(reports).flat().length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* HERO SECTION */}
            <div className="bg-white rounded-3xl p-6 border border-gray-300">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img 
                      src="/owner-photo.jpg" 
                      alt="Generas Kagiraneza" 
                      loading="lazy" className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect fill='%23fbbf24' width='160' height='160'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%231f2937'%3EPhoto%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800">Academic Journey</h2>
                  <p className="text-gray-600">
                    From Nursery School to PhD - A complete timeline of my education, achievements, and growth
                  </p>
                </div>
              </div>
            </div>

            {/* TIMELINE */}
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[yellow-600]"></div>

              {levels.map((level) => {
                const docCounts = getDocumentCounts(level.id)
                const reportCounts = getLevelReportCounts(level.id)
                
                return (
                  <div key={level.id} className="relative mb-12">
                    {/* Timeline dot */}
                    <div className="absolute -left-8 top-2 w-4 h-4 rounded-full bg-[yellow-600] border-4 border-white shadow-sm"></div>
                    
                    <div className="bg-white rounded-2xl p-6 ml-4 border border-gray-300 hover:border-[yellow-600] transition-colors duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                      <div 
                        className="flex flex-wrap justify-between items-start mb-4 cursor-pointer"
                        onClick={() => openLevelModal(level)}
                      >
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold flex items-center flex-wrap text-gray-800">
                            {level.level_name}
                            {getStatusBadge(level.status)}
                          </h2>
                          <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <FaSchool className="text-[yellow-600]" />
                            <span>{level.school_name}</span>
                            <span>•</span>
                            <FaCalendar className="text-yellow-600" />
                            <span>{level.start_year} - {level.end_year}</span>
                          </div>
                        </div>
                        <button className="text-yellow-600 flex items-center gap-1 text-sm mt-2 md:mt-0">
                          <FaEye /> View Details
                        </button>
                      </div>

                      {level.description && (
                        <p className="text-gray-700 mb-4">{level.description}</p>
                      )}

                      {/* Combined Document & Report counters */}
                      <div className="flex flex-wrap gap-2">
                        {/* Legacy document counters */}
                        {docCounts.reports > 0 && (
                          <button
                            onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'report'), 'Reports')}
                            className="bg-yellow-50 rounded-lg px-3 py-2 text-center flex items-center gap-2 border border-yellow-200 hover:bg-yellow-100 transition-colors duration-200"
                          >
                            <FaFilePdf className="text-yellow-600" />
                            <span className="text-sm">{docCounts.reports} Reports</span>
                          </button>
                        )}
                        
                        {docCounts.certificates > 0 && (
                          <button
                            onClick={() => openDocumentViewer(documents[level.id]?.filter(d => d.document_type === 'certificate'), 'Certificates')}
                            className="bg-yellow-50 rounded-lg px-3 py-2 text-center flex items-center gap-2 border border-yellow-200 hover:bg-yellow-100 transition-colors duration-200"
                          >
                            <FaAward className="text-yellow-600" />
                            <span className="text-sm">{docCounts.certificates} Certs</span>
                          </button>
                        )}

                        {/* New report/photo counters */}
                        {reportCounts.schoolReports > 0 && (
                          <button
                            onClick={() => openLevelModal(level)}
                            className="bg-red-50 rounded-lg px-3 py-2 text-center flex items-center gap-2 border border-red-200 hover:bg-red-100 transition-colors duration-200"
                          >
                            <FaFileAlt className="text-red-600" />
                            <span className="text-sm">{reportCounts.schoolReports} School Reports</span>
                          </button>
                        )}
                        
                        {reportCounts.uniformPhotos > 0 && (
                          <button
                            onClick={() => openLevelModal(level)}
                            className="bg-indigo-50 rounded-lg px-3 py-2 text-center flex items-center gap-2 border border-indigo-200 hover:bg-indigo-100 transition-colors duration-200"
                          >
                            <FaUserTie className="text-indigo-600" />
                            <span className="text-sm">{reportCounts.uniformPhotos} Uniform Photos</span>
                          </button>
                        )}
                        
                        {reportCounts.schoolPhotos > 0 && (
                          <button
                            onClick={() => openLevelModal(level)}
                            className="bg-yellow-50 rounded-lg px-3 py-2 text-center flex items-center gap-2 border border-yellow-200 hover:bg-yellow-100 transition-colors duration-200"
                          >
                            <FaImages className="text-yellow-600" />
                            <span className="text-sm">{reportCounts.schoolPhotos} School Photos</span>
                          </button>
                        )}
                        
                        {reportCounts.total > 0 && (
                          <button
                            onClick={() => openLevelModal(level)}
                            className="bg-[yellow-600] text-white rounded-lg px-3 py-2 text-center flex items-center gap-2 hover:bg-[#8a5c7f] transition-colors duration-200"
                          >
                            <FaEye />
                            <span className="text-sm">View All ({reportCounts.total})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Certificates Section */}
            {certificates.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                  <FaAward className="text-yellow-600" />
                  My Certificates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {certificates.map(cert => (
                    <div key={cert.id} className="bg-white rounded-2xl shadow-xl p-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 cursor-pointer" onClick={() => setSelectedCert(cert)}>
                          <h3 className="font-bold text-lg text-gray-800">{cert.title}</h3>
                          <p className="text-sm text-gray-600">{cert.issuer}</p>
                          {cert.issue_date && (
                            <p className="text-xs text-gray-500 mt-1">
                              📅 Issued: {new Date(cert.issue_date).toLocaleDateString()}
                            </p>
                          )}
                          <div className="flex gap-3 mt-3">
                            {cert.certificate_url && (
                              <a
                                href={cert.certificate_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-600 text-sm flex items-center gap-1 hover:text-yellow-700 transition-colors duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Certificate →
                              </a>
                            )}
                          </div>
                        </div>
                        <LikeButton contentType="certificate" contentId={cert.id} initialLikes={cert.likes || 0} />
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <CommentsSection contentType="certificate" contentId={cert.id} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR - Stats */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <FaSchool className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{levels.length}</p>
                  <p className="text-xs text-gray-600">Levels</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 bg-yellow-100">
                    <FaAward className="text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{certificates.length}</p>
                  <p className="text-xs text-gray-600">Certificates</p>
                </div>
              </div>

              {/* Progress Overview */}
              <div className="bg-white rounded-2xl p-4 border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  Progress
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold text-gray-800">{levels.filter(l => l.status === 'completed').length}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-600 transition-all duration-300"
                        style={{ width: `${(levels.filter(l => l.status === 'completed').length / levels.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== LEVEL DETAIL MODAL (Two Column Layout) ====== */}
      {showLevelModal && selectedLevel && (
        <div 
          className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 p-4"
          onClick={() => setShowLevelModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-gray-300 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                  {selectedLevel.level_name}
                  {selectedLevel.status === 'completed' && <span className="text-yellow-600 text-lg">✓</span>}
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedLevel.school_name} • {selectedLevel.start_year} - {selectedLevel.end_year}
                </p>
              </div>
              <button 
                onClick={() => setShowLevelModal(false)} 
                className="text-gray-600 p-2"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Two Column Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                {/* LEFT COLUMN: Level Info */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-yellow-600 mb-2 flex items-center gap-2">
                      <FaSchool /> School Information
                    </h4>
                    <div className="bg-yellow-50 rounded-lg p-4 space-y-2 border border-yellow-200">
                      <p><span className="text-gray-600">School:</span> {selectedLevel.school_name}</p>
                      <p><span className="text-gray-600">Period:</span> {selectedLevel.start_year} - {selectedLevel.end_year}</p>
                      <p><span className="text-gray-600">Status:</span> 
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                          selectedLevel.status === 'completed' ? 'bg-[yellow-600] text-white' :
                          selectedLevel.status === 'building' ? 'bg-gray-200 text-gray-700' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {selectedLevel.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedLevel.description && (
                    <div>
                      <h4 className="text-lg font-semibold text-[yellow-600] mb-2">Description</h4>
                      <p className="text-gray-600 leading-relaxed">{selectedLevel.description}</p>
                    </div>
                  )}

                  {/* Legacy Documents Summary */}
                  {(() => {
                    const docs = documents[selectedLevel.id] || []
                    const hasDocs = docs.length > 0
                    if (!hasDocs) return null
                    
                    return (
                      <div>
                        <h4 className="text-lg font-semibold text-yellow-600 mb-2">Documents</h4>
                        <div className="flex flex-wrap gap-2">
                          {docs.filter(d => d.document_type === 'report').length > 0 && (
                            <button
                              onClick={() => {
                                setShowLevelModal(false)
                                openDocumentViewer(docs.filter(d => d.document_type === 'report'), 'Reports')
                              }}
                              className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1 border border-yellow-200 hover:bg-yellow-200 transition-colors duration-200"
                            >
                              <FaFilePdf /> {docs.filter(d => d.document_type === 'report').length} Reports
                            </button>
                          )}
                          {docs.filter(d => d.document_type === 'certificate').length > 0 && (
                            <button
                              onClick={() => {
                                setShowLevelModal(false)
                                openDocumentViewer(docs.filter(d => d.document_type === 'certificate'), 'Certificates')
                              }}
                              className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm flex items-center gap-1 border border-yellow-200 hover:bg-yellow-200 transition-colors duration-200"
                            >
                              <FaAward /> {docs.filter(d => d.document_type === 'certificate').length} Certs
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* RIGHT COLUMN: Reports & Photos */}
                <div>
                  <h4 className="text-lg font-semibold text-purple-600 mb-4 flex items-center gap-2">
                    <FaImages /> Reports & Photos
                  </h4>
                  
                  {(() => {
                    const levelReports = reports[selectedLevel.id] || []
                    
                    if (levelReports.length === 0) {
                      return (
                        <div className="bg-purple-50 rounded-lg p-8 text-center border border-purple-200">
                          <FaImages className="text-purple-400 text-4xl mx-auto mb-3" />
                          <p className="text-gray-600">No reports or photos available for this level yet.</p>
                        </div>
                      )
                    }

                    return (
                      <div className="space-y-4">
                        {/* Summary counts */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {levelReports.filter(r => r.report_type === 'school_report').length > 0 && (
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs border border-red-200">
                              Reports: {levelReports.filter(r => r.report_type === 'school_report').length}
                            </span>
                          )}
                          {levelReports.filter(r => r.report_type === 'uniform_photo').length > 0 && (
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs border border-indigo-200">
                              Uniform: {levelReports.filter(r => r.report_type === 'uniform_photo').length}
                            </span>
                          )}
                          {levelReports.filter(r => r.report_type === 'school_photo').length > 0 && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs border border-yellow-200">
                              Photos: {levelReports.filter(r => r.report_type === 'school_photo').length}
                            </span>
                          )}
                        </div>

                        {/* Reports Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {levelReports.map(report => (
                            <div 
                              key={report.id}
                              onClick={() => viewFile(report)}
                              className="bg-white rounded-lg overflow-hidden cursor-pointer border border-gray-300 hover:border-purple-400 transition-colors duration-200"
                            >
                              {/* Thumbnail or Preview */}
                              <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                {report.thumbnail_url ? (
                                  <img 
                                    src={report.thumbnail_url} 
                                    alt={report.title}
                                    loading="lazy" className="w-full h-full object-cover"
                                  />
                                ) : report.file_url?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                                  <img 
                                    src={report.file_url} 
                                    alt={report.title}
                                    loading="lazy" className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-5xl">{getReportTypeIcon(report.report_type)}</span>
                                  </div>
                                )}
                                
                                {/* Type badge */}
                                <div className="absolute top-2 left-2">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    report.report_type === 'school_report' ? 'bg-[yellow-600] text-white' :
                                    report.report_type === 'uniform_photo' ? 'bg-gray-200 text-gray-700' :
                                    'bg-gray-200 text-gray-700'
                                  }`}>
                                    {getReportTypeLabel(report.report_type)}
                                  </span>
                                </div>
                                
                                {/* Featured badge */}
                                {report.is_featured && (
                                  <div className="absolute top-2 right-2">
                                    <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded font-bold">
                                      ⭐ Featured
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Info */}
                              <div className="p-3">
                                <h5 className="font-medium text-sm truncate text-gray-800">{report.title}</h5>
                                {report.academic_year && (
                                  <p className="text-xs text-gray-600">{report.academic_year}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal (for reports/photos) */}
      {viewingFile && (
        <div 
          className="fixed inset-0 bg-gray-100 flex items-center justify-center z-[60] p-4"
          onClick={() => setViewingFile(null)}
        >
          <button 
            onClick={() => setViewingFile(null)}
            className="absolute top-4 right-4 text-gray-600 text-2xl z-10"
          >
            <FaTimes />
          </button>
          <div 
            className="max-w-5xl max-h-[90vh] w-full bg-white rounded-lg p-4" 
            onClick={(e) => e.stopPropagation()}
          >
            {viewingFile.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={viewingFile.file_url} 
                alt={viewingFile.title}
                loading="lazy" className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            ) : viewingFile.file_url?.match(/\.pdf$/i) ? (
              <iframe 
                src={viewingFile.file_url} 
                className="w-full h-[80vh]"
                title={viewingFile.title}
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                <p className="text-xl mb-4">{getReportTypeIcon(viewingFile.report_type)}</p>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{viewingFile.title}</h3>
                <a 
                  href={viewingFile.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[yellow-600] text-white px-4 py-2 rounded inline-flex items-center gap-2 hover:bg-[#8a5c7f] transition-colors duration-200"
                >
                  <FaDownload /> Download/View File
                </a>
              </div>
            )}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-gray-900">{viewingFile.title}</h3>
              <p className="text-gray-600">
                {getReportTypeLabel(viewingFile.report_type)}
                {viewingFile.academic_year && ` • ${viewingFile.academic_year}`}
              </p>
              {viewingFile.description && (
                <p className="text-gray-500 mt-2 max-w-xl mx-auto">{viewingFile.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Lightbox */}
      {selectedCert && (
        <div 
          className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCert(null)}
        >
          <button 
            onClick={() => setSelectedCert(null)}
            className="absolute top-4 right-4 text-gray-600 text-2xl z-10"
          >
            <FaTimes />
          </button>
          <div className="max-w-4xl max-h-[90vh] bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
            {selectedCert.certificate_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img 
                src={selectedCert.certificate_url} 
                alt={selectedCert.title}
                loading="lazy" className="max-w-full max-h-[85vh] object-contain mx-auto"
              />
            ) : (
              <iframe 
                src={selectedCert.certificate_url} 
                className="w-full h-[80vh]"
                title={selectedCert.title}
              />
            )}
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-gray-900">{selectedCert.title}</h3>
              <p className="text-gray-600">{selectedCert.issuer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal (Legacy) */}
      {showDocModal && selectedDocs && (
        <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">{selectedDocs.type}</h3>
              <button onClick={() => setShowDocModal(false)} className="text-gray-600">
                <FaTimes />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {selectedDocs.docs?.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No documents found.</p>
              ) : (
                selectedDocs.docs?.map((doc, index) => (
                  <div key={doc.id || index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-600">{doc.upload_date || 'No date'}</p>
                    </div>
                    <div className="flex gap-2">
                      {doc.is_premium && <FaLock className="text-[yellow-600]" />}
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[yellow-600] text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 hover:bg-[#8a5c7f] transition-colors duration-200"
                        >
                          <FaDownload /> View
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}