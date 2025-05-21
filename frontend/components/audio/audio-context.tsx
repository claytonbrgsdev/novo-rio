"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type React from "react"

interface AudioContextType {
  volume: number
  muted: boolean
  isPlaying: boolean
  currentTrack: number
  totalTracks: number
  playerError: string | null
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  toggleMute: () => void
  startPlaying: () => void
  stopPlaying: () => void
  nextTrack: () => void
  previousTrack: () => void
  setCurrentTrack: (track: number) => void
  setAudioError: (error: string | null) => void
}

const AudioContext = createContext<AudioContextType>({
  volume: 50,
  muted: false,
  isPlaying: false,
  currentTrack: 0,
  totalTracks: 3,
  playerError: null,
  setVolume: () => {},
  setMuted: () => {},
  toggleMute: () => {},
  startPlaying: () => {},
  stopPlaying: () => {},
  nextTrack: () => {},
  previousTrack: () => {},
  setCurrentTrack: () => {},
  setAudioError: () => {},
})

export const useAudio = () => useContext(AudioContext)

// Atualizar a função setCurrentTrack para ser exportada e usada externamente
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [volume, setVolume] = useState(50)
  const [muted, setMuted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrackState] = useState(0)
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [isChangingTrack, setIsChangingTrack] = useState(false)
  const [playerError, setPlayerError] = useState<string | null>(null)

  // Total de faixas na playlist
  const totalTracks = 3

  // Função para definir a faixa atual com segurança
  const setCurrentTrack = (trackIndex: number) => {
    // Garantir que o índice esteja dentro dos limites
    const safeIndex = ((trackIndex % totalTracks) + totalTracks) % totalTracks
    setCurrentTrackState(safeIndex)
  }

  // Função para definir erros de áudio
  const setAudioError = (error: string | null) => {
    setPlayerError(error)
  }

  // Load audio preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedVolume = localStorage.getItem("novoRio_volume")
        const savedMuted = localStorage.getItem("novoRio_muted")
        const savedTrack = localStorage.getItem("novoRio_currentTrack")

        if (savedVolume) {
          const parsedVolume = Number(savedVolume)
          if (!isNaN(parsedVolume) && parsedVolume >= 0 && parsedVolume <= 100) {
            setVolume(parsedVolume)
          }
        }

        if (savedMuted) {
          setMuted(savedMuted === "true")
        }

        if (savedTrack) {
          const trackNum = Number(savedTrack)
          if (!isNaN(trackNum) && trackNum >= 0 && trackNum < totalTracks) {
            setCurrentTrackState(trackNum)
          }
        }
      } catch (error) {
        console.error("Erro ao carregar preferências de áudio:", error)
      }

      setAudioInitialized(true)
    }
  }, [totalTracks])

  // Save audio preferences to localStorage when they change
  useEffect(() => {
    if (audioInitialized && typeof window !== "undefined") {
      try {
        localStorage.setItem("novoRio_volume", volume.toString())
        localStorage.setItem("novoRio_muted", muted.toString())
        localStorage.setItem("novoRio_currentTrack", currentTrack.toString())
      } catch (error) {
        console.error("Erro ao salvar preferências de áudio:", error)
      }
    }
  }, [volume, muted, currentTrack, audioInitialized])

  const toggleMute = () => {
    setMuted((prev) => !prev)
  }

  const startPlaying = () => {
    console.log("Iniciando reprodução de áudio")
    setIsPlaying(true)
  }

  const stopPlaying = () => {
    console.log("Parando reprodução de áudio")
    setIsPlaying(false)
  }

  const nextTrack = () => {
    setIsChangingTrack(true)
    console.log("Avançando para a próxima faixa")
    setCurrentTrack((currentTrack + 1) % totalTracks)

    // Resetar o estado de mudança de faixa após um breve atraso
    setTimeout(() => {
      setIsChangingTrack(false)
    }, 500)
  }

  const previousTrack = () => {
    setIsChangingTrack(true)
    console.log("Voltando para a faixa anterior")
    setCurrentTrack((currentTrack - 1 + totalTracks) % totalTracks)

    // Resetar o estado de mudança de faixa após um breve atraso
    setTimeout(() => {
      setIsChangingTrack(false)
    }, 500)
  }

  return (
    <AudioContext.Provider
      value={{
        volume,
        muted,
        isPlaying,
        currentTrack,
        totalTracks,
        playerError,
        setVolume,
        setMuted,
        toggleMute,
        startPlaying,
        stopPlaying,
        nextTrack,
        previousTrack,
        setCurrentTrack,
        setAudioError,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}
