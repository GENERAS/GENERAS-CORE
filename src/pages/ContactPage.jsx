import { useEffect } from 'react'
import ContactForm from '../components/contact/ContactForm'
import usePageTitle from '../hooks/usePageTitle'

export default function ContactPage() {
  usePageTitle('Contact')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Get in Touch
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have a project in mind, a question, or want to work together? Send a message and I'll get back to you as soon as possible.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
