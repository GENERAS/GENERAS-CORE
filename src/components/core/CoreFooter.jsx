import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import { BRAND, DIVISIONS, CONTACT, CORE_NAV } from '../../data/coreBrand'

export default function CoreFooter() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-4 inline-flex items-center rounded-xl bg-white p-2">
              <img src="/logo.png" alt="GENERAS CORE logo" className="h-8 w-auto" />
            </div>
            <h2 className="text-lg font-bold text-white">{BRAND.name}</h2>
            <p className="mt-1 text-sm font-medium text-yellow-500">{BRAND.tagline}</p>
            <p className="mt-4 text-sm leading-relaxed">{BRAND.description}</p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Explore</h3>
            <ul className="space-y-3 text-sm">
              {CORE_NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="transition-colors hover:text-yellow-500">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Divisions</h3>
            <ul className="space-y-3 text-sm">
              {DIVISIONS.map((division) => (
                <li key={division.slug}>
                  <Link
                    to={`/core/businesses/${division.slug}`}
                    className="transition-colors hover:text-yellow-500"
                  >
                    {division.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-3 break-all transition-colors hover:text-yellow-500">
                  <Mail className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden="true" /> {CONTACT.email}
                </a>
              </li>
              {CONTACT.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:${phone}`} className="flex items-center gap-3 transition-colors hover:text-yellow-500">
                    <Phone className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden="true" /> {phone}
                  </a>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden="true" /> {CONTACT.location}
              </li>
            </ul>
            <Link
              to="/core/contact"
              className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-yellow-600 px-4 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-yellow-500"
            >
              Send an enquiry
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <Link to="/" className="text-sm text-gray-500 transition-colors hover:text-yellow-500">
            Back to main site
          </Link>
        </div>
      </div>
    </footer>
  )
}
