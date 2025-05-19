"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import GameHeader from "@/components/game-header"
import WeatherBar from "@/components/weather-bar"
import GameGrid from "@/components/game-grid"
import InventoryPanel from "@/components/inventory-panel"
import ChatPanel from "@/components/chat-panel"
import CharacterPanel from "@/components/character-panel"
import PlayerStats from "@/components/player-stats"
import ViewSwitch from "@/components/view-switch"
import { Home, AlertCircle, Loader2 } from "lucide-react"
import type { ViewType } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-context"
import { loadCharacterCustomizations } from "@/lib/supabase"
import SaveGameModal from "@/components/game/save-game-modal"
import LoadGameModal from "@/components/game/load-game-modal"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import LeafIcon from "@/components/hand-drawn/leaf"
import SproutIcon from "@/components/hand-drawn/sprout"
import SunIcon from "@/components/hand-drawn/sun"
import FlowerIcon from "@/components/hand-drawn/flower"
import { useAudio } from "@/components/audio/audio-context"
import GameMusicButton from "@/components/audio/game-music-button"
// Adicione o hook useCharacter
import { useCharacter } from "@/hooks/useCharacter"

export default function GameInterface() {
  const [currentView, setCurrentView] = useState<ViewType>("medium")
  const [activeQuadrant, setActiveQuadrant] = useState("C2")
  const [chatMode, setChatMode] = useState<"chat" | "action">("chat")
  const [activeInventoryTab, setActiveInventoryTab] = useState<"tools" | "inputs" | "plantables">("tools")
  const [isLoading, setIsLoading] = useState(true)
  const [characterData, setCharacterData] = useState<any>(null)
  const [hasCharacter, setHasCharacter] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingSteps, setLoadingSteps] = useState({
    auth: { done: false, error: false },
    character: { done: false, error: false },
    gameData: { done: false, error: false },
  })
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const { muted, toggleMute } = useAudio()
  // Dentro do componente GameInterface, adicione:
  const { character } = useCharacter()

  // Check if user has created a character
  useEffect(() => {
    if (authLoading) return

    // Update auth loading step
    setLoadingSteps((prev) => ({
      ...prev,
      auth: { done: true, error: !user },
    }))

    if (!user) {
      setError("Você precisa estar autenticado para acessar o jogo.")
      setTimeout(() => {
        router.push("/auth?redirected=true&from=game")
      }, 2000)
      return
    }

    const checkCharacter = async () => {
      try {
        // First try to load from Supabase
        const { data, error } = await loadCharacterCustomizations(user.id)

        if (error) {
          console.error("Error loading characters:", error)
          throw error
        }

        if (data && data.length > 0) {
          setHasCharacter(true)
          // Use the first character
          setCharacterData({
            name: data[0].name,
            body: data[0].body_id,
            head: data[0].head_id,
            tool: data[0].tool_id,
          })
          setLoadingSteps((prev) => ({
            ...prev,
            character: { done: true, error: false },
          }))
        } else {
          // Fallback to localStorage
          try {
            const savedCharacter = localStorage.getItem("character")
            if (savedCharacter) {
              setCharacterData(JSON.parse(savedCharacter))
              setHasCharacter(true)
              setLoadingSteps((prev) => ({
                ...prev,
                character: { done: true, error: false },
              }))

              // Verificar se estamos no modo debug
              const isDebugMode = new URLSearchParams(window.location.search).get("debug") === "true"
              if (isDebugMode) {
                console.log("Modo de depuração ativado - usando personagem do localStorage")
              }
            } else {
              // No character found
              setHasCharacter(false)
              setLoadingSteps((prev) => ({
                ...prev,
                character: { done: true, error: true },
              }))
              setError("Nenhum personagem encontrado. Redirecionando para a criação de personagem...")
              setTimeout(() => {
                router.push("/character")
              }, 2000)
            }
          } catch (err) {
            console.error("Error loading character from localStorage:", err)
            setHasCharacter(false)
            setLoadingSteps((prev) => ({
              ...prev,
              character: { done: true, error: true },
            }))
            setError("Erro ao carregar dados do personagem. Redirecionando para a criação de personagem...")
            setTimeout(() => {
              router.push("/character")
            }, 2000)
          }
        }
      } catch (err) {
        console.error("Error in character check:", err)
        setLoadingSteps((prev) => ({
          ...prev,
          character: { done: true, error: true },
        }))

        // Fallback to localStorage
        try {
          const savedCharacter = localStorage.getItem("character")
          if (savedCharacter) {
            setCharacterData(JSON.parse(savedCharacter))
            setHasCharacter(true)
            setLoadingSteps((prev) => ({
              ...prev,
              character: { done: true, error: false },
            }))
          } else {
            setHasCharacter(false)
            setError("Nenhum personagem encontrado. Redirecionando para a criação de personagem...")
            setTimeout(() => {
              router.push("/character")
            }, 2000)
          }
        } catch (err) {
          console.error("Error loading character from localStorage:", err)
          setHasCharacter(false)
          setError("Erro ao carregar dados do personagem. Redirecionando para a criação de personagem...")
          setTimeout(() => {
            router.push("/character")
          }, 2000)
        }
      } finally {
        // Simular carregamento de dados do jogo
        setTimeout(() => {
          setLoadingSteps((prev) => ({
            ...prev,
            gameData: { done: true, error: false },
          }))
          setIsLoading(false)

          // Mostrar toast com informações do personagem
          // Atualize o toast para usar os dados do personagem real
          // Exemplo:
          // if (characterData) {
          //   toast({
          //     title: "Personagem Carregado",
          //     description: `Nome: ${characterData.name}, Corpo: ${characterData.body}, Cabeça: ${characterData.head}`,
          //     duration: 5000,
          //   })
          // }
          // por:
          if (character) {
            toast({
              title: "Personagem Carregado",
              description: `Nome: ${character.name}, Corpo: ${character.bodyId}, Cabeça: ${character.headId}`,
              duration: 5000,
            })
          }
        }, 1000)
      }
    }

    checkCharacter()

    // Escutar eventos de mudança de visualização
    const handleViewChange = (e: CustomEvent) => {
      if (e.detail && e.detail.view) {
        setCurrentView(e.detail.view as ViewType)
      }
    }

    document.addEventListener("viewChange", handleViewChange as EventListener)

    return () => {
      document.removeEventListener("viewChange", handleViewChange as EventListener)
    }
  }, [user, authLoading, router, toast, character])

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  const handleQuadrantClick = (quadrant: string) => {
    if (currentView === "medium") {
      setActiveQuadrant(quadrant)
      setCurrentView("micro")
    }
  }

  const handleBackToMenu = () => {
    router.push("/")
  }

  const handleSaveGame = () => {
    setShowSaveModal(true)
  }

  const handleLoadGame = () => {
    setShowLoadModal(true)
  }

  const handleLoadGameState = (gameState: any) => {
    // Update game state with loaded data
    if (gameState.character) {
      setCharacterData(gameState.character)
    }

    if (gameState.lastPosition) {
      setActiveQuadrant(gameState.lastPosition)
    }

    // Close the modal
    setShowLoadModal(false)
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper-200 text-olive-800 overflow-hidden font-handwritten relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-30">
          <LeafIcon />
        </div>
        <div className="absolute bottom-10 right-10 opacity-30">
          <SproutIcon />
        </div>

        <div className="bg-paper-100 p-6 rounded-lg shadow-lg max-w-md w-full text-center border-2 border-olive-700">
          <h1 className="text-2xl font-bold text-olive-900 mb-6">Carregando jogo...</h1>

          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {loadingSteps.auth.done ? (
                  loadingSteps.auth.error ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <div className="h-6 w-6 text-green-500 flex items-center justify-center">✓</div>
                  )
                ) : (
                  <Loader2 className="h-6 w-6 text-olive-600 animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-left font-medium">Verificando autenticação</p>
                {loadingSteps.auth.error && <p className="text-left text-sm text-red-500">Falha na autenticação</p>}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {loadingSteps.character.done ? (
                  loadingSteps.character.error ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <div className="h-6 w-6 text-green-500 flex items-center justify-center">✓</div>
                  )
                ) : (
                  <Loader2 className="h-6 w-6 text-olive-600 animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-left font-medium">Carregando personagem</p>
                {loadingSteps.character.error && (
                  <p className="text-left text-sm text-red-500">Personagem não encontrado</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {loadingSteps.gameData.done ? (
                  loadingSteps.gameData.error ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <div className="h-6 w-6 text-green-500 flex items-center justify-center">✓</div>
                  )
                ) : (
                  <Loader2 className="h-6 w-6 text-olive-600 animate-spin" />
                )}
              </div>
              <p className="text-left font-medium">Preparando dados do jogo</p>
            </div>
          </div>

          <div className="w-full bg-olive-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-olive-600 h-full transition-all duration-500"
              style={{
                width: `${
                  ((loadingSteps.auth.done ? 1 : 0) +
                    (loadingSteps.character.done ? 1 : 0) +
                    (loadingSteps.gameData.done ? 1 : 0)) *
                  33.33
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper-200 text-olive-800 overflow-hidden font-handwritten relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-30">
          <LeafIcon />
        </div>
        <div className="absolute bottom-10 right-10 opacity-30">
          <SproutIcon />
        </div>

        <div className="bg-paper-100 p-6 rounded-lg shadow-lg max-w-md w-full text-center border-2 border-olive-700">
          <h1 className="text-2xl font-bold text-olive-900 mb-4">Oops!</h1>
          <div className="bg-red-100 border-2 border-red-700 text-red-700 p-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <div className="flex justify-between">
            <Link
              href="/"
              className="bg-olive-600 text-white py-2 px-4 rounded hover:bg-olive-700 transition-colors hand-drawn-button"
            >
              Voltar ao Menu
            </Link>
            <Link
              href="/character"
              className="bg-olive-600 text-white py-2 px-4 rounded hover:bg-olive-700 transition-colors hand-drawn-button"
            >
              Criar Personagem
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Substitua a verificação de personagem existente
  // Em vez de verificar characterData, verifique character
  // Exemplo:
  // if (!hasCharacter) {
  //   return (
  //     ...
  //   )
  // }
  // por:
  if (!character && !isLoading) {
    return (
      <div className="flex flex-col h-screen bg-paper-200 text-olive-800 overflow-hidden items-center justify-center font-handwritten relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 opacity-30">
          <LeafIcon />
        </div>
        <div className="absolute bottom-10 right-10 opacity-30">
          <SproutIcon />
        </div>

        <div className="w-24 h-24 border-t-4 border-olive-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-olive-800 font-medium">Redirecionando para criação de personagem...</p>
      </div>
    )
  }

  // Current game state for saving
  const currentGameState = {
    character: characterData,
    lastPosition: activeQuadrant,
    inventory: {
      tools: ["Pá", "Facão", "Regador"],
      inputs: ["Água", "Fertilizante"],
      plantables: ["Sementes de Abóbora", "Mudas de Cenoura"],
    },
    lastSaved: new Date().toISOString(),
  }

  return (
    <div className="flex flex-col h-screen bg-paper-200 text-olive-800 overflow-hidden font-handwritten relative">
      {/* SVG Filter for hand-drawn effect */}
      <svg width="0" height="0" className="absolute">
        <filter id="hand-drawn">
          <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </svg>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 opacity-10 pointer-events-none">
        <LeafIcon />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10 pointer-events-none">
        <SproutIcon />
      </div>
      <div className="absolute top-1/4 right-1/4 opacity-10 pointer-events-none">
        <SunIcon />
      </div>
      <div className="absolute bottom-1/4 left-1/4 opacity-10 pointer-events-none">
        <FlowerIcon />
      </div>

      {/* Top section - EKO DIALOGUE */}
      <GameHeader />

      {/* Weather Banner */}
      <div className="flex-none">
        <WeatherBar />
      </div>

      {/* Main content area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Left side - Main content */}
        <div className="flex flex-col w-3/4 border-r-2 border-olive-300">
          {/* Game Grid */}
          <div className="flex-grow overflow-auto bg-olive-100">
            <GameGrid viewType={currentView} activeQuadrant={activeQuadrant} onQuadrantClick={handleQuadrantClick} />
          </div>

          {/* Bottom panels */}
          <div className="flex h-1/4 min-h-[180px] border-t-2 border-olive-300">
            {/* Inventory */}
            <div className="w-1/2 border-r-2 border-olive-300 bg-paper-100">
              <InventoryPanel activeTab={activeInventoryTab} onTabChange={setActiveInventoryTab} />
            </div>

            {/* Chat/Action */}
            <div className="w-1/2 bg-paper-200">
              <ChatPanel mode={chatMode} onModeChange={setChatMode} />
            </div>
          </div>
        </div>

        {/* Right side - Character panel - Redesigned according to wireframe */}
        <div className="w-1/4 flex flex-col">
          {/* Player Stats - Top section with name, balance and aura */}
          <div className="h-[80px] flex-none border-b-2 border-olive-300 bg-paper-300">
            <PlayerStats />
          </div>

          {/* Character View - Middle section with character and tool info */}
          <div className="flex-grow bg-paper-100">
            <CharacterPanel currentView={currentView} onViewChange={handleViewChange} />
          </div>

          {/* View Switch - Bottom section with navigation icons */}
          <div className="h-[60px] flex-none border-t-2 border-olive-300 bg-olive-200">
            <ViewSwitch currentView={currentView} onViewChange={handleViewChange} />
          </div>
        </div>
      </div>

      {/* Game action buttons */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <button
          onClick={handleBackToMenu}
          className="bg-olive-700 text-white p-2 rounded-md hover:bg-olive-600 transition-colors hand-drawn-button"
          title="Menu Principal"
        >
          <Home className="h-5 w-5" />
        </button>
      </div>

      {/* Music button */}
      <GameMusicButton />

      {/* Save Game Modal */}
      <SaveGameModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        gameState={currentGameState}
        onSaveComplete={() => setShowSaveModal(false)}
      />

      {/* Load Game Modal */}
      <LoadGameModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} onLoadGame={handleLoadGameState} />
    </div>
  )
}
