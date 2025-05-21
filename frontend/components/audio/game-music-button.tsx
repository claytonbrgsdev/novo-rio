"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAudio } from "./audio-context"
import { Music, VolumeX, Volume2, SkipForward, SkipBack, AlertCircle, Loader2 } from "lucide-react"

export default function GameMusicButton() {
  const {
    isPlaying,
    startPlaying,
    muted,
    toggleMute,
    volume,
    setVolume,
    currentTrack,
    totalTracks,
    nextTrack,
    previousTrack,
    playerError,
  } = useAudio()
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Nomes das músicas para exibição com descrições mais detalhadas
  const trackNames = [
    { name: "Trilha Original", description: "Tema principal do jogo" },
    { name: "Trilha Novo Rio", description: "Ambiente relaxante" },
    { name: "Trilha Novo Rio 2", description: "Tema de exploração" },
  ]

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Efeito para simular carregamento ao mudar de faixa
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [currentTrack])

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value))
  }

  const handleTrackChange = (direction: "next" | "prev") => {
    setIsLoading(true)
    if (direction === "next") {
      nextTrack()
    } else {
      previousTrack()
    }
  }

  // Não renderizar nada durante a hidratação para evitar erros
  if (!isClient) return null

  return (
    <div
      className="fixed top-20 right-4 z-50 flex items-center"
      onMouseEnter={() => setShowVolumeSlider(true)}
      onMouseLeave={() => setShowVolumeSlider(false)}
    >
      {/* Mensagem de erro, se houver */}
      {playerError && (
        <div className="mr-2 bg-red-600 text-white p-2 rounded-md text-xs flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {playerError}
        </div>
      )}

      {/* Volume slider que aparece no hover */}
      {isPlaying && showVolumeSlider && (
        <div className="mr-2 bg-olive-700 p-2 rounded-md transition-all duration-300 ease-in-out flex flex-col items-center volume-slider-enter group relative">
          <div className="flex items-center mb-1">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-olive-300 rounded-lg appearance-none cursor-pointer"
              aria-label="Volume"
            />
            <span className="text-white text-xs ml-2">{volume}%</span>
          </div>

          {/* Indicador de música atual */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => handleTrackChange("prev")}
              className="text-white hover:text-olive-300 transition-colors"
              title="Música anterior"
              disabled={isLoading}
            >
              <SkipBack className="h-3 w-3" />
            </button>

            <div className="flex items-center">
              {isLoading ? <Loader2 className="h-3 w-3 text-white animate-spin mr-1" /> : null}
              <span className="text-white text-xs px-1">
                {trackNames[currentTrack]?.name || `Música ${currentTrack + 1}`}
              </span>
            </div>

            <button
              onClick={() => handleTrackChange("next")}
              className="text-white hover:text-olive-300 transition-colors"
              title="Próxima música"
              disabled={isLoading}
            >
              <SkipForward className="h-3 w-3" />
            </button>
          </div>

          {/* Adicionar uma tooltip com a descrição da música */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-olive-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 hidden group-hover:block">
            {trackNames[currentTrack]?.description || "Música do jogo"}
          </div>
        </div>
      )}

      {!isPlaying ? (
        <button
          onClick={startPlaying}
          className="bg-olive-700 text-white p-3 rounded-lg shadow-md border-2 border-olive-600 flex items-center gap-2 hover:bg-olive-600 transition-colors"
        >
          <Music className="h-5 w-5" />
          <span>Iniciar Música</span>
        </button>
      ) : (
        <button
          onClick={toggleMute}
          className="bg-olive-700 text-white p-2 rounded-md hover:bg-olive-600 transition-colors"
          title={muted ? "Ativar Música" : "Silenciar Música"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  )
}
