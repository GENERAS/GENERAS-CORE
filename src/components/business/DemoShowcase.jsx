import { Building, Utensils, Stethoscope, Plane, Home, ExternalLink, Star, Calendar, MapPin, Smartphone, CreditCard } from 'lucide-react'

const demos = [
  {
    title: 'Hotel Demo',
    icon: Building,
    thumbnail: '/demo-hotel.jpg',
    features: ['Room Booking System', 'Photo Gallery', 'Reviews & Ratings', 'Contact Form'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Restaurant Demo',
    icon: Utensils,
    thumbnail: '/demo-restaurant.jpg',
    features: ['Digital Menu', 'Online Ordering', 'Table Reservation', 'Location Map'],
    color: 'from-orange-500 to-orange-600'
  },
  {
    title: 'Clinic Demo',
    icon: Stethoscope,
    thumbnail: '/demo-clinic.jpg',
    features: ['Appointment Booking', 'Doctor Profiles', 'Service Listings', 'Patient Portal'],
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Tourism Demo',
    icon: Plane,
    thumbnail: '/demo-tourism.jpg',
    features: ['Tour Packages', 'Booking System', 'Destination Gallery', 'Itinerary Builder'],
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Real Estate Demo',
    icon: Home,
    thumbnail: '/demo-realestate.jpg',
    features: ['Property Listings', 'Virtual Tours', 'Search & Filter', 'Lead Forms'],
    color: 'from-rose-500 to-rose-600'
  }
]

const featureIcons = {
  'Room Booking System': Calendar,
  'Photo Gallery': Star,
  'Reviews & Ratings': Star,
  'Contact Form': Smartphone,
  'Digital Menu': Smartphone,
  'Online Ordering': CreditCard,
  'Table Reservation': Calendar,
  'Location Map': MapPin,
  'Appointment Booking': Calendar,
  'Doctor Profiles': Star,
  'Service Listings': Star,
  'Patient Portal': Smartphone,
  'Tour Packages': Star,
  'Booking System': Calendar,
  'Destination Gallery': Star,
  'Itinerary Builder': Star,
  'Property Listings': Star,
  'Virtual Tours': Star,
  'Search & Filter': Star,
  'Lead Forms': Smartphone
}

export default function DemoShowcase() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Business Website Demos
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what your business website could look like with our professional solutions
          </p>
        </div>

        {/* Demos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {demos.map((demo, index) => {
            const Icon = demo.icon
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-yellow-500 transition-all duration-300 group"
              >
                {/* Thumbnail */}
                <div className={`h-48 bg-gradient-to-br ${demo.color} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <Icon className="w-16 h-16 text-white relative z-10" />
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-900">
                    Demo
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {demo.title}
                  </h3>

                  <div className="space-y-3 mb-6">
                    {demo.features.map((feature, fIndex) => {
                      const FeatureIcon = featureIcons[feature] || Star
                      return (
                        <div key={fIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <FeatureIcon className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      )
                    })}
                  </div>

                  <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 group-hover:border-yellow-500 group-hover:text-yellow-600">
                    View Demo
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want a custom demo for your specific business?
          </p>
          <a
            href="#free-audit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Request Custom Demo
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
