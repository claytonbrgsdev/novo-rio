"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import GameHeader from "@/components/game-header"
import WeatherBar from "@/components/weather-bar"
import GameGrid from "@/components/game-grid"
import CharacterPanel from "@/components/character-panel"
import PlayerStats from "@/components/player-stats"
import InventoryPanel from "@/components/inventory-panel"
import InventoryTabs from "@/components/inventory-tabs"
import ChatPanel from "@/components/chat-panel"
import ViewSwitch from "@/components/view-switch"
import SaveGameModal from "@/components/game/save-game-modal"
import LoadGameModal from "@/components/game/load-game-modal"
import QuadrantInfo from "@/components/quadrant-info"
// Authentication bypass for debugging

function GameInterface() {
  const router = useRouter()
  const [activeInventoryTab, setActiveInventoryTab] = useState<"tools" | "inputs" | "plantables">("tools")
  
  // Game states
  const [currentView, setCurrentView] = useState<'village' | 'macro' | 'medium' | 'micro'>('medium')
  const [activeQuadrant, setActiveQuadrant] = useState("C3")
  const [isQuadrantExpanded, setIsQuadrantExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<"tools" | "inputs" | "plantables">("tools")
  const [chatMode, setChatMode] = useState<"chat" | "action">("chat")
  const [chatInput, setChatInput] = useState<string>("")
  // Removed activeInventoryTab state as it's now managed by InventoryPanel
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
  
  // Add CSS to ensure nothing is cropped at viewport edges
  useEffect(() => {
    // Add a small padding to the bottom of the viewport to prevent cropping
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.documentElement.style.overflow = 'hidden';
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
      <div className="flex items-center justify-center h-[100dvh] bg-amber-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-amber-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800">Carregando jogo...</p>
        </div>
      </div>
    )
  }

  // Main game content
  return (
    <div className="flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden bg-amber-50 p-3 md:p-5">
      <div className="flex flex-col h-full w-full overflow-hidden bg-paper-100 rounded-lg shadow-md border border-amber-200">
        {/* Game Header with Eko dialogue */}
        <GameHeader onSave={handleSaveGame} onLoad={handleLoadGame} onHome={handleBackToMenu} />

        {/* Weather Bar */}
        <WeatherBar temperature={25} condition="sunny" time="12:08" humidity={65} />

        {/* Main Game Area with Grid and Right Sidebar */}
        <div className="flex-1 flex overflow-hidden max-h-[calc(100%-140px)]">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Game Grid Area */}
            <div className="flex-1 overflow-hidden bg-paper-100">
              {/* Actual Game Grid */}
              <div className="h-full w-full overflow-hidden border-olive-300 border-2 bg-gradient-to-br from-green-400 to-green-500 shadow-inner">
                <GameGrid viewType={currentView} activeQuadrant={activeQuadrant} onQuadrantClick={handleQuadrantClick} />
              </div>
            </div>

            {/* Main content area with two equal columns */}
            <div className="flex" style={{ height: '200px' }}>
              {/* Left column: Inventory (with header) */}
              <div className="w-1/2 flex flex-col border-r border-olive-300">
                {/* Inventory header */}
                <div className="bg-paper-300 h-12 flex-shrink-0 flex items-center px-6">
                  <div className="text-base font-extrabold uppercase tracking-wider text-olive-900 mr-4">
                    INVENTÁRIO
                  </div>
                  <div className="h-full flex items-center border-l border-olive-200 pl-4">
                    <InventoryTabs 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab} 
                    />
                  </div>
                </div>
                
                {/* Inventory content */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <InventoryPanel 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                  />
                </div>
              </div>
              
              {/* Right column: Chat (full height) */}
              <div className="w-1/2 h-full">
                <ChatPanel 
                  mode={chatMode} 
                  onModeChange={setChatMode} 
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Quadrant Info and Character Panel */}
          <div className="w-[450px] border-l border-olive-300 flex flex-col h-full overflow-hidden">
            {/* Quadrant Information - Separate from Character Panel */}
            <div className="bg-amber-50 border-b border-amber-200 p-2">
              <QuadrantInfo 
                activeQuadrant={activeQuadrant} 
                onExpandedChange={setIsQuadrantExpanded} 
              />
            </div>
            
            {/* Character Panel - Contains character name and display */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <CharacterPanel 
                currentView={currentView}
                onViewChange={(view) => setCurrentView(view as 'village' | 'macro' | 'medium' | 'micro')}
                activeQuadrant={null} // Remove activeQuadrant from CharacterPanel since we're handling it separately
                isQuadrantExpanded={isQuadrantExpanded}
              />
              
              {/* View Switch */}
              <div className="h-[60px] shrink-0 border-t border-olive-300">
                <ViewSwitch 
                  currentView={currentView}
                  onViewChange={(view) => setCurrentView(view as 'village' | 'macro' | 'medium' | 'micro')}
                />
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
    </div>
  )
}

// Export the component directly (authentication bypass)
export default GameInterface
