import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import Loader from './components/common/Loader'
import BackToTop from './components/common/BackToTop'
import usePageTitle from './hooks/usePageTitle'
import AdminLoginPage from './pages/AdminLoginPage'
import ChatWindow from './components/AIAssistant/ChatWindow'
import LandingPageModal from './components/business/LandingPageModal'

// Pages
const HomePage = lazy(() => import('./pages/HomePage'))
const BusinessPage = lazy(() => import('./pages/BusinessPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AcademicPage = lazy(() => import('./pages/AcademicPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const TradingPage = lazy(() => import('./pages/TradingPage'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const HiringPage = lazy(() => import('./pages/HiringPage'))
const ServicePage = lazy(() => import('./pages/ServicePage'))
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageTitle() {
  const { pathname } = useLocation()
  usePageTitle(pathname)
  return null
}

function ScrollHandler() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <PageTitle />
        <ScrollHandler />

        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Layout><Suspense fallback={<Loader />}><HomePage /></Suspense></Layout>} />
          <Route path="/business" element={<Layout><Suspense fallback={<Loader />}><BusinessPage /></Suspense></Layout>} />
          <Route path="/academic" element={<Layout><Suspense fallback={<Loader />}><AcademicPage /></Suspense></Layout>} />
          <Route path="/projects" element={<Layout><Suspense fallback={<Loader />}><ProjectsPage /></Suspense></Layout>} />
          <Route path="/trading" element={<Layout><Suspense fallback={<Loader />}><TradingPage /></Suspense></Layout>} />
          <Route path="/community" element={<Layout><Suspense fallback={<Loader />}><CommunityPage /></Suspense></Layout>} />
          <Route path="/blog" element={<Layout><Suspense fallback={<Loader />}><BlogPage /></Suspense></Layout>} />
          <Route path="/blog/:slug" element={<Layout><Suspense fallback={<Loader />}><BlogPostPage /></Suspense></Layout>} />
          <Route path="/service" element={<Layout><Suspense fallback={<Loader />}><ServicePage /></Suspense></Layout>} />
          <Route path="/services/:slug" element={<Layout><Suspense fallback={<Loader />}><ServiceDetailPage /></Suspense></Layout>} />
          <Route path="/hire-me" element={<Layout><Suspense fallback={<Loader />}><HiringPage /></Suspense></Layout>} />
          <Route path="/testimonials" element={<Layout><Suspense fallback={<Loader />}><TestimonialsPage /></Suspense></Layout>} />

          {/* REDIRECTS */}
          <Route path="/mentorship" element={<Navigate to="/service" replace />} />
          <Route path="/services" element={<Navigate to="/service" replace />} />

          {/* AUTH */}
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Suspense fallback={<Loader />}><AdminPage /></Suspense>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<Layout><Suspense fallback={<Loader />}><NotFoundPage /></Suspense></Layout>} />
        </Routes>

        <ChatWindow />
        <LandingPageModal />
        <BackToTop />
      </ErrorBoundary>
    </AuthProvider>
  )
}

export default App
