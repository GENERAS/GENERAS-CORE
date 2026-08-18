import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    question: 'How long does a website take?',
    answer: 'Typically, a business website takes 2-4 weeks from start to finish. This includes discovery, design, development, and launch. Complex projects with custom features may take longer. We provide a detailed timeline during the planning phase.'
  },
  {
    question: 'Do you provide hosting?',
    answer: 'Yes, we can provide reliable hosting services for your website. We use secure, fast servers with regular backups. Alternatively, we can deploy the website to your preferred hosting provider if you already have one.'
  },
  {
    question: 'Do you provide maintenance?',
    answer: 'Absolutely. We offer ongoing maintenance packages to keep your website secure, updated, and performing optimally. This includes security updates, content updates, performance monitoring, and technical support.'
  },
  {
    question: 'Can you improve Google ranking?',
    answer: 'Yes, we specialize in local SEO and Google Maps optimization. We optimize your website for search engines, create Google Business Profiles, and implement strategies to improve your visibility in local search results.'
  },
  {
    question: 'Can you integrate Mobile Money?',
    answer: 'Yes, we integrate MTN MoMo and Airtel Money payment systems into websites. This allows your customers to pay easily using their mobile money accounts, which is essential for businesses in Rwanda.'
  },
  {
    question: 'Can you integrate WhatsApp?',
    answer: 'Yes, we integrate WhatsApp chat buttons and messaging systems into websites. This enables instant communication with your customers, helping you convert visitors into buyers more effectively.'
  },
  {
    question: 'Do you work with small businesses?',
    answer: 'Absolutely! We specialize in helping small and medium-sized businesses in Rwanda establish their online presence. Our solutions are affordable and scalable, growing with your business.'
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Got questions? We've got answers.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="font-medium text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5 pt-0">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Contact Us
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </div>
      </div>
    </section>
  )
}
