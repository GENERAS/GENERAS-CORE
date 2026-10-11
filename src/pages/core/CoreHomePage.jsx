import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Eye, Compass, Layers, Mail } from 'lucide-react'
import DivisionCard from '../../components/core/DivisionCard'
import {
  BRAND, DIVISIONS, MISSION, VISION, VALUES, LONG_TERM_DIRECTION,
} from '../../data/coreBrand'
import {
  fetchCoreProjects, projectStatusLabel, projectTypeLabel,
} from '../../utils/coreProjects'

export default function CoreHomePage() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let active = true
    fetchCoreProjects()
      .then((data) => {
        if (!active) return
        const featured = data.filter((p) => p.is_featured).slice(0, 3)
        setProjects(featured.length ? featured : data.slice(0, 3))
      })
      .catch(() => { if (active) setProjects([]) })
    return () => { active = false }
  }, [])

  return (
    <div>
      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-yellow-500 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-yellow-400">
            Parent brand
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {BRAND.name} — <span className="text-yellow-400">{BRAND.tagline}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-gray-300">
            {BRAND.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/core/businesses"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
            >
              Explore our businesses <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/core/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
            >
              Start an enquiry
            </Link>
          </div>
        </div>
      </section>

      {/* 2. GROUP INTRODUCTION */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          One brand, several focused divisions
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
          GENERAS CORE is the parent brand behind a family of technology divisions. Some are active today,
          others are developing, and some are planned for the future. Each division is labelled honestly so
          you always know what exists now and what is still being built.
        </p>
      </section>

      {/* 3. BUSINESS DIVISION CARDS */}
      <section className="bg-gray-50 dark:bg-gray-800/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Our businesses</h2>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">
                Six divisions, each with a clear purpose. GENERAS DIGITAL is the first with commercial services available now.
              </p>
            </div>
            <Link to="/core/businesses" className="inline-flex items-center gap-1.5 font-semibold text-yellow-700 hover:text-yellow-600 dark:text-yellow-500">
              View all divisions <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {DIVISIONS.map((division) => (
              <DivisionCard key={division.slug} division={division} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. REAL PROJECTS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Projects &amp; products</h2>
            <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">
              Real work with accurate status labels. Status reflects the project's own record — nothing is overstated.
            </p>
          </div>
          <Link to="/core/projects" className="inline-flex items-center gap-1.5 font-semibold text-yellow-700 hover:text-yellow-600 dark:text-yellow-500">
            All projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-40 items-center justify-center overflow-hidden bg-slate-900">
                  {project.image_url ? (
                    <img src={project.image_url} alt={project.title} loading="lazy" className="h-full w-full object-contain" />
                  ) : (
                    <Layers className="h-10 w-10 text-yellow-500" aria-hidden="true" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {projectStatusLabel(project.status)}
                    </span>
                    <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300">
                      {projectTypeLabel(project)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
                    {project.live_demo_url && (
                      <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="text-yellow-700 hover:text-yellow-600 dark:text-yellow-500">
                        Live
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500 dark:border-gray-700 dark:bg-gray-800">
            Projects will appear here as they are published.
          </p>
        )}
      </section>

      {/* 5. MISSION, VISION, VALUES */}
      <section className="bg-gray-50 dark:bg-gray-800/40">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Mission, vision &amp; values</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <Target className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">Mission</h3>
              <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{MISSION}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <Eye className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">Vision</h3>
              <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{VISION}</p>
            </div>
          </div>

          <h3 className="mt-10 text-lg font-bold text-gray-900 dark:text-white">Core values</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="font-semibold text-gray-900 dark:text-white">{value.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. LONG-TERM DIRECTION */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-yellow-600 dark:text-yellow-500" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Long-term direction</h2>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {LONG_TERM_DIRECTION.map((stage) => (
            <div key={stage.phase} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-500">{stage.phase}</span>
              <h3 className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{stage.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{stage.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CONTACT CTA */}
      <section className="bg-gray-900">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <Mail className="mx-auto h-7 w-7 text-yellow-400" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Have a project or enquiry?</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-300">
            Tell us which division your enquiry concerns and we will route it correctly.
          </p>
          <Link
            to="/core/contact"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-7 py-3.5 font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
          >
            Contact GENERAS CORE <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
