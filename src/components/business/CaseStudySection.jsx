import { ArrowRight } from 'lucide-react'
import CaseStudy from './CaseStudy'

const caseStudies = [
  {
    title: 'Hotel Booking Platform',
    client: 'Kigali Grand Hotel',
    industry: 'Hospitality',
    problem: 'Losing revenue to OTA platforms with high commission fees. No direct booking capability existed.',
    solution: 'Built a custom booking website with real-time room availability, secure MoMo payment integration, and direct reservation management system.',
    technologies: ['React', 'Node.js', 'Supabase', 'MTN MoMo'],
    businessImpact: 'Reduced OTA dependency significantly, increased direct bookings, and improved guest experience with a seamless online booking flow.',
    results: [
      { value: '+45%', label: 'Direct Bookings' },
      { value: '-30%', label: 'Commission Costs' },
      { value: '+25%', label: 'Revenue' },
      { value: '4.8', label: 'Guest Rating' }
    ]
  },
  {
    title: 'Restaurant Ordering System',
    client: 'Heaven Restaurant',
    industry: 'Food & Beverage',
    problem: 'Manual phone orders causing delays, missed orders, and poor customer experience during peak hours.',
    solution: 'Developed an online ordering system with digital menu, real-time order tracking, and WhatsApp notifications for order updates.',
    technologies: ['React', 'Supabase', 'WhatsApp API'],
    businessImpact: 'Streamlined order management, reduced order errors by 60%, and enabled the restaurant to handle 3x more orders during peak hours.',
    results: [
      { value: '+200%', label: 'Order Volume' },
      { value: '-60%', label: 'Order Errors' },
      { value: '+35%', label: 'Revenue' },
      { value: '4.7', label: 'Customer Rating' }
    ]
  },
  {
    title: 'Clinic Management System',
    client: 'Kigali Health Center',
    industry: 'Healthcare',
    problem: 'Inefficient appointment scheduling with long wait times and poor patient communication leading to missed appointments.',
    solution: 'Created an appointment booking system with doctor profiles, service listings, automated reminders via SMS, and a patient information portal.',
    technologies: ['React', 'Supabase', 'SMS Gateway'],
    businessImpact: 'Reduced no-shows by 40%, improved patient satisfaction, and enabled the clinic to serve 50% more patients daily.',
    results: [
      { value: '-40%', label: 'No-Shows' },
      { value: '+50%', label: 'Daily Patients' },
      { value: '+30%', label: 'Satisfaction' },
      { value: '2hrs', label: 'Avg Wait Time' }
    ]
  }
]

export default function CaseStudySection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Real Results for Real Businesses
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how we've helped businesses across Rwanda transform their digital presence
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <CaseStudy key={index} caseStudy={study} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Want to be our next success story?
          </p>
          <a
            href="#free-audit"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Start Your Project
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}
