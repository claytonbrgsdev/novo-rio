"use client"

import { useEffect, useState } from "react"
import { useAudio } from "./audio-context"
import MusicPlayer from "./music-player"

export default function BackgroundMusic() {
  const { volume, muted, setVolume, setMuted, isPlaying } = useAudio()
  const [isClient, setIsClient] = useState(false)

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  // Only show the music player if music is playing or has been started
  if (!isPlaying) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-paper-200 p-2 rounded-lg shadow-md border-2 border-olive-700 flex items-center gap-2">
      <div className="text-xs text-olive-800 font-medium mr-1">Música:</div>
      <MusicPlayer initialVolume={volume} initialMuted={muted} onVolumeChange={setVolume} onMuteToggle={setMuted} />
    </div>
  )
}
