import { Globe, Smartphone, MapPin, Search, MessageCircle, CreditCard, Building, ShoppingBag, Utensils, Stethoscope, Plane, ArrowRight } from 'lucide-react'

const solutions = [
  {
    icon: Globe,
    title: 'Business Websites',
    description: 'Professional, responsive websites that showcase your business and attract customers.',
    benefit: 'Increase online visibility and credibility',
    cta: 'Get Started'
  },
  {
    icon: Building,
    title: 'Hotel Websites',
    description: 'Booking systems, room showcases, and direct reservation capabilities.',
    benefit: 'Boost direct bookings and reduce commission fees',
    cta: 'Learn More'
  },
  {
    icon: Utensils,
    title: 'Restaurant Websites',
    description: 'Menu displays, online ordering, and table reservation systems.',
    benefit: 'Streamline operations and increase orders',
    cta: 'View Demo'
  },
  {
    icon: Stethoscope,
    title: 'Clinic Websites',
    description: 'Appointment scheduling, patient information, and service listings.',
    benefit: 'Improve patient experience and accessibility',
    cta: 'See Features'
  },
  {
    icon: Plane,
    title: 'Tourism Websites',
    description: 'Tour packages, booking systems, and destination showcases.',
    benefit: 'Attract more tourists and increase bookings',
    cta: 'Explore'
  },
  {
    icon: ShoppingBag,
    title: 'E-Commerce Websites',
    description: 'Online stores with payment integration and inventory management.',
    benefit: 'Sell products 24/7 and reach more customers',
    cta: 'Start Selling'
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Conversion Systems',
    description: 'Integrated WhatsApp chat for instant customer communication.',
    benefit: 'Convert visitors into customers faster',
    cta: 'Integrate'
  },
  {
    icon: MapPin,
    title: 'Google Maps Optimization',
    description: 'Local SEO and Google Business Profile optimization.',
    benefit: 'Get found by local customers searching nearby',
    cta: 'Optimize'
  },
  {
    icon: Search,
    title: 'Local SEO',
    description: 'Search engine optimization tailored for local businesses.',
    benefit: 'Rank higher in local search results',
    cta: 'Boost Rankings'
  },
  {
    icon: CreditCard,
    title: 'Mobile Money Integration',
    description: 'MTN MoMo and Airtel Money payment integration.',
    benefit: 'Accept payments easily from Rwandan customers',
    cta: 'Integrate Payments'
  }
]

export default function BusinessSolutions() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Helping Local Businesses Grow Online
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your business with professional digital solutions tailored for the Rwandan market
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, index) => {
            const Icon = solution.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-yellow-500 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-yellow-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {solution.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {solution.description}
                </p>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-700 font-medium">
                    {solution.benefit}
                  </p>
                </div>
                
                <a
                  href="#free-audit"
                  className="inline-flex items-center gap-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors duration-200"
                >
                  {solution.cta}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <a
            href="#free-audit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Get Free Website Audit
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
