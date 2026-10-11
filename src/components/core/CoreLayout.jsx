import { useEffect, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import CoreHeader from './CoreHeader'
import CoreFooter from './CoreFooter'
import Loader from '../common/Loader'

export default function CoreLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-900">
      <CoreHeader />
      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <CoreFooter />
    </div>
  )
}
