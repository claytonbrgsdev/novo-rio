"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Play } from "lucide-react"
import { useAudio } from "./audio-context"

interface MusicPlayerProps {
  initialVolume?: number
  initialMuted?: boolean
  onVolumeChange?: (volume: number) => void
  onMuteToggle?: (muted: boolean) => void
  showPlayButton?: boolean
}

export default function MusicPlayer({
  initialVolume = 50,
  initialMuted = false,
  onVolumeChange,
  onMuteToggle,
  showPlayButton = false,
}: MusicPlayerProps) {
  const { isPlaying, startPlaying, muted: contextMuted, setMuted: setContextMuted } = useAudio()
  const [volume, setVolume] = useState(initialVolume)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  // Initialize audio on client side
  useEffect(() => {
    try {
      // Criar o elemento de áudio apenas uma vez
      if (!audioRef.current) {
        const audio = new Audio()
        audio.src = "/audio/trilha-oficial-novo-rio.mp3"
        audio.loop = true
        audio.volume = initialVolume / 100
        audio.muted = contextMuted

        // Set up event listeners
        audio.addEventListener("canplaythrough", () => {
          console.log("Áudio carregado com sucesso")
          setAudioLoaded(true)
          setAudioError(null)
        })

        audio.addEventListener("error", (e) => {
          console.error("Erro ao carregar áudio:", e)
          setAudioError("Erro ao carregar áudio. Verifique o caminho do arquivo.")
        })

        audioRef.current = audio
      }
    } catch (error) {
      console.error("Erro ao inicializar áudio:", error)
      setAudioError(`Erro ao inicializar áudio: ${error}`)
    }

    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current.remove()
        audioRef.current = null
      }
    }
  }, [initialVolume, contextMuted])

  // Handle play/pause based on isPlaying state
  useEffect(() => {
    if (!audioRef.current || !audioLoaded) return

    if (isPlaying) {
      try {
        const playPromise = audioRef.current.play()

        // Handle play promise to avoid DOMException
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Audio play failed:", error)
            // Se falhar devido a interação do usuário, não mostrar erro
            if (error.name !== "NotAllowedError") {
              setAudioError(`Falha ao reproduzir áudio: ${error.message}`)
            }
          })
        }
      } catch (error) {
        console.error("Erro ao tentar reproduzir áudio:", error)
      }
    } else {
      try {
        audioRef.current.pause()
      } catch (error) {
        console.error("Erro ao pausar áudio:", error)
      }
    }
  }, [isPlaying, audioLoaded])

  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return
    try {
      audioRef.current.volume = volume / 100
      if (onVolumeChange) onVolumeChange(volume)
    } catch (error) {
      console.error("Erro ao alterar volume:", error)
    }
  }, [volume, onVolumeChange])

  // Handle mute toggle from context
  useEffect(() => {
    if (!audioRef.current) return

    try {
      // Apenas alterar o estado mudo sem parar a reprodução
      audioRef.current.muted = contextMuted
    } catch (error) {
      console.error("Erro ao alterar estado mudo:", error)
    }
  }, [contextMuted])

  const toggleMute = () => {
    setContextMuted(!contextMuted)
    if (onMuteToggle) onMuteToggle(!contextMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value))
  }

  const handlePlayClick = () => {
    startPlaying()
  }

  return (
    <div className="flex items-center gap-2">
      {audioError && (
        <div className="text-red-500 text-xs absolute bottom-full left-0 bg-white p-1 rounded mb-1">{audioError}</div>
      )}

      {showPlayButton && !isPlaying && (
        <button
          onClick={handlePlayClick}
          className="p-2 rounded-full bg-olive-500 hover:bg-olive-600 transition-colors cursor-pointer text-white"
          aria-label="Play Music"
          type="button"
        >
          <Play className="h-5 w-5" />
        </button>
      )}

      <button
        onClick={toggleMute}
        className="p-2 rounded-full bg-olive-200 hover:bg-olive-300 transition-colors cursor-pointer text-olive-800"
        aria-label={contextMuted ? "Unmute" : "Mute"}
        type="button"
      >
        {contextMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      {!contextMuted && (
        <div className="relative group">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-2 bg-olive-300 rounded-lg appearance-none cursor-pointer"
            aria-label="Volume"
          />
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-olive-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {volume}%
          </div>
        </div>
      )}
    </div>
  )
}
