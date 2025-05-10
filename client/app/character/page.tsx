"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CharacterCustomizer from "@/components/character/character-customizer"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import LeafIcon from "@/components/hand-drawn/leaf"
import SunIcon from "@/components/hand-drawn/sun"
import FlowerIcon from "@/components/hand-drawn/flower"
import SproutIcon from "@/components/hand-drawn/sprout"

export default function CharacterPage() {
  const { user, loading: authLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!authLoading && !user) {
      setError("Você precisa estar autenticado para acessar esta página.")
      setTimeout(() => {
        router.push("/auth?redirected=true&from=character")
      }, 2000)
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-paper-200 to-paper-300 font-handwritten p-4 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-30">
          <LeafIcon />
        </div>
        <div className="absolute bottom-10 right-10 opacity-30">
          <SproutIcon />
        </div>

        <div className="w-16 h-16 border-t-4 border-olive-600 rounded-full animate-spin mb-4"></div>
        <p className="text-olive-800">Verificando autenticação...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-paper-200 to-paper-300 font-handwritten p-4 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-30">
          <LeafIcon />
        </div>
        <div className="absolute bottom-10 right-10 opacity-30">
          <SproutIcon />
        </div>

        <div className="bg-paper-100 p-6 rounded-lg shadow-lg max-w-md w-full text-center border-2 border-olive-700">
          <h1 className="text-2xl font-bold text-olive-800 mb-4">Oops!</h1>
          <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <Link
            href="/auth?redirected=true&from=character"
            className="bg-olive-600 text-white py-2 px-4 rounded hover:bg-olive-700 transition-colors inline-block hand-drawn-button"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-paper-200 to-paper-300 text-olive-800 p-6 font-handwritten relative">
      {/* SVG Filter for hand-drawn effect */}
      <svg width="0" height="0" className="absolute">
        <filter id="hand-drawn">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </svg>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none">
        <LeafIcon />
      </div>
      <div className="absolute bottom-10 right-10 opacity-20 pointer-events-none">
        <SproutIcon />
      </div>
      <div className="absolute top-1/4 right-1/4 opacity-20 pointer-events-none">
        <SunIcon />
      </div>
      <div className="absolute bottom-1/4 left-1/4 opacity-20 pointer-events-none">
        <FlowerIcon />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="bg-olive-600 hover:bg-olive-700 p-2 rounded-full mr-4 transition-colors text-white hand-drawn-button"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold text-olive-900">Criação de Personagem</h1>
        </div>

        <CharacterCustomizer />
      </div>
    </div>
  )
}
