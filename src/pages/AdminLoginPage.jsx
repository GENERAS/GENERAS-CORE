import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import { Crown, ShieldCheck } from 'lucide-react'

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.57 5.57 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z" />
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09Z" />
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
  </svg>
)

const GithubIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.12 0 .3.2.66.8.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
)

export default function AdminLoginPage() {
  const { signInWithGoogle, signInWithGithub, user, loading, isAdmin } = useAuth()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin')
    }
  }, [user, isAdmin, navigate])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-yellow-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-yellow-500/10">
              <Crown className="text-4xl text-yellow-600" />
            </div>
            <div className="p-3 rounded-xl bg-yellow-600/10">
              <ShieldCheck className="text-4xl text-yellow-700" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Access</h1>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Restricted to authorized personnel only</p>
        </div>

        <div className={`rounded-2xl p-8 border shadow-sm ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-lg font-semibold mb-6 text-center ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Sign in with</h2>

          <div className="space-y-3">
            <button
              onClick={signInWithGoogle}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition border border-gray-200"
            >
              <GoogleIcon className="h-5 w-5 text-red-500" /> Continue with Google
            </button>
            <button
              onClick={signInWithGithub}
              className={`w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              <GithubIcon className="h-5 w-5" /> Continue with GitHub
            </button>
          </div>

          <p className={`text-xs text-center mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Secure admin access only. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  )
}
