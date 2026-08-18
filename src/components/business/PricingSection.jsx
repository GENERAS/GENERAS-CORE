import { Check, Star, ArrowRight, Zap } from 'lucide-react'

const packages = [
  {
    name: 'Starter Package',
    price: 'From 300,000 RWF',
    description: 'Perfect for small businesses getting started online',
    features: [
      'Responsive Website Design',
      'WhatsApp Integration',
      'Contact Form',
      'Mobile Optimization',
      'Basic SEO Setup',
      '1 Month Support',
      'Free Domain (1 Year)',
      'SSL Certificate'
    ],
    popular: false,
    color: 'from-gray-500 to-gray-600'
  },
  {
    name: 'Growth Package',
    price: 'From 600,000 RWF',
    description: 'Ideal for businesses ready to expand their reach',
    features: [
      'Everything in Starter',
      'Advanced SEO Setup',
      'Google Maps Optimization',
      'Analytics Dashboard',
      'Social Media Integration',
      'Blog Section',
      '3 Months Support',
      'Performance Optimization'
    ],
    popular: true,
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    name: 'Premium Package',
    price: 'From 1,200,000 RWF',
    description: 'Complete digital transformation for established businesses',
    features: [
      'Everything in Growth',
      'Booking Systems',
      'Mobile Money Integration',
      'E-commerce Capabilities',
      'Custom Features',
      'Priority Support',
      '6 Months Support',
      'Quarterly Maintenance',
      'Advanced Analytics'
    ],
    popular: false,
    color: 'from-gray-900 to-gray-800'
  }
]

export default function PricingSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pricing Packages
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Choose the package that fits your business needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 border-2 ${
                pkg.popular 
                  ? 'border-yellow-500 shadow-2xl scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              } transition-all duration-300`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className={`w-12 h-12 bg-gradient-to-br ${pkg.color} rounded-xl flex items-center justify-center mb-6`}>
                <Zap className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {pkg.name}
              </h3>
              
              <p className="text-gray-600 mb-4 text-sm">
                {pkg.description}
              </p>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{pkg.price}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#free-audit"
                className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  pkg.popular
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>

        {/* Custom Quote CTA */}
        <div className="text-center bg-white rounded-2xl p-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-600 mb-6">
            Every business is unique. Let's discuss your specific requirements and create a tailored solution.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Request Custom Quote
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
