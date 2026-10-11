import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ArrowLeft } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { BRAND, CORE_NAV, CONTACT } from '../../data/coreBrand'

export default function CoreHeader() {
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800'
        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
    }`

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-gray-900 dark:bg-black text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6">
          <p className="truncate text-xs font-semibold tracking-wide text-gray-300">
            {BRAND.name} — <span className="text-yellow-400">{BRAND.tagline}</span>
          </p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="hidden text-xs font-medium text-gray-300 hover:text-yellow-400 sm:inline"
          >
            {CONTACT.email}
          </a>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/core" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="" className="h-8 w-auto" />
            <span className="flex flex-col leading-none">
              <span className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
                GENERAS <span className="text-yellow-600 dark:text-yellow-500">CORE</span>
              </span>
              <span className="mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 sm:block">
                Building Beyond Digital
              </span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex" aria-label="GENERAS CORE">
            {CORE_NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-gray-300 px-3.5 py-2 text-sm font-semibold text-gray-700 hover:border-yellow-400 hover:text-gray-900 dark:border-gray-600 dark:text-gray-200 dark:hover:text-white lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Main site
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              className="p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white md:hidden"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 md:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6" aria-label="GENERAS CORE mobile">
            {CORE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 text-lg font-semibold ${
                    isActive
                      ? 'bg-[#714B67]/10 text-[#714B67] dark:text-[#C9A3C0]'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to main site
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
