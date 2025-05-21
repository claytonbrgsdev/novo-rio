"use client"

import { useState, useEffect } from "react"
import { useAudio } from "./audio-context"

export default function MusicStartButton() {
  const { isPlaying, startPlaying, muted, toggleMute } = useAudio()
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleStartMusic = () => {
    startPlaying()
    setHasInteracted(true)
  }

  // Iniciar música automaticamente sem mostrar o botão
  useEffect(() => {
    if (isClient && !isPlaying && !hasInteracted) {
      // Opcional: iniciar música automaticamente após um delay
      // const timer = setTimeout(() => {
      //   startPlaying();
      //   setHasInteracted(true);
      // }, 2000);
      // return () => clearTimeout(timer);
    }
  }, [isClient, isPlaying, hasInteracted, startPlaying])

  if (!isClient) return null
  if (isPlaying) return null

  // Retornar null em vez do botão para ocultá-lo completamente
  return null

  // O código original do botão está comentado abaixo para referência futura
  /*
  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      {!hasInteracted && (
        <button
          onClick={handleStartMusic}
          className="bg-olive-600 text-white p-3 rounded-lg shadow-md border-2 border-olive-700 flex items-center gap-2 hover:bg-olive-700 transition-colors"
        >
          <Music className="h-5 w-5" />
          <span>Iniciar Música</span>
        </button>
      )}
    </div>
  )
  */
}
