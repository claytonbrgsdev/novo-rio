"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { apiService } from "@/services/api"
import HandDrawnButton from "@/components/hand-drawn/button"
import LeafIcon from "@/components/hand-drawn/leaf"
import SunIcon from "@/components/hand-drawn/sun"
import FlowerIcon from "@/components/hand-drawn/flower"
import SproutIcon from "@/components/hand-drawn/sprout"
import { Settings, Volume2, VolumeX, Info, User, Music } from "lucide-react"
import { useAudio } from "@/components/audio/audio-context"
import SplashScreen from "@/components/splash-screen"

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [fadeIn, setFadeIn] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [gameSaves, setGameSaves] = useState<any[]>([])
  const [characters, setCharacters] = useState<any[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams?.get("error")
  const { user, signOut } = useAuth()
  const { muted, toggleMute, isPlaying, startPlaying } = useAudio()

  useEffect(() => {
    // Check for error parameter
    if (error === "auth_error") {
      setErrorMessage("Ocorreu um erro de autenticação. Por favor, faça login novamente.")
      setShowSplash(false) // Não mostrar splash se houver erro
    }

    const fetchUserData = async () => {
      if (!user) return

      try {
        // Carregar saves do jogo
        try {
          const savesData = await apiService.get<any[]>(`/players/${user.id}/saves`)
          if (savesData && Array.isArray(savesData)) {
            setGameSaves(savesData)
          } else {
            // Fallback para caso a API retorne formato diferente
            setGameSaves([])
          }
        } catch (saveError) {
          console.error("Erro ao carregar saves:", saveError)
          setGameSaves([])
          // Continue se não conseguir carregar os saves
        }

        // Carregar personagens
        try {
          const charactersData = await apiService.get<any[]>(`/players/${user.id}/characters`)
          if (charactersData && Array.isArray(charactersData)) {
            setCharacters(charactersData)
          } else {
            // Fallback para caso a API retorne formato diferente
            setCharacters([])
          }
        } catch (charError) {
          console.error("Erro ao carregar personagens:", charError)
          setCharacters([])
          // Continue se não conseguir carregar os personagens
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error)
      }
    }

    fetchUserData()
  }, [user, error])

  // Efeito para animar a entrada do menu principal
  useEffect(() => {
    if (!showSplash) {
      // Pequeno delay antes de iniciar a animação de fade-in
      setTimeout(() => {
        setFadeIn(true)
      }, 100)
    }
  }, [showSplash])

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleContinueGame = () => {
    setIsLoading(true)

    // If the user isn't logged in, redirect to auth page
    if (!user) {
      window.location.href = "/auth?redirected=true&from=game"
      return
    }

    // Check if user has characters
    if (characters.length === 0) {
      window.location.href = "/character"
    } else {
      // If they have characters, proceed to game
      window.location.href = "/game"
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const handleStartMusic = () => {
    startPlaying()
  }

  // Se estiver mostrando a tela de splash, renderizar apenas ela
  if (showSplash) {
    return <SplashScreen onStart={handleSplashComplete} />
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-paper-200 to-paper-300 font-handwritten relative overflow-hidden transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}
    >
      {/* SVG Filter for hand-drawn effect */}
      <svg width="0" height="0" className="absolute">
        <filter id="hand-drawn">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </svg>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-70 transition-transform duration-1000 transform translate-y-0">
        <LeafIcon />
      </div>
      <div className="absolute bottom-10 right-10 opacity-70 transition-transform duration-1000 transform translate-y-0">
        <SproutIcon />
      </div>
      <div className="absolute top-1/4 right-1/4 opacity-70 transition-transform duration-1000 transform translate-y-0">
        <SunIcon />
      </div>
      <div className="absolute bottom-1/4 left-1/4 opacity-70 transition-transform duration-1000 transform translate-y-0">
        <FlowerIcon />
      </div>

      {/* Top controls - Fade in from top */}
      <div
        className={`absolute top-4 right-4 flex gap-3 z-10 transition-all duration-700 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        {!isPlaying ? (
          <button
            onClick={handleStartMusic}
            className="p-2 rounded-full bg-olive-200 hover:bg-olive-300 transition-colors cursor-pointer text-olive-800"
            aria-label="Start Music"
            type="button"
          >
            <Music className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-olive-200 hover:bg-olive-300 transition-colors cursor-pointer text-olive-800"
            aria-label={muted ? "Unmute" : "Mute"}
            type="button"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        )}
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-full bg-olive-200 hover:bg-olive-300 transition-colors cursor-pointer text-olive-800"
          aria-label="Game information"
          type="button"
        >
          <Info className="h-5 w-5" />
        </button>
        <a
          href="/settings"
          className="p-2 rounded-full bg-olive-200 hover:bg-olive-300 transition-colors cursor-pointer flex items-center justify-center text-olive-800"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" />
        </a>
        {user ? (
          <div className="relative group">
            <a
              href="/profile"
              className="p-2 rounded-full bg-olive-200 hover:bg-olive-300 transition-colors flex items-center justify-center cursor-pointer text-olive-800"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </a>
            <div className="absolute right-0 mt-2 w-48 bg-paper-200 rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block border-2 border-olive-700">
              <div className="px-4 py-2 text-sm text-olive-800 border-b border-olive-300">{user.email}</div>
              <a href="/profile" className="block px-4 py-2 text-sm text-olive-800 hover:bg-olive-200 cursor-pointer">
                Perfil
              </a>
              <a href="/character" className="block px-4 py-2 text-sm text-olive-800 hover:bg-olive-200 cursor-pointer">
                Personagens
              </a>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-olive-800 hover:bg-olive-200 cursor-pointer"
                type="button"
              >
                Sair
              </button>
            </div>
          </div>
        ) : (
          <a
            href="/auth"
            className="p-2 rounded-full bg-olive-200 hover:bg-olive-300 transition-colors cursor-pointer text-olive-800"
            aria-label="Login"
          >
            <User className="h-5 w-5" />
          </a>
        )}
      </div>

      {/* Main content - Staggered animation */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-10 max-w-md mx-auto w-full">
        {/* Error message */}
        {errorMessage && (
          <div
            className={`bg-red-100 border-2 border-red-700 text-red-700 px-4 py-3 rounded-md mb-6 w-full transition-all duration-700 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {errorMessage}
          </div>
        )}

        {/* Game logo/title - Maintain position from splash screen */}
        <div
          className={`mb-8 text-center transition-all duration-700 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h1
            className="text-8xl md:text-9xl font-bold mb-2 text-olive-900 tracking-wider"
            style={{ textShadow: "4px 4px 0 #e0e0c0" }}
          >
            NOVO RIO
          </h1>
          <p className="text-xl text-olive-800 mt-2">Refloreste uma área devastada pela plantação de soja</p>
        </div>

        {/* Menu options - Staggered animation */}
        <div className="flex flex-col gap-4 w-full">
          <div
            className={`transition-all duration-700 delay-100 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <HandDrawnButton onClick={handleContinueGame} disabled={isLoading} variant="primary" className="w-full">
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-t-2 border-olive-800 rounded-full animate-spin mr-2"></span>
                  Carregando...
                </span>
              ) : characters.length > 0 ? (
                "Continuar Jogo"
              ) : (
                "Iniciar Jogo"
              )}
            </HandDrawnButton>
          </div>

          <div
            className={`transition-all duration-700 delay-200 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <HandDrawnButton onClick={() => router.push("/settings")} variant="secondary" className="w-full">
              Configurações
            </HandDrawnButton>
          </div>

          {!user && (
            <div
              className={`transition-all duration-700 delay-300 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <HandDrawnButton onClick={() => router.push("/auth")} variant="secondary" className="w-full">
                Entrar / Cadastrar
              </HandDrawnButton>
            </div>
          )}

          <div
            className={`transition-all duration-700 delay-400 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <HandDrawnButton
              onClick={() => {
                // Criar um personagem padrão temporário
                const defaultCharacter = {
                  name: "Jogador Teste",
                  body: 1,
                  head: 1,
                  createdAt: new Date().toISOString(),
                }

                // Salvar no localStorage
                localStorage.setItem("character", JSON.stringify(defaultCharacter))

                // Redirecionar diretamente para o jogo
                window.location.href = "/game?debug=true"
              }}
              variant="accent"
              className="w-full flex items-center justify-center gap-2"
            >
              <span className="text-red-900 text-xl">⚡</span>
              Acesso Rápido (Pular Criação)
            </HandDrawnButton>
          </div>
        </div>

        {/* Version info - Fade in from bottom */}
        <div
          className={`mt-12 text-olive-700 text-sm transition-all duration-700 delay-500 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          Versão 1.0.0 • Novo Rio
        </div>
      </div>

      {/* Info modal */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20 p-4 animate-fadeIn">
          <div className="bg-paper-200 text-olive-900 p-6 rounded-lg max-w-md border-2 border-olive-700 animate-scaleIn">
            <h2 className="text-2xl font-bold mb-4">Sobre Novo Rio</h2>
            <p className="mb-4">
              Novo Rio é um jogo de simulação de fazenda onde você pode cultivar plantas, criar animais e interagir com
              os moradores da vila. Gerencie seus recursos, expanda sua fazenda e torne-se parte de uma comunidade
              próspera!
            </p>
            <p className="mb-6">Desenvolvido com ❤️ pela Equipe Novo Rio.</p>
            <HandDrawnButton onClick={() => setShowInfo(false)} className="w-full">
              Fechar
            </HandDrawnButton>
          </div>
        </div>
      )}
    </div>
  )
}
