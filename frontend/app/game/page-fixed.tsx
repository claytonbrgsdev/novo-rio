"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import GameHeader from "@/components/game-header"
import SimplifiedWeatherBar from "@/components/simplified-weather-bar"
import ScreenshotGameGrid from "@/components/screenshot-game-grid"
import CharacterPanel from "@/components/character-panel"
import SaveGameModal from "@/components/game/save-game-modal"
import LoadGameModal from "@/components/game/load-game-modal"
import { withAuth } from "@/lib/auth/withAuth"

function GameInterface() {
  const router = useRouter()
  
  // Game states
  const [currentView, setCurrentView] = useState<'village' | 'macro' | 'medium' | 'micro'>('medium')
  const [activeQuadrant, setActiveQuadrant] = useState("C3")
  const [chatMode, setChatMode] = useState<"chat" | "action">("chat")
  const [activeTab, setActiveTab] = useState<string>("inventory")
  const [chatInput, setChatInput] = useState<string>("")
  const [activeInventoryTab, setActiveInventoryTab] = useState<"tools" | "inputs" | "plantables">("tools")
  const [isLoading, setIsLoading] = useState(true)
  const [characterData, setCharacterData] = useState<any>(null)
  const [hasCharacter, setHasCharacter] = useState(false)
  
  // Modals
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [isClientSide, setIsClientSide] = useState(false)

  // Initialize on client-side
  useEffect(() => {
    setIsClientSide(true)
    // Simulate loading character data
    setTimeout(() => {
      setCharacterData({
        name: "Josué",
        level: 2,
        health: 85,
        head: 1,
        body: 1,
      })
      setHasCharacter(true)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Event handlers
  const handleQuadrantClick = (quadrant: string) => {
    setActiveQuadrant(quadrant)
  }

  const handleSaveGame = () => {
    setShowSaveModal(true)
  }

  const handleLoadGame = () => {
    setShowLoadModal(true)
  }

  const handleBackToMenu = () => {
    router.push("/")
  }

  const handleSaveComplete = (data: any) => {
    console.log("Game saved:", data)
    setShowSaveModal(false)
  }

  const handleLoadComplete = (data: any) => {
    console.log("Game loaded:", data)
    setShowLoadModal(false)
    setCharacterData(data)
  }

  const handleSendMessage = () => {
    if (chatInput.trim() === "") return
    console.log("Message sent:", chatInput, "Mode:", chatMode)
    setChatInput("")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-amber-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800">Carregando jogo...</p>
        </div>
      </div>
    )
  }

  // Main game content
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-amber-50">
      {/* Game Header with Eko dialogue */}
      <GameHeader onSave={handleSaveGame} onLoad={handleLoadGame} onHome={handleBackToMenu} />

      {/* Weather Bar */}
      <SimplifiedWeatherBar temperature={25} condition="sunny" time="12:08" humidity={65} />

      {/* Main Game Area with Grid and Right Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Game Grid Area */}
          <div className="flex-1 overflow-hidden bg-amber-50">
            {/* Actual Game Grid */}
            <div className="h-full w-full bg-green-400 overflow-hidden border-amber-200 border-2">
              <ScreenshotGameGrid viewType={currentView} activeQuadrant={activeQuadrant} onQuadrantClick={handleQuadrantClick} />
            </div>
          </div>

          {/* Bottom Tabs */}
          <div className="bg-amber-200 border-t border-amber-300 flex h-8">
            <div 
              className={`px-6 h-full flex items-center cursor-pointer ${activeInventoryTab === 'tools' ? 'bg-amber-300' : ''}`}
              onClick={() => setActiveInventoryTab('tools')}
            >
              <span className="text-amber-900 text-sm">INVENTÁRIO</span>
            </div>
            <div 
              className={`px-6 h-full flex items-center cursor-pointer ${activeInventoryTab === 'inputs' ? 'bg-amber-300' : ''}`}
              onClick={() => setActiveInventoryTab('inputs')}
            >
              <span className="text-amber-900 text-sm">RECURSOS</span>
            </div>
            <div 
              className={`px-6 h-full flex items-center cursor-pointer ${activeInventoryTab === 'plantables' ? 'bg-amber-300' : ''}`}
              onClick={() => setActiveInventoryTab('plantables')}
            >
              <span className="text-amber-900 text-sm">PLANTAS</span>
            </div>
            <div className="flex-1"></div>
            <div className="px-6 h-full flex items-center bg-amber-300 text-amber-900 text-sm font-medium">
              CHAT / AÇÃO
            </div>
          </div>

          {/* Bottom Area: Inventory and Chat */}
          <div className="h-[190px] bg-amber-100 border-t-2 border-amber-200 grid grid-cols-2 gap-0">
            {/* Left side: Inventory */}
            <div className="flex flex-col border-r border-amber-300">
              {/* Inventory Button Row */}
              <div className="flex bg-amber-200 text-xs font-medium border-b border-amber-300 uppercase">
                <button
                  className={`px-2 py-1 text-amber-900 border-r border-amber-300 ${activeTab === "inventory" ? "bg-amber-300" : ""}`}
                  onClick={() => setActiveTab("inventory")}
                >
                  Inventário
                </button>
                <button
                  className={`px-2 py-1 text-amber-900 border-r border-amber-300 ${activeTab === "tools" ? "bg-amber-300" : ""}`}
                  onClick={() => setActiveTab("tools")}
                >
                  Ferramentas
                </button>
                <button
                  className={`px-2 py-1 text-amber-900 border-r border-amber-300 ${activeTab === "plants" ? "bg-amber-300" : ""}`}
                  onClick={() => setActiveTab("plants")}
                >
                  Plantas
                </button>
                <button
                  className={`px-2 py-1 text-amber-900 ${activeTab === "seeds" ? "bg-amber-300" : ""}`}
                  onClick={() => setActiveTab("seeds")}
                >
                  Sementes
                </button>
              </div>
              
              <div className="flex-1 p-2 overflow-y-auto">
                {activeTab === "inventory" && (
                  <div className="grid grid-cols-4 gap-2">
                    <div className="aspect-square bg-amber-50 border border-amber-300 flex items-center justify-center">
                      <div className="text-2xl">🧰</div>
                    </div>
                    <div className="aspect-square bg-amber-50 border border-amber-300 flex items-center justify-center">
                      <div className="text-2xl">🌱</div>
                    </div>
                  </div>
                )}
                {activeTab === "tools" && (
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center p-1 bg-amber-50 border border-amber-300">
                      <div className="text-xl mr-2">⛏️</div>
                      <div className="flex-1">Pá</div>
                      <div className="text-xs">Quant: 1</div>
                    </div>
                    <div className="flex items-center p-1 bg-amber-50 border border-amber-300">
                      <div className="text-xl mr-2">💧</div>
                      <div className="flex-1">Regador</div>
                      <div className="text-xs">Quant: 1</div>
                    </div>
                  </div>
                )}
                {activeTab === "plants" && (
                  <div>Plantas disponíveis</div>
                )}
                {activeTab === "seeds" && (
                  <div>Sementes disponíveis</div>
                )}
              </div>
            </div>
            
            {/* Right side: Chat */}
            <div className="flex flex-col">
              {/* Chat Header */}
              <div className="bg-amber-200 py-1 px-2 text-xs font-medium text-amber-900 uppercase border-b border-amber-300">
                Chat / Ação
              </div>
              
              {/* Chat Box */}
              <div className="flex-1 p-2 overflow-y-auto">
                <div className="text-xs text-amber-900">
                  Digite sua mensagem aqui...
                </div>
              </div>
              
              {/* Chat Input */}
              <div className="flex border-t border-amber-300">
                <button
                  className="flex-1 bg-amber-300 text-amber-900 py-1 text-xs uppercase font-medium border-r border-amber-400"
                  onClick={() => setChatMode('chat')}
                >
                  Chat
                </button>
                <button
                  className="flex-1 bg-amber-200 text-amber-800 py-1 text-xs uppercase font-medium"
                  onClick={() => setChatMode('action')}
                >
                  Ação
                </button>
                <button
                  className="px-3 bg-amber-300 py-1 text-xs uppercase font-medium text-amber-900 border-l border-amber-400"
                  onClick={handleSendMessage}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Character Panel */}
        <div className="w-[230px] bg-amber-100 border-l border-amber-300 flex flex-col">
          <div className="p-2 bg-amber-200 border-b border-amber-300 text-amber-900 font-medium text-center">
            {characterData?.name || "Josué"}
          </div>
          <div className="p-2 flex flex-col items-center justify-center flex-1">
            {/* Character Stats */}
            <div className="w-full flex mb-2">
              <div className="flex-1 text-amber-900 text-xs flex items-center">
                <span className="mr-1">💰</span> BALANCE
              </div>
              <div className="flex-1 text-amber-900 text-xs flex items-center justify-end">
                <span className="mr-1">✨</span> AURA
              </div>
            </div>
            
            {/* Character Display */}
            <div className="flex-1 flex justify-center items-center p-4">
              <CharacterPanel
                name={characterData?.name || "Agricultor"}
                level={2}
                role="Plantador"
                health={85}
                headId={characterData?.head || 1}
                bodyId={characterData?.body || 1}
              />
            </div>
            
            {/* Action buttons */}
            <div className="grid grid-cols-5 gap-1 mt-2">
              <button className="bg-amber-200 p-1 text-amber-900 text-[10px] border border-amber-300">
                <span className="block text-lg">🔍</span>
                TERRENO
              </button>
              <button className="bg-amber-200 p-1 text-amber-900 text-[10px] border border-amber-300">
                <span className="block text-lg">🏠</span>
                HOME
              </button>
              <button className="bg-amber-200 p-1 text-amber-900 text-[10px] border border-amber-300">
                <span className="block text-lg">📊</span>
                STATS
              </button>
              <button className="bg-amber-200 p-1 text-amber-900 text-[10px] border border-amber-300">
                <span className="block text-lg">⚙️</span>
                CONFIG
              </button>
              <button className="bg-amber-200 p-1 text-amber-900 text-[10px] border border-amber-300">
                <span className="block text-lg">❓</span>
                AJUDA
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isClientSide && (
        <>
          <SaveGameModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            characterData={characterData}
            onSave={handleSaveComplete}
          />
          <LoadGameModal
            isOpen={showLoadModal}
            onClose={() => setShowLoadModal(false)}
            onLoad={handleLoadComplete}
          />
        </>
      )}
    </div>
  )
}

// Export the component wrapped with the withAuth HOC
export default withAuth(GameInterface)
