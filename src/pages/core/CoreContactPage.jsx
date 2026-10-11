import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import ContactForm from '../../components/contact/ContactForm'
import { DIVISIONS, CONTACT } from '../../data/coreBrand'

export default function CoreContactPage() {
  const [searchParams] = useSearchParams()
  const divisionParam = searchParams.get('division') || ''
  const defaultDivision = DIVISIONS.some((d) => d.slug === divisionParam) ? divisionParam : ''

  useEffect(() => {
    document.title = 'Contact — GENERAS CORE'
  }, [])

  return (
    <div>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Contact GENERAS CORE</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Send an enquiry and select the division it concerns. Your message is stored and forwarded the same
            way as the main site contact form, with the division included.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Direct contact</h2>
            <ul className="mt-4 space-y-4">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-start gap-3 text-gray-600 transition-colors hover:text-yellow-700 dark:text-gray-300 dark:hover:text-yellow-500">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
                  <span className="break-all">{CONTACT.email}</span>
                </a>
              </li>
              {CONTACT.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} className="flex items-start gap-3 text-gray-600 transition-colors hover:text-yellow-700 dark:text-gray-300 dark:hover:text-yellow-500">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
                    <span>{phone}</span>
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
                <span>{CONTACT.location}</span>
              </li>
            </ul>

            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Only GENERAS DIGITAL currently offers commercial services. Enquiries for other divisions are
                welcome and will be handled as they are developing or planned.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ContactForm
              key={defaultDivision || 'general'}
              divisionOptions={DIVISIONS.map((d) => ({ slug: d.slug, name: d.name }))}
              defaultDivision={defaultDivision}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
