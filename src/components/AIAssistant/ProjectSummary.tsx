import { CheckCircle, Edit3, ExternalLink } from 'lucide-react'

type DiscoveryAnswers = Record<string, string>

interface LeadData {
  userType: string
  projectType: string
  discovery: DiscoveryAnswers
  budget: string
  timeline: string
  name: string
  email: string
  phone: string
  whatsapp: string
  company: string
  location: string
}

interface ProjectSummaryProps {
  data: LeadData
  onConfirm: () => void
  onEdit: () => void
  isSubmitting?: boolean
  whatsappLink?: string | null
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .replace(/([a-z])([A-Z])/g, '$1 $2')
}

export default function ProjectSummary({ data, onConfirm, onEdit, isSubmitting, whatsappLink }: ProjectSummaryProps) {
  const discoveryEntries = Object.entries(data.discovery).filter(([, v]) => v.trim())

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="bg-white border border-yellow-200 rounded-xl overflow-hidden">
        <div className="bg-yellow-600 px-4 py-2.5">
          <h3 className="text-sm font-bold text-white">Project Summary</h3>
        </div>

        <div className="p-4 space-y-3 text-sm">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Client</p>
            <p className="text-gray-900 font-medium">{data.name}</p>
            {data.company && <p className="text-gray-600 text-xs">{data.company}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Client Type</p>
              <p className="text-gray-900">{data.userType}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Project Type</p>
              <p className="text-gray-900">{data.projectType}</p>
            </div>
          </div>

          {discoveryEntries.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Requirements</p>
              <div className="space-y-1">
                {discoveryEntries.map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-xs">
                    <span className="text-gray-500 min-w-[100px]">{formatKey(key)}:</span>
                    <span className="text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Budget</p>
              <p className="text-gray-900 font-medium">{data.budget}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Timeline</p>
              <p className="text-gray-900 font-medium">{data.timeline}</p>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Contact</p>
            <p className="text-gray-900 text-xs">{data.email}</p>
            <p className="text-gray-900 text-xs">{data.phone}</p>
            {data.whatsapp && <p className="text-gray-900 text-xs">WhatsApp: {data.whatsapp}</p>}
            {data.location && <p className="text-gray-600 text-xs">{data.location}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onConfirm} disabled={isSubmitting} className="flex-1 bg-yellow-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
          <CheckCircle size={14} />
          {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
        </button>
        <button onClick={onEdit} disabled={isSubmitting} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex items-center gap-1.5">
          <Edit3 size={14} /> Edit
        </button>
      </div>

      {whatsappLink && (
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 text-xs text-green-700 underline">
          <ExternalLink size={12} /> Chat on WhatsApp for faster response
        </a>
      )}
    </div>
  )
}
