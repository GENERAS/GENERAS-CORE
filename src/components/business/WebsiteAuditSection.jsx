import { useState } from 'react'
import { Search, CheckCircle, ArrowRight } from 'lucide-react'
import { submitLead } from '../../services/aiService'

export default function WebsiteAuditSection() {
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    websiteUrl: '',
    whatsappNumber: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await submitLead({
        name: formData.businessName,
        type: 'website_audit',
        industry: formData.industry,
        websiteUrl: formData.websiteUrl,
        whatsapp: formData.whatsappNumber,
        message: `Free website audit request from ${formData.businessName} (${formData.industry})`,
      })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          businessName: '',
          industry: '',
          websiteUrl: '',
          whatsappNumber: ''
        })
      }, 4000)
    } catch (err) {
      // Fallback to localStorage if API is unavailable
      const submissions = JSON.parse(localStorage.getItem('websiteAuditSubmissions') || '[]')
      submissions.push({
        ...formData,
        submittedAt: new Date().toISOString()
      })
      localStorage.setItem('websiteAuditSubmissions', JSON.stringify(submissions))
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          businessName: '',
          industry: '',
          websiteUrl: '',
          whatsappNumber: ''
        })
      }, 4000)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <section id="free-audit" className="py-20 bg-gradient-to-br from-yellow-50 to-amber-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get a Free Website & Google Visibility Audit
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Discover how your current online presence performs and get actionable recommendations to improve your visibility, attract more customers, and grow your business.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'Comprehensive website performance analysis',
                'Google Maps and local SEO assessment',
                'Mobile-friendliness and speed evaluation',
                'Customized improvement recommendations',
                'Delivered within 48 hours via WhatsApp'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              <span>No obligation • 100% Free</span>
            </div>
          </div>

          {/* Right Form */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Audit Requested!</h3>
                <p className="text-gray-600">
                  We'll analyze your website and send results to your WhatsApp within 48 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    placeholder="Your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                  >
                    <option value="">Select your industry</option>
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="clinic">Clinic</option>
                    <option value="tourism">Tourism</option>
                    <option value="car-rental">Car Rental</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="retail">Retail Store</option>
                    <option value="school">School</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors duration-200"
                    placeholder="2507XXXXXXXX"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Request Free Audit'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
