import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import SupporterPaymentModal from '../supporters/SupporterPaymentModal'
import LanguageSwitcher from './LanguageSwitcher'
import { Menu, X, Coffee } from 'lucide-react'

export default function Header() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/academic', label: t('nav.academic') },
    { path: '/projects', label: t('nav.projects') },
    { path: '/trading', label: t('nav.trading') },
    { path: '/community', label: t('nav.community') },
    { path: '/testimonials', label: t('nav.testimonials') },
    { path: '/service', label: t('nav.mentorship') },
  ]

  return (
    <>
      <header className='bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50'>
        <div className='max-w-7xl mx-auto px-6'>
          <div className='flex justify-between items-center h-16'>
            <Link to='/' className='flex items-center gap-3'>
              <img src='/logo.png' alt='GENERAS CORE Logo' className='h-10 w-auto' style={{ background: 'transparent' }} />
              <span className='text-xl font-bold text-gray-900'>GENERAS CORE</span>
            </Link>

            <nav className='hidden lg:flex items-center gap-8'>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'text-[#714B67]' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className='flex items-center gap-2 md:gap-4'>
              <LanguageSwitcher />

              <button
                onClick={() => setShowPaymentModal(true)}
                className='text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium flex items-center gap-2'
              >
                <Coffee className="w-4 h-4 text-yellow-500" />
                <span className='hidden md:inline'>{t('common.buyMeCoffee')}</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='lg:hidden text-gray-600 hover:text-gray-900 transition-colors duration-200'
              >
                {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
              </button>

              {user && (
                <div className='relative group'>
                  <button className='text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium'>
                    {profile?.full_name || user.email?.split('@')[0]}
                  </button>
                  <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg overflow-hidden hidden group-hover:block rounded-lg'>
                    {profile?.role === 'admin' && (
                      <Link to='/admin' className='block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'>
                        {t('nav.admin')}
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className='block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                    >
                      {t('nav.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className='lg:hidden bg-white border-b border-gray-200'>
          <nav className='max-w-7xl mx-auto px-6 py-6'>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-3 text-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-yellow-600'
                      : 'text-gray-600 hover:text-gray-900'
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
