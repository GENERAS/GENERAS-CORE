import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FaCrown, FaHome, FaGraduationCap, FaCode, FaChartLine, FaUsers, FaCoffee, FaBriefcase, FaUser, FaStar, FaBars, FaTimes } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import SupporterPaymentModal from '../supporters/SupporterPaymentModal'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: FaHome },
    { path: '/academic', label: t('nav.academic'), icon: FaGraduationCap },
    { path: '/projects', label: t('nav.projects'), icon: FaCode },
    { path: '/trading', label: t('nav.trading'), icon: FaChartLine },
    { path: '/community', label: t('nav.community'), icon: FaUsers },
    { path: '/testimonials', label: t('nav.testimonials'), icon: FaStar },
    { path: '/service', label: t('nav.mentorship'), icon: FaBriefcase },
  ]

  return (
    <>
      <header className='bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center h-16'>
            <Link to='/' className='flex items-center gap-3'>
              <img src='/logo.png' alt='GENERAS CORE Logo' className='h-14 w-auto' />
            </Link>

            <nav className='hidden md:flex gap-1'>
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                      isActive 
                        ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/20 border border-amber-500/30' 
                        : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : ''}`} style={{ width: '16px', height: '16px' }} />
                    <span className='font-medium'>{link.label}</span>
                    {isActive && (
                      <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse'></span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className='flex items-center gap-4'>
              <LanguageSwitcher />

              <button
                onClick={() => setShowPaymentModal(true)}
                className='bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg flex items-center gap-2 transition'
              >
                <FaCoffee className='w-4 h-4' style={{ width: '16px', height: '16px' }} />
                <span className='hidden sm:inline'>{t('common.buyMeCoffee')}</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className='md:hidden p-2 bg-slate-800 rounded-lg'
              >
                {mobileMenuOpen ? <FaTimes className='w-5 h-5' style={{ width: '20px', height: '20px' }} /> : <FaBars className='w-5 h-5' style={{ width: '20px', height: '20px' }} />}
              </button>

              {user && (
                <div className='relative group'>
                  <button className='flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg'>
                    <FaUser className='w-4 h-4' style={{ width: '16px', height: '16px' }} />
                    <span className='hidden sm:inline'>
                      {profile?.full_name || user.email?.split('@')[0]}
                    </span>
                  </button>
                  <div className='absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg overflow-hidden hidden group-hover:block'>
                    {profile?.role === 'admin' && (
                      <Link to='/admin' className='block px-4 py-2 hover:bg-slate-700'>
                        {t('nav.admin')}
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className='block w-full text-left px-4 py-2 hover:bg-slate-700'
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className='md:hidden bg-slate-900 border-b border-slate-800'>
          <nav className='container mx-auto px-4 py-4'>
            {navLinks.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className='w-5 h-5' style={{ width: '20px', height: '20px' }} />
                  <span className='font-medium'>{link.label}</span>
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
