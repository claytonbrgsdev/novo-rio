"use client"

import { useState, useEffect } from "react"
import { useAudio } from "./audio-context"
import { Music } from "lucide-react"

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

  if (!isClient) return null

  // If music is already playing, don't show the button
  if (isPlaying) return null

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
}
