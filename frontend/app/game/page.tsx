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
import { Home, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import type { ViewType } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-context"
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
import { useCharacter } from "@/hooks/useCharacter"
import withAuth from "@/components/auth/with-auth"
import { AUTH_STORAGE_KEYS } from "@/services/api"

function GameInterface() {
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
  const { user } = useAuth()
  const { toast } = useToast()
  const { muted, toggleMute } = useAudio()
  const { character } = useCharacter()

  // Check if user is authenticated and has player_id
  useEffect(() => {
    // Debug logging for authentication debugging
    console.log('GameInterface: token=', localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN))
    console.log('GameInterface: user=', user)
    
    // Since withAuth HOC already handles auth checks, we can simplify auth logic
    setLoadingSteps(prev => ({
      ...prev,
      auth: { done: true, error: false },
    }))
    
    // Check if user has a player_id
    if (user && user.player_id === null) {
      console.log('GameInterface: player_id is null, redirecting to character customizer')
      router.replace('/character')
      return
    }

    const checkCharacter = async () => {
      try {
        // Make sure we have a user (withAuth should guarantee this)
        if (!user || !user.id) {
          console.error("User ID is missing even though withAuth should guarantee user exists")
          setLoadingSteps(prev => ({
            ...prev,
            character: { done: true, error: true },
          }))
          setError("Erro ao carregar dados do usuário. Por favor, faça login novamente.")
          return
        }
        
        // Check for missing player_id - should be handled by the useEffect guard above
        // but adding another check here for safety
        if (user.player_id === null) {
          console.log('checkCharacter: player_id is null, redirecting to character customizer')
          setLoadingSteps(prev => ({
            ...prev,
            character: { done: true, error: true },
          }))
          setError("Personagem não encontrado. Redirecionando para a criação de personagem...")
          router.replace('/character')
          return
        }
        
        // Try to load character data from localStorage
        const savedCharacter = localStorage.getItem("character")
        if (savedCharacter) {
          setCharacterData(JSON.parse(savedCharacter))
          setHasCharacter(true)
          setLoadingSteps(prev => ({
            ...prev,
            character: { done: true, error: false },
          }))
        } else {
          // No character found - redirect to character creation
          setLoadingSteps(prev => ({
            ...prev,
            character: { done: true, error: true },
          }))
          setError("Nenhum personagem encontrado. Redirecionando para a criação de personagem...")
          setTimeout(() => {
            router.push("/character")
          }, 2000)
          return
        }
      } catch (err) {
        console.error("Error in character check:", err)
        setLoadingSteps(prev => ({
          ...prev,
          character: { done: true, error: true },
        }))
        setError("Erro ao carregar dados do personagem. Redirecionando para a criação de personagem...")
        setTimeout(() => {
          router.push("/character")
        }, 2000)
        return
      }

      // Simulate game data loading
      setTimeout(() => {
        setLoadingSteps(prev => ({
          ...prev,
          gameData: { done: true, error: false },
        }))
        setIsLoading(false)

        // Show toast with character info if available
        if (character) {
          toast({
            title: "Personagem Carregado",
            description: `Nome: ${character.name || 'Desconhecido'}`,
            duration: 5000,
          })
        }
      }, 1000)
    }

    checkCharacter()

    // Listen for view change events
    const handleViewChangeEvent = (e: CustomEvent) => {
      if (e.detail && e.detail.view) {
        setCurrentView(e.detail.view as ViewType)
      }
    }

    document.addEventListener("viewChange", handleViewChangeEvent as EventListener)

    return () => {
      document.removeEventListener("viewChange", handleViewChangeEvent as EventListener)
    }
  }, [user, router, toast, character])

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

  // Custom handler for when a save game is completed
  const handleSaveComplete = (saveData: any) => {
    setCharacterData(saveData)
    toast({
      title: "Jogo Salvo",
      description: "Seu progresso foi salvo com sucesso!",
      duration: 3000,
    })
  }

  // Custom handler for when a game is loaded
  const handleLoadComplete = (loadData: any) => {
    setActiveQuadrant(loadData.quadrant || "C2")
    toast({
      title: "Jogo Carregado",
      description: "Seu jogo foi carregado com sucesso!",
      duration: 3000,
    })
    setShowLoadModal(false)
  }

  // Show loading state while any step is loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-paper-100 p-4">
        <div className="max-w-md w-full bg-paper-300 rounded-lg shadow-lg p-6 text-center border-2 border-olive-700">
          <h2 className="text-2xl font-bold text-olive-900 mb-4">Carregando jogo...</h2>
          <div className="space-y-6">
            {/* Auth loading status */}
            <div className="flex items-center space-x-3">
              {loadingSteps.auth.done ? (
                loadingSteps.auth.error ? (
                  <AlertCircle className="text-red-500 w-6 h-6 animate-pulse" />
                ) : (
                  <CheckCircle2 className="text-green-500 w-6 h-6" />
                )
              ) : (
                <Loader2 className="text-olive-500 w-6 h-6 animate-spin" />
              )}
              <span className="text-olive-800 font-medium">
                {loadingSteps.auth.done
                  ? loadingSteps.auth.error
                    ? "Erro ao verificar autenticação"
                    : "Autenticação verificada"
                  : "Verificando autenticação..."}
              </span>
            </div>

            {/* Character loading status */}
            <div className="flex items-center space-x-3">
              {loadingSteps.character.done ? (
                loadingSteps.character.error ? (
                  <AlertCircle className="text-red-500 w-6 h-6 animate-pulse" />
                ) : (
                  <CheckCircle2 className="text-green-500 w-6 h-6" />
                )
              ) : (
                <Loader2 className="text-olive-500 w-6 h-6 animate-spin" />
              )}
              <span className="text-olive-800 font-medium">
                {loadingSteps.character.done
                  ? loadingSteps.character.error
                    ? "Erro ao carregar personagem"
                    : "Personagem carregado"
                  : "Carregando dados do personagem..."}
              </span>
            </div>

            {/* Game data loading status */}
            <div className="flex items-center space-x-3">
              {loadingSteps.gameData.done ? (
                loadingSteps.gameData.error ? (
                  <AlertCircle className="text-red-500 w-6 h-6 animate-pulse" />
                ) : (
                  <CheckCircle2 className="text-green-500 w-6 h-6" />
                )
              ) : (
                <Loader2 className="text-olive-500 w-6 h-6 animate-spin" />
              )}
              <span className="text-olive-800 font-medium">
                {loadingSteps.gameData.done
                  ? loadingSteps.gameData.error
                    ? "Erro ao carregar dados do jogo"
                    : "Dados do jogo carregados"
                  : "Carregando dados do jogo..."}
              </span>
            </div>
          </div>

          {/* Error message if any */}
          {error && (
            <div className="mt-6 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <div className="w-16 h-16 border-t-4 border-olive-600 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  // Main game content
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200">
      {/* Game Header */}
      <GameHeader onSave={handleSaveGame} onLoad={handleLoadGame} onHome={handleBackToMenu} />

      {/* Weather Bar */}
      <WeatherBar temperature={25} condition="sunny" />

      {/* Main Game Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Character & Inventory Panel */}
        <div className="w-1/5 min-w-[220px] hidden md:flex flex-col bg-paper-100 p-2 shadow-md border-r-2 border-olive-300">
          <CharacterPanel
            name={characterData?.name || "Agricultor"}
            level={2}
            role="Plantador"
            health={85}
            headId={characterData?.head || 1}
            bodyId={characterData?.body || 1}
          />
          <div className="mt-4">
            <InventoryPanel activeTab={activeInventoryTab} onTabChange={setActiveInventoryTab} />
          </div>
        </div>

        {/* Main Game Grid Area */}
        <div className="flex-1 overflow-hidden relative">
          <GameGrid view={currentView} activeQuadrant={activeQuadrant} onQuadrantClick={handleQuadrantClick} />

          {/* View Switcher */}
          <div className="absolute bottom-4 right-4 z-10">
            <ViewSwitch currentView={currentView} onChange={handleViewChange} />
          </div>

          {/* Game Music Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <GameMusicButton />
          </div>

          {/* Desktop Interface Elements (hidden on mobile) */}
          <div className="absolute bottom-28 left-0 right-0 hidden md:flex justify-center space-x-2">
            <div className="inline-flex p-1 rounded-lg bg-olive-100/80 border-2 border-olive-700/30 shadow-lg cursor-pointer hover:bg-olive-200/80 transition-colors">
              <LeafIcon className="w-10 h-10 text-olive-700" />
            </div>
            <div className="inline-flex p-1 rounded-lg bg-olive-100/80 border-2 border-olive-700/30 shadow-lg cursor-pointer hover:bg-olive-200/80 transition-colors">
              <SproutIcon className="w-10 h-10 text-olive-700" />
            </div>
            <div className="inline-flex p-1 rounded-lg bg-olive-100/80 border-2 border-olive-700/30 shadow-lg cursor-pointer hover:bg-olive-200/80 transition-colors">
              <SunIcon className="w-10 h-10 text-olive-700" />
            </div>
            <div className="inline-flex p-1 rounded-lg bg-olive-100/80 border-2 border-olive-700/30 shadow-lg cursor-pointer hover:bg-olive-200/80 transition-colors">
              <FlowerIcon className="w-10 h-10 text-olive-700" />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Player Stats & Chat (hidden on small screens) */}
        <div className="w-1/5 min-w-[220px] hidden lg:flex flex-col bg-paper-100 p-2 shadow-md border-l-2 border-olive-300">
          <PlayerStats
            coins={250}
            experience={750}
            nextLevel={1000}
            plantingSlots={{
              used: 3,
              total: 5,
            }}
          />
          <div className="mt-4 flex-1">
            <ChatPanel mode={chatMode} onModeChange={setChatMode} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar (visible only on small screens) */}
      <div className="md:hidden py-2 px-4 bg-paper-300 border-t-2 border-olive-300 flex justify-around items-center">
        <Link href="/character">
          <div className="flex flex-col items-center">
            <div className="p-1 rounded-lg bg-olive-100 border border-olive-300">
              <Home className="w-6 h-6 text-olive-700" />
            </div>
            <span className="text-xs text-olive-700 mt-1">Personagem</span>
          </div>
        </Link>
        {/* Add more mobile navigation items as needed */}
      </div>

      {/* Modals */}
      {showSaveModal && (
        <SaveGameModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveComplete}
          characterData={characterData}
        />
      )}

      {showLoadModal && (
        <LoadGameModal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          onLoad={handleLoadComplete}
        />
      )}
    </div>
  )
}

// Export the component wrapped with the withAuth HOC
export default withAuth(GameInterface)
