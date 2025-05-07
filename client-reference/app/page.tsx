"use client"

import { useState, useEffect } from "react"
import GameHeader from "@/components/game-header"
import WeatherBar from "@/components/weather-bar"
import GameGrid from "@/components/game-grid"
import InventoryPanel from "@/components/inventory-panel"
import ChatPanel from "@/components/chat-panel"
import CharacterPanel from "@/components/character-panel"
import type { ViewType } from "@/lib/types"

export default function GameInterface() {
  const [currentView, setCurrentView] = useState<ViewType>("medium")
  const [activeQuadrant, setActiveQuadrant] = useState("C2")
  const [chatMode, setChatMode] = useState<"chat" | "action">("chat")
  const [activeInventoryTab, setActiveInventoryTab] = useState<"tools" | "inputs" | "plantables">("tools")

  useEffect(() => {
    // Listen for custom view change events
    const handleViewChange = (e: CustomEvent) => {
      if (e.detail && e.detail.view) {
        setCurrentView(e.detail.view as ViewType)
      }
    }

    document.addEventListener("viewChange", handleViewChange as EventListener)

    return () => {
      document.removeEventListener("viewChange", handleViewChange as EventListener)
    }
  }, [])

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
  }

  const handleQuadrantClick = (quadrant: string) => {
    if (currentView === "medium") {
      setActiveQuadrant(quadrant)
      setCurrentView("micro")
    }
  }

  return (
    <div className="flex flex-col h-screen bg-amber-50 text-stone-800 overflow-hidden">
      {/* Bloco Superior (fixo) */}
      <div className="flex-none">
        <GameHeader />
        <WeatherBar />
      </div>

      {/* Bloco do Meio (dinâmico) */}
      <div className="flex-grow overflow-auto relative">
        <GameGrid viewType={currentView} activeQuadrant={activeQuadrant} onQuadrantClick={handleQuadrantClick} />
      </div>

      {/* Bloco Inferior (três colunas) */}
      <div className="flex-none grid grid-cols-3 h-64 bg-amber-100 border-t border-amber-200">
        {/* Inventário e Categorias */}
        <InventoryPanel activeTab={activeInventoryTab} onTabChange={setActiveInventoryTab} />

        {/* Chat e Ações */}
        <ChatPanel mode={chatMode} onModeChange={setChatMode} />

        {/* Personagem e Navegação */}
        <CharacterPanel currentView={currentView} onViewChange={handleViewChange} />
      </div>
    </div>
  )
}
