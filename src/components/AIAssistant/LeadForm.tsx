import { useState } from 'react'
import { Send } from 'lucide-react'

interface LeadFormProps {
  onSubmit: (data: LeadFormData) => void
  isSubmitting?: boolean
}

export interface LeadFormData {
  name: string
  email: string
  phone: string
  whatsapp: string
  company: string
  location: string
}

export default function LeadForm({ onSubmit, isSubmitting }: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>({
    name: '', email: '', phone: '', whatsapp: '', company: '', location: '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({})

  const validate = (): boolean => {
    const e: Partial<Record<keyof LeadFormData, string>> = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  const update = (field: keyof LeadFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const inputClass = (field: keyof LeadFormData) =>
    `w-full text-sm px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white transition-colors ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2.5">
      <p className="text-sm font-semibold text-gray-700">Your Contact Information</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 sm:col-span-1">
          <input required placeholder="Full Name *" className={inputClass('name')} value={form.name} onChange={e => update('name', e.target.value)} />
          {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <input required type="email" placeholder="Email *" className={inputClass('email')} value={form.email} onChange={e => update('email', e.target.value)} />
          {errors.email && <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <input required placeholder="Phone Number *" type="tel" className={inputClass('phone')} value={form.phone} onChange={e => update('phone', e.target.value)} />
          {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
        </div>
        <input placeholder="WhatsApp Number" className={inputClass('whatsapp')} value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input placeholder="Company Name" className={inputClass('company')} value={form.company} onChange={e => update('company', e.target.value)} />
        <input placeholder="Location (City, Country)" className={inputClass('location')} value={form.location} onChange={e => update('location', e.target.value)} />
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-yellow-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting ? 'Submitting...' : 'Generate Project Brief'}
        <Send size={14} />
      </button>
    </form>
  )
}
