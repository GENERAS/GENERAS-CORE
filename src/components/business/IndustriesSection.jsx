import { Building, Utensils, Stethoscope, Plane, Car, Home, ShoppingBag, GraduationCap, ArrowRight, CheckCircle } from 'lucide-react'

const industries = [
  {
    icon: Building,
    name: 'Hotels',
    problem: 'Struggling with low direct bookings and high commission fees from OTAs',
    solution: 'Custom booking websites with direct reservation systems, reducing dependency on third-party platforms'
  },
  {
    icon: Utensils,
    name: 'Restaurants',
    problem: 'Difficulty managing orders and reservations efficiently',
    solution: 'Online ordering systems, digital menus, and table reservation platforms'
  },
  {
    icon: Plane,
    name: 'Tourism Companies',
    problem: 'Limited online presence and complex booking processes',
    solution: 'Tour package websites with integrated booking and payment systems'
  },
  {
    icon: Car,
    name: 'Car Rentals',
    problem: 'Manual booking processes and poor fleet visibility online',
    solution: 'Fleet management websites with real-time availability and booking'
  },
  {
    icon: Stethoscope,
    name: 'Clinics',
    problem: 'Inefficient appointment scheduling and patient communication',
    solution: 'Appointment booking systems and patient information portals'
  },
  {
    icon: Home,
    name: 'Real Estate',
    problem: 'Difficulty showcasing properties and managing inquiries',
    solution: 'Property listing websites with virtual tours and lead management'
  },
  {
    icon: ShoppingBag,
    name: 'Retail Stores',
    problem: 'Limited to physical location sales and poor inventory management',
    solution: 'E-commerce platforms with inventory and order management'
  },
  {
    icon: GraduationCap,
    name: 'Schools',
    problem: 'Inefficient communication with parents and students',
    solution: 'School management systems with portals for students and parents'
  }
]

export default function IndustriesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Industries We Serve
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert digital solutions tailored for specific business sectors in Rwanda
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((industry, index) => {
            const Icon = industry.icon
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-yellow-500 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                  <Icon className="w-6 h-6 text-yellow-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {industry.name}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-1">Challenge</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {industry.problem}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Our Solution</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {industry.solution}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Don't see your industry? We work with businesses of all types.
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            Discuss Your Industry
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
