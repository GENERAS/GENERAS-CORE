import { ArrowRight, TrendingUp, Clock, Users } from 'lucide-react'

export default function CaseStudy({ caseStudy }) {
  const {
    title,
    client,
    industry,
    problem,
    solution,
    technologies,
    businessImpact,
    results,
    image,
    link
  } = caseStudy

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Header Image */}
      {image && (
        <div className="h-48 bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">{client}</span>
        </div>
      )}

      <div className="p-8">
        {/* Client Info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{client} • {industry}</p>
          </div>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              View Live
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Problem */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xs">!</span>
            </span>
            Problem
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed">{problem}</p>
        </div>

        {/* Solution */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </span>
            Solution
          </h4>
          <p className="text-gray-600 text-sm leading-relaxed">{solution}</p>
        </div>

        {/* Technologies */}
        {technologies && technologies.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Technologies</h4>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Business Impact */}
        {businessImpact && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Business Impact</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{businessImpact}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
              Results
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {results.map((result, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{result.value}</div>
                  <div className="text-xs text-gray-600">{result.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Example usage data structure:
/*
const exampleCaseStudy = {
  title: 'Hotel Booking System',
  client: 'Kigali Grand Hotel',
  industry: 'Hospitality',
  problem: 'Hotel was losing revenue to OTA platforms with high commission fees and had no direct booking capability.',
  solution: 'Built a custom booking website with real-time availability, secure payment integration, and direct reservation management.',
  technologies: ['React', 'Node.js', 'Supabase', 'Stripe'],
  businessImpact: 'Reduced OTA dependency, increased direct bookings, and improved guest experience.',
  results: [
    { value: '+45%', label: 'Direct Bookings' },
    { value: '-30%', label: 'Commission Costs' },
    { value: '+25%', label: 'Revenue' },
    { value: '4.8', label: 'Guest Rating' }
  ],
  image: '/case-study-hotel.jpg',
  link: 'https://example.com'
}
*/
