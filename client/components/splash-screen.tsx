"use client"

import { useState, useEffect } from "react"
import { useAudio } from "./audio/audio-context"
import { Play } from "lucide-react"
import HandDrawnButton from "./hand-drawn/button"
import LeafIcon from "./hand-drawn/leaf"
import SunIcon from "./hand-drawn/sun"
import FlowerIcon from "./hand-drawn/flower"
import SproutIcon from "./hand-drawn/sprout"

interface SplashScreenProps {
  onStart: () => void
}

export default function SplashScreen({ onStart }: SplashScreenProps) {
  const { startPlaying } = useAudio()
  const [loading, setLoading] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // Simular tempo de carregamento
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleStart = () => {
    startPlaying() // Iniciar a música

    // Iniciar animação de saída
    setExiting(true)

    // Aguardar a animação terminar antes de remover o componente
    setTimeout(() => {
      onStart()
    }, 800) // Duração da animação de fade-out
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-gradient-to-b from-paper-200 to-paper-300 flex flex-col items-center justify-center font-handwritten transition-opacity duration-800 ${
        exiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-70 transition-transform duration-1000">
        <LeafIcon className="w-24 h-24" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-70 transition-transform duration-1000">
        <SproutIcon className="w-24 h-24" />
      </div>
      <div className="absolute top-1/4 right-1/4 opacity-70 transition-transform duration-1000">
        <SunIcon className="w-24 h-24" />
      </div>
      <div className="absolute bottom-1/4 left-1/4 opacity-70 transition-transform duration-1000">
        <FlowerIcon className="w-24 h-24" />
      </div>

      <div className="text-center mb-8 transition-transform duration-500">
        <h1
          className="text-8xl md:text-9xl font-bold mb-2 text-olive-900 tracking-wider"
          style={{ textShadow: "4px 4px 0 #e0e0c0" }}
        >
          NOVO RIO
        </h1>
        <p className="text-xl text-olive-800 mt-2">Refloreste uma área devastada pela plantação de soja</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-olive-600 rounded-full animate-spin mb-4"></div>
          <p className="text-olive-800 text-lg">Carregando...</p>
        </div>
      ) : (
        <div
          className={`flex flex-col items-center transition-all duration-500 ${exiting ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
        >
          <HandDrawnButton
            onClick={handleStart}
            variant="primary"
            className="px-12 py-6 text-2xl flex items-center gap-3"
          >
            <Play className="h-8 w-8" />
            Iniciar
          </HandDrawnButton>
        </div>
      )}
    </div>
  )
}
