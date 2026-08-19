import { Clock, Smartphone, Search, MessageCircle, Code, MapPin, CheckCircle } from 'lucide-react'

const trustFactors = [
  {
    icon: Clock,
    title: 'Fast Delivery',
    description: 'We deliver projects on time with clear milestones and regular updates throughout the development process.'
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'All websites are designed mobile-first, ensuring perfect performance on smartphones, tablets, and desktops.'
  },
  {
    icon: Search,
    title: 'SEO Ready',
    description: 'Built with SEO best practices from the ground up, helping your business rank higher in search results.'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integration',
    description: 'Seamless WhatsApp integration for instant customer communication and higher conversion rates.'
  },
  {
    icon: Code,
    title: 'Modern Technology Stack',
    description: 'We use the latest technologies and frameworks to build fast, secure, and scalable websites.'
  },
  {
    icon: MapPin,
    title: 'Rwanda-Based Support',
    description: 'Local support team available in Rwanda timezone for quick responses and personalized service.'
  }
]

export default function TrustSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Businesses Work With Me
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Trusted by businesses across Rwanda for reliable, professional, and results-driven digital solutions
          </p>
        </div>

        {/* Trust Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustFactors.map((factor, index) => {
            const Icon = factor.icon
            return (
              <div
                key={index}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-yellow-500" />
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {factor.title}
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {factor.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 bg-gray-800 rounded-2xl p-8 border border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">50+</div>
              <div className="text-gray-400 text-sm">Projects Delivered</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">40+</div>
              <div className="text-gray-400 text-sm">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">5+</div>
              <div className="text-gray-400 text-sm">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">100%</div>
              <div className="text-gray-400 text-sm">Client Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#free-audit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200"
            >
              Get Free Audit
              <CheckCircle className="w-4 h-4" />
            </a>
            <a
              href="#free-audit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 border border-gray-700"
            >
              Get Free Audit
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
