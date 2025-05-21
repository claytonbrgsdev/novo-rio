"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient, getCurrentUser } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const refreshUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser || null)
    } catch (error) {
      console.error("Erro ao verificar usuário:", error)
      setError("Falha ao verificar usuário. Por favor, tente novamente.")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser || null)
      } catch (error) {
        console.error("Erro ao verificar usuário:", error)
        setError("Falha ao verificar usuário. Por favor, tente novamente.")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Verificar usuário atual
    checkUser()

    // Configurar listener para mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      setError("Falha ao fazer logout. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, loading, error, signOut, refreshUser }}>{children}</AuthContext.Provider>
}
