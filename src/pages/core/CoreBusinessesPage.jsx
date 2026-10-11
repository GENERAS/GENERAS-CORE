import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import DivisionCard from '../../components/core/DivisionCard'
import { DIVISIONS, STATUS_META } from '../../data/coreBrand'

export default function CoreBusinessesPage() {
  return (
    <div>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Our Businesses</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            GENERAS CORE is made up of focused divisions. Each one has a clear purpose and an honest status,
            so you can see what is active, what is developing, and what is planned.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {Object.entries(STATUS_META).map(([key, meta]) => (
              <span key={key} className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                {meta.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DIVISIONS.map((division) => (
            <DivisionCard key={division.slug} division={division} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gray-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Not sure which division fits?</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-300">
            Send your enquiry and note the division you think it concerns — it will be routed to the right place.
          </p>
          <Link
            to="/core/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
          >
            Contact us <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
