'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { AUTH_STORAGE_KEYS } from '@/services/api'

export default function RouteLogger() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Log the current route and authentication token on initial load
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN) : null
    console.log(`→ Route loaded: ${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}; token=`, 
      token ? `${token.substring(0, 15)}...` : null)

    // This effect will run on each route change
  }, [pathname, searchParams])

  // This component doesn't render anything
  return null
}
