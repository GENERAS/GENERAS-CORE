import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const currentLang = i18n.language || 'en'

  const toggleLanguage = () => {
    const newLang = currentLang.startsWith('rw') ? 'en' : 'rw'
    i18n.changeLanguage(newLang)
  }

  const isKinyarwanda = currentLang.startsWith('rw')

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 bg-white border border-gray-300 text-base text-gray-700 hover:text-gray-900 hover:border-gray-400 rounded-lg transition-colors duration-200 font-medium"
      title={isKinyarwanda ? 'Switch to English' : 'Hindura mu Kinyarwanda'}
    >
      {isKinyarwanda ? 'RW' : 'EN'}
    </button>
  )
}
