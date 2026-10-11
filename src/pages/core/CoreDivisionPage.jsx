import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight, ArrowLeft, Check, Users, Layers, Mail, ExternalLink,
} from 'lucide-react'
import {
  DIVISIONS, DIVISION_BY_SLUG, STATUS_META,
} from '../../data/coreBrand'
import {
  fetchCoreProjects, projectStatusLabel, projectTypeLabel,
} from '../../utils/coreProjects'

// Maps each division to the project categories most likely to be relevant.
// This is a grouping aid only — project status and type come from the records.
const DIVISION_CATEGORIES = {
  'generas-digital': ['web', 'mobile'],
  'generas-systems': ['web'],
  'generas-labs': ['ai'],
  'generas-innovations': ['ai'],
  'generas-technologies': ['web', 'mobile'],
  'generas-capital': [],
}

export default function CoreDivisionPage() {
  const { slug } = useParams()
  const division = DIVISION_BY_SLUG[slug]
  const [projects, setProjects] = useState([])

  useEffect(() => {
    if (division) document.title = `${division.name} — GENERAS CORE`
  }, [division])

  useEffect(() => {
    if (!division) return undefined
    const categories = DIVISION_CATEGORIES[division.slug] || []
    let active = true
    fetchCoreProjects()
      .then((data) => {
        if (!active) return
        setProjects(
          categories.length
            ? data.filter((p) => categories.includes(p.category)).slice(0, 3)
            : []
        )
      })
      .catch(() => { if (active) setProjects([]) })
    return () => { active = false }
  }, [division])

  if (!division) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Division not found</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          That division does not exist. See all GENERAS CORE businesses instead.
        </p>
        <Link
          to="/core/businesses"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Our businesses
        </Link>
      </div>
    )
  }

  const status = STATUS_META[division.status] || STATUS_META.planned
  const isDigital = division.slug === 'generas-digital'

  return (
    <div>
      <section className="border-b border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 text-white dark:border-gray-700">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <Link to="/core/businesses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-300 hover:text-yellow-400">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Our businesses
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold sm:text-4xl">{division.name}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
          </div>
          <p className="mt-3 text-lg font-medium text-yellow-400">{division.tagline}</p>
          <p className="mt-5 max-w-3xl leading-relaxed text-gray-300">{division.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/core/contact?division=${division.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
            >
              Contact this division <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            {isDigital && (
              <Link
                to="/business"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                View pricing &amp; packages
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Layers className="h-5 w-5 text-yellow-600 dark:text-yellow-500" aria-hidden="true" /> Purpose
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{division.purpose}</p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Services &amp; activities</h2>
            <ul className="mt-3 space-y-2.5">
              {division.activities.map((activity) => (
                <li key={activity} className="flex items-start gap-2.5 text-gray-600 dark:text-gray-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
                  <span>{activity}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-500" aria-hidden="true" /> Who it is for
            </h2>
            <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{division.audience}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{division.note}</p>
        </div>

        {/* PACKAGES */}
        {division.packages?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Packages &amp; starting prices</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Clear starting prices for {division.name}. Final pricing depends on scope.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {division.packages.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`rounded-2xl border p-6 ${
                    pkg.featured
                      ? 'border-yellow-400 bg-yellow-50 dark:border-yellow-500/40 dark:bg-yellow-500/10'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                    {pkg.featured && (
                      <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-gray-900">POPULAR</span>
                    )}
                  </div>
                  <p className="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-500">{pkg.price}</p>
                  <p className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{pkg.description}</p>
                  <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {pkg.includes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.note && (
                    <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">{pkg.note}</p>
                  )}
                  <Link
                    to={`/core/contact?division=${division.slug}`}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-yellow-500 dark:text-gray-900 dark:hover:bg-yellow-400"
                  >
                    Start this package <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RELEVANT PROJECTS */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Relevant projects</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Existing work that relates to this division, shown with accurate status labels.
          </p>
          {projects.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              {projects.map((project) => (
                <article key={project.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {projectStatusLabel(project.status)}
                    </span>
                    <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300">
                      {projectTypeLabel(project)}
                    </span>
                  </div>
                  <h3 className="mt-3 font-bold text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {project.description}
                  </p>
                  {project.live_demo_url && (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-yellow-700 hover:text-yellow-600 dark:text-yellow-500"
                    >
                      View live <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-gray-500 dark:border-gray-700 dark:bg-gray-800">
              No published projects are linked to this division yet. As work is released, it will appear here.
            </p>
          )}
        </div>

        {/* OTHER DIVISIONS */}
        <div className="mt-14 border-t border-gray-200 pt-8 dark:border-gray-700">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Other divisions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {DIVISIONS.filter((d) => d.slug !== division.slug).map((d) => (
              <Link
                key={d.slug}
                to={`/core/businesses/${d.slug}`}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-yellow-400 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:text-white"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>

        {/* CONTACT ACTION */}
        <div className="mt-12 rounded-2xl bg-gray-900 p-8 text-center">
          <Mail className="mx-auto h-6 w-6 text-yellow-400" aria-hidden="true" />
          <h2 className="mt-3 text-xl font-bold text-white sm:text-2xl">Enquire about {division.name}</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-300">
            Your message will be marked as concerning this division.
          </p>
          <Link
            to={`/core/contact?division=${division.slug}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
          >
            Start an enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
