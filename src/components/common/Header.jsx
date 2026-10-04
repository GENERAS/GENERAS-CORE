import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import SupporterPaymentModal from '../supporters/SupporterPaymentModal'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import { Menu, X, Coffee, Mail, Phone, MapPin } from 'lucide-react'

const CONTACT = {
  email: 'generaskagiraneza@gmail.com',
  phones: ['0794144738', '0781281207'],
  location: 'Kigali, Rwanda',
}

function ContactStrip() {
  return (
    <div className="bg-gradient-to-r from-[#5C3B54] via-[#714B67] to-[#5C3B54] dark:from-[#241A21] dark:via-[#33232E] dark:to-[#241A21] text-white border-b border-white/10 dark:border-white/5">
      <div className="max-w-[100rem] mx-auto px-3 sm:px-6">
        <div className="h-8 flex items-center justify-between gap-3">
          <Link
            to="/contact"
            className="flex items-center gap-2 min-w-0 group"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-wide truncate group-hover:text-yellow-300 transition-colors duration-200">
              Available for new projects
              <span className="hidden md:inline"> &amp; mentorship</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-[10px] sm:text-xs font-semibold">
            <a
              href={`mailto:${CONTACT.email}`}
              className="hidden lg:inline-flex items-center gap-1.5 hover:text-yellow-300 transition-colors duration-200"
            >
              <Mail className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="whitespace-nowrap">{CONTACT.email}</span>
            </a>
            <span className="hidden lg:block w-px h-3.5 bg-white/25" />
            {CONTACT.phones.map((phone, i) => (
              <a
                key={phone}
                href={`tel:${phone}`}
                className={`inline-flex items-center gap-1.5 hover:text-yellow-300 transition-colors duration-200 ${i === 0 ? '' : 'hidden sm:inline-flex'}`}
              >
                <Phone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                <span className="whitespace-nowrap">{phone}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Header() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/academic', label: t('nav.academic') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/trading', label: t('nav.trading') },
    { path: '/community', label: t('nav.community') },
    { path: '/testimonials', label: t('nav.testimonials') },
    { path: '/service', label: t('nav.mentorship') },
    { path: '/business', label: 'Services' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <header className='fixed top-0 inset-x-0 z-50'>
        <ContactStrip />

        <div className='bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700'>
          <div className='max-w-[100rem] mx-auto px-3 sm:px-6'>
            <div className='flex items-center gap-3 sm:gap-4 lg:gap-6 h-16'>
              <Link to='/' className='group flex shrink-0 items-center gap-2 sm:gap-2.5 pr-1 sm:pr-2'>
                <span className='flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm p-1 transition-shadow duration-200 group-hover:ring-yellow-400/60 group-hover:shadow-md'>
                  <img
                    src='/logo.png'
                    alt='GENERAS CORE Logo'
                    fetchPriority="high"
                    className='h-8 sm:h-9 w-auto'
                    style={{ background: 'transparent' }}
                  />
                </span>
                <span className='flex flex-col leading-none'>
                  <span className='text-sm sm:text-lg md:text-xl font-extrabold tracking-tight whitespace-nowrap text-gray-900 dark:text-white'>
                    GENERAS <span className='text-yellow-600 dark:text-yellow-500'>CORE</span>
                  </span>
                  <span className='hidden sm:block text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap'>
                    Developer · Trader · Mentor
                  </span>
                </span>
              </Link>

              <nav className='hidden min-[1300px]:flex flex-1 items-center justify-center gap-0.5 min-w-0'>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      aria-current={isActive ? 'page' : undefined}
                      className={`relative whitespace-nowrap rounded-lg px-2.5 xl:px-3 py-2 text-[15px] xl:text-base font-semibold transition-colors duration-200 ${
                        isActive
                          ? 'text-[#714B67] dark:text-[#C9A3C0] after:absolute after:left-2.5 after:right-2.5 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-yellow-500'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <div className='ml-auto min-[1300px]:ml-0 flex shrink-0 items-center gap-1.5 sm:gap-2'>
                <ThemeToggle />
                <LanguageSwitcher />

                <button
                  onClick={() => setShowPaymentModal(true)}
                  className='text-xs sm:text-sm font-semibold flex shrink-0 items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors duration-200'
                >
                  <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                  <span className='hidden min-[1560px]:inline whitespace-nowrap'>{t('common.buyMeCoffee')}</span>
                </button>

                <Link
                  to='/contact'
                  className='hidden min-[1560px]:inline-flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-full bg-yellow-600 hover:bg-yellow-500 text-gray-900 text-sm font-bold shadow-sm hover:shadow transition-all duration-200 whitespace-nowrap'
                >
                  <Phone className='w-4 h-4' />
                  Hire Me
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label='Toggle navigation menu'
                  aria-expanded={mobileMenuOpen}
                  className='min-[1300px]:hidden shrink-0 -mr-1 p-1 text-gray-600 hover:text-gray-900 transition-colors duration-200'
                >
                  {mobileMenuOpen ? <X className='w-5 h-5 sm:w-6 sm:h-6' /> : <Menu className='w-5 h-5 sm:w-6 sm:h-6' />}
                </button>

                {user && (
                  <div className='relative' ref={profileRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className='w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-gradient-to-br from-[#714B67] to-[#A67B9D] flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-[#714B67]/50 transition-all duration-200'
                    >
                      {(profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                    </button>
                    {profileMenuOpen && (
                      <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden rounded-lg z-50'>
                        <div className='px-4 py-3 border-b border-gray-100 dark:border-gray-700'>
                          <p className='text-sm font-medium text-gray-900 dark:text-white truncate'>{profile?.full_name || user.email?.split('@')[0]}</p>
                          <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{user.email}</p>
                        </div>
                        {profile?.role === 'admin' && (
                          <Link to='/admin' onClick={() => setProfileMenuOpen(false)} className='block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200'>
                            {t('nav.admin')}
                          </Link>
                        )}
                        <button
                          onClick={() => { setProfileMenuOpen(false); signOut() }}
                          className='block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200'
                        >
                          {t('nav.signOut')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className='min-[1300px]:hidden fixed top-24 left-0 right-0 bottom-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 overflow-y-auto'>
          <nav className='max-w-3xl mx-auto px-6 py-6'>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`block rounded-lg px-4 py-3 text-xl font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-[#714B67] dark:text-[#C9A3C0] bg-[#714B67]/10'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}

            <div className='mt-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4'>
              <p className='text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3'>
                Get in touch
              </p>
              <div className='space-y-2.5'>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className='flex items-center gap-3 rounded-xl bg-white dark:bg-gray-800 px-3.5 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-yellow-400 transition'
                >
                  <Mail className='w-4 h-4 text-yellow-600 shrink-0' />
                  <span className='truncate'>{CONTACT.email}</span>
                </a>
                {CONTACT.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone}`}
                    className='flex items-center gap-3 rounded-xl bg-white dark:bg-gray-800 px-3.5 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100 ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-yellow-400 transition'
                  >
                    <Phone className='w-4 h-4 text-yellow-600 shrink-0' />
                    <span>{phone}</span>
                  </a>
                ))}
                <p className='flex items-center gap-3 px-1 pt-1 text-xs text-gray-500 dark:text-gray-400'>
                  <MapPin className='w-4 h-4 text-yellow-600 shrink-0' />
                  {CONTACT.location}
                </p>
              </div>
            </div>

            <Link
              to='/hire-me'
              onClick={() => setMobileMenuOpen(false)}
              className='mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-yellow-600 hover:bg-yellow-500 px-4 py-3.5 text-base font-bold text-gray-900 transition-colors duration-200'
            >
              Hire Me
            </Link>
          </nav>
        </div>
      )}

      <SupporterPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  )
}