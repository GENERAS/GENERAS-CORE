import { ArrowRight, Phone, MessageCircle } from 'lucide-react'
import BusinessSolutions from '../components/business/BusinessSolutions'
import IndustriesSection from '../components/business/IndustriesSection'
import ProcessSection from '../components/business/ProcessSection'
import DemoShowcase from '../components/business/DemoShowcase'
import PricingSection from '../components/business/PricingSection'
import TrustSection from '../components/business/TrustSection'
import WebsiteAuditSection from '../components/business/WebsiteAuditSection'
import FAQSection from '../components/business/FAQSection'
import CaseStudySection from '../components/business/CaseStudySection'

export default function BusinessPage() {
  return (
    <div className="min-h-screen -mx-6 -mt-20 -mb-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-yellow-500 to-yellow-600 py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-2 mb-6">
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              Digital Solutions for Rwanda
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Helping Local Businesses<br />Grow Online
          </h1>
          <p className="text-xl text-yellow-50 max-w-2xl mx-auto mb-8 leading-relaxed">
            Professional websites, SEO, Google Maps optimization, WhatsApp integration,
            and digital transformation services built for the Rwandan market
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#free-audit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-yellow-600 font-bold rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              Get Free Website Audit
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://wa.me/250794144738"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all duration-200 shadow-lg"
            >
              <MessageCircle className="w-5 h-5" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* All Business Sections */}
      <BusinessSolutions />
      <IndustriesSection />
      <CaseStudySection />
      <ProcessSection />
      <DemoShowcase />
      <PricingSection />
      <TrustSection />
      <WebsiteAuditSection />
      <FAQSection />

      {/* Bottom CTA */}
      <section className="bg-gray-900 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Grow Your Business Online?
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Let's discuss how we can help your business succeed in the digital world.
            Free consultation, no obligations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#free-audit"
              className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-600 text-white font-bold rounded-full hover:bg-yellow-700 transition-all duration-200"
            >
              Get Free Audit
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="tel:+250794144738"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-all duration-200 border border-white/20"
            >
              <Phone className="w-5 h-5" />
              Call Now
            </a>
            <a
              href="https://wa.me/250794144738"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
