import { Search, Layout, Code, Rocket, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discovery & Business Audit',
    description: 'We analyze your current digital presence, business goals, and target audience to create a tailored strategy.'
  },
  {
    number: '02',
    icon: Layout,
    title: 'Strategy & Planning',
    description: 'We develop a comprehensive plan including sitemaps, user flows, and technical requirements for your project.'
  },
  {
    number: '03',
    icon: Code,
    title: 'Design & Prototype',
    description: 'We create visual designs and interactive prototypes to ensure the final product meets your expectations.'
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Development',
    description: 'Our expert developers build your solution using modern technologies, ensuring performance and scalability.'
  },
  {
    number: '05',
    icon: CheckCircle,
    title: 'Launch',
    description: 'We deploy your website or application, configure all integrations, and ensure everything works perfectly.'
  },
  {
    number: '06',
    icon: TrendingUp,
    title: 'Growth Support',
    description: 'We provide ongoing support, maintenance, and optimization to help your business continue growing.'
  }
]

export default function ProcessSection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Our Process
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A proven methodology that delivers results, from discovery to growth
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-yellow-500 via-yellow-600 to-yellow-700"></div>

          {/* Steps */}
          <div className="space-y-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isEven = index % 2 === 0
              
              return (
                <div
                  key={index}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline Dot */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-yellow-500 rounded-full items-center justify-center z-10">
                    <span className="text-white font-bold text-sm">{step.number}</span>
                  </div>

                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'}`}>
                    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-500 transition-all duration-300">
                      <div className={`flex items-center gap-3 mb-4 ${isEven ? 'md:justify-end' : ''}`}>
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for layout */}
                  <div className="flex-1"></div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden mt-12 space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{step.number}</span>
                </div>
                <div className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
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
