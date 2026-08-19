import { useEffect } from 'react'

const titles = {
  '/': 'Generas Core — Digital Systems Builder',
  '/business': 'Services — Web Development & Digital Growth | Generas Core',
  '/academic': 'Academic Journey — Generas Core',
  '/projects': 'Project Portfolio — Generas Core',
  '/trading': 'Trading Dashboard — Generas Core',
  '/community': 'Community — Generas Core',
  '/blog': 'Blog — Generas Core',
  '/service': 'Mentorship — Generas Core',
  '/hire-me': 'Hire Me — Generas Core',
  '/testimonials': 'Testimonials — Generas Core',
  '/admin-login': 'Admin Login — Generas Core',
  '/admin': 'Admin Panel — Generas Core',
  '/login': 'Login — Generas Core',
  '/register': 'Register — Generas Core',
}

const defaultTitle = 'Generas Core — Digital Systems Builder'

export default function usePageTitle(pathname) {
  useEffect(() => {
    const title = titles[pathname] || defaultTitle
    document.title = title
  }, [pathname])
}
