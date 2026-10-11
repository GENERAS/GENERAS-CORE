import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, Code, Layers, ArrowRight } from 'lucide-react'
import Loader from '../../components/common/Loader'
import {
  fetchCoreProjects, projectStatusLabel, projectTypeLabel,
} from '../../utils/coreProjects'

export default function CoreProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Projects — GENERAS CORE'
    let active = true
    fetchCoreProjects()
      .then((data) => { if (active) setProjects(data) })
      .catch(() => { if (active) setProjects([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <div>
      <section className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Projects &amp; products</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Real work, described as it is. Every card shows an accurate status and whether it is a personal
            project, an internal product or prototype, or client work. Links open the original source or live version.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        {loading ? (
          <Loader />
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex h-44 items-center justify-center overflow-hidden bg-slate-900">
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
                  <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-white">{project.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    {project.description}
                  </p>

                  {project.tech_stack?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tech_stack.slice(0, 4).map((tech) => (
                        <span key={tech} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
                    {project.live_demo_url && (
                      <a href={project.live_demo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-yellow-700 hover:text-yellow-600 dark:text-yellow-500">
                        <ExternalLink className="h-4 w-4" aria-hidden="true" /> Live
                      </a>
                    )}
                    {project.github_url && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                        <Code className="h-4 w-4" aria-hidden="true" /> Source
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

        <div className="mt-12 rounded-2xl bg-gray-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Want the full portfolio?</h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-300">
            The main site has the complete project portfolio with screenshots and details.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/projects" className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-yellow-400">
              Open full portfolio <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/core/contact" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
              Request similar work
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
