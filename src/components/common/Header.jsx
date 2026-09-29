import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import SupporterPaymentModal from '../supporters/SupporterPaymentModal'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import { Menu, X, Coffee } from 'lucide-react'

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
  ]

  return (
    <>
      <header className='bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50'>
        <div className='max-w-[100rem] mx-auto px-3 sm:px-6'>
          <div className='flex items-center gap-3 sm:gap-4 lg:gap-6 h-20'>
            <Link to='/' className='flex shrink-0 items-center gap-2 sm:gap-3 pr-1 sm:pr-2'>
              <img src='/logo.png' alt='GENERAS CORE Logo' fetchPriority="high" className='h-8 sm:h-10 w-auto' style={{ background: 'transparent' }} />
              <span className='text-sm sm:text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white whitespace-nowrap'>GENERAS CORE</span>
            </Link>

            <nav className='hidden min-[1300px]:flex flex-1 items-center justify-center gap-0.5 min-w-0'>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative whitespace-nowrap rounded-lg px-2.5 py-2 text-lg font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-[#714B67] dark:text-[#C9A3C0] bg-[#714B67]/10'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className='ml-auto min-[1300px]:ml-0 flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3'>
              <ThemeToggle />
              <LanguageSwitcher />

              <button
                onClick={() => setShowPaymentModal(true)}
                className='text-xs sm:text-sm font-semibold flex shrink-0 items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors duration-200'
              >
                <Coffee className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <span className='hidden min-[1560px]:inline whitespace-nowrap'>{t('common.buyMeCoffee')}</span>
              </button>

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
                        className='w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-gradient-to-br from-[#714B67] to-[#A67B9D] flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-[#714B67]/50 transition-all duration-200'
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
      </header>

      {mobileMenuOpen && (
        <div className='min-[1300px]:hidden fixed top-20 left-0 right-0 bottom-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 overflow-y-auto'>
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
          </nav>
        </div>
      )}

      <SupporterPaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} />
    </>
  )
}
