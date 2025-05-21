'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-context'
import { AUTH_STORAGE_KEYS } from '@/services/api'

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuth(props: P) {
    const { user, isAuthenticated, loading } = useAuth() // Simplificando uso direto de loading
    const router = useRouter()
    
    // Add debugging logs to track the authentication state
    useEffect(() => {
      console.log('withAuth:', { loading, user, isAuthenticated })
    }, [loading, user, isAuthenticated])
    
    useEffect(() => {
      // Only redirect when authentication has completed loading AND user is not authenticated
      if (!loading && !user) {
        console.log('withAuth HOC: Not authenticated (after loading complete), redirecting to /auth')
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)
        console.log(`withAuth HOC: Token=${token?.substring(0, 15) || 'null'}`)
        
        // Redirect to login if not authenticated
        router.replace('/auth?redirected=true&from=protected')
      } else if (!loading && user) {
        console.log('withAuth HOC: Authentication verified, user:', user)
      }
    }, [user, loading, router])

    // Show loading indicator while authentication is in progress
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-t-4 border-olive-600 rounded-full animate-spin"></div>
            <p className="text-olive-700 font-medium">Carregando autenticação...</p>
          </div>
        </div>
      )
    }
    
    // If not authenticated but loading is done, return null as we've already triggered redirect
    if (!user) {
      return null
    }

    // User is authenticated and loading is complete, render the protected component
    return <WrappedComponent {...props} />
  }
}
