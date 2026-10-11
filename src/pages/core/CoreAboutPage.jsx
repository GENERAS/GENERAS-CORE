import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, Eye, Compass, Check, ArrowRight } from 'lucide-react'
import {
  BRAND, MISSION, VISION, VALUES, OPERATING_PHILOSOPHY,
  LONG_TERM_DIRECTION, FOUNDER,
} from '../../data/coreBrand'

export default function CoreAboutPage() {
  useEffect(() => {
    document.title = 'About — GENERAS CORE'
  }, [])

  return (
    <div>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">About GENERAS CORE</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            {BRAND.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">Our mission</h2>
            <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{MISSION}</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <Eye className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-bold text-gray-900 dark:text-white">Our vision</h2>
            <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{VISION}</p>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Core values</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white">{value.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Operating philosophy</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {OPERATING_PHILOSOPHY.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <span className="text-3xl font-bold text-gray-200 dark:text-gray-700">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{item.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            <Compass className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" /> Long-term direction
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {LONG_TERM_DIRECTION.map((stage) => (
              <div key={stage.phase} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-500">{stage.phase}</span>
                <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{stage.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{stage.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FOUNDER */}
        <div className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">The founder</h2>
          <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="h-72 w-full max-w-xs overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
                <img
                  src={FOUNDER.photo}
                  alt={FOUNDER.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='288' height='288'%3E%3Crect fill='%23fbbf24' width='288' height='288'/%3E%3C/svg%3E"
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{FOUNDER.name}</h3>
              <p className="mt-1 font-medium text-yellow-700 dark:text-yellow-500">
                {FOUNDER.role} · {FOUNDER.location}
              </p>
              <div className="mt-4 space-y-4">
                {FOUNDER.bio.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed text-gray-600 dark:text-gray-300">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {FOUNDER.links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-yellow-400 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    {link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3 rounded-2xl bg-gray-900 p-8">
          <Check className="h-6 w-6 text-yellow-400" aria-hidden="true" />
          <p className="flex-1 text-lg font-semibold text-white">
            Explore the divisions that make up GENERAS CORE.
          </p>
          <Link
            to="/core/businesses"
            className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
          >
            Our businesses <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
