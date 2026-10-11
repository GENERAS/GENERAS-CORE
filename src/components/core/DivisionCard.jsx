import { Link } from 'react-router-dom'
import {
  Globe, Workflow, FlaskConical, Lightbulb, Server, Landmark, ArrowRight,
} from 'lucide-react'
import { STATUS_META } from '../../data/coreBrand'

const ICONS = {
  Globe,
  Workflow,
  FlaskConical,
  Lightbulb,
  Server,
  Landmark,
}

export default function DivisionCard({ division, compact = false }) {
  const Icon = ICONS[division.icon] || Globe
  const status = STATUS_META[division.status] || STATUS_META.planned

  return (
    <Link
      to={`/core/businesses/${division.slug}`}
      className="group flex flex-col h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all duration-200 hover:border-yellow-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 dark:bg-gray-700 text-yellow-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
          {status.label}
        </span>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
        {division.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-yellow-700 dark:text-yellow-500">
        {division.tagline}
      </p>

      {!compact && (
        <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {division.description}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {division.activities.slice(0, 3).map((activity) => (
          <span
            key={activity}
            className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300"
          >
            {activity}
          </span>
        ))}
      </div>

      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white group-hover:text-yellow-700 dark:group-hover:text-yellow-400">
        Explore division <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}
