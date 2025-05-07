"use client"

import { useState } from "react"
import {
  Home,
  ArrowLeft,
  Beer,
  Utensils,
  Building,
  Music,
  ShoppingCart,
  Flower,
  Carrot,
  Banana,
  Wheat,
} from "lucide-react"
import type { ViewType } from "@/lib/types"
import Character from "./character"

interface GameGridProps {
  viewType: ViewType
  activeQuadrant: string
  onQuadrantClick: (quadrant: string) => void
}

// Função auxiliar para obter uma planta aleatória para o quadrante C2
const getPlantForC2 = (index: number) => {
  // Plantas específicas para o quadrante C2
  const plants = [
    { name: "Abóbora", icon: <Flower className="h-5 w-5 text-orange-500" />, color: "bg-orange-100" },
    { name: "Cenoura", icon: <Carrot className="h-5 w-5 text-orange-600" />, color: "bg-orange-50" },
    { name: "Milho", icon: <Wheat className="h-5 w-5 text-yellow-600" />, color: "bg-yellow-100" },
    { name: "Tomate", icon: <Flower className="h-5 w-5 text-red-500" />, color: "bg-red-100" },
    { name: "Alface", icon: <Flower className="h-5 w-5 text-green-500" />, color: "bg-green-100" },
    { name: "Batata", icon: <Flower className="h-5 w-5 text-amber-700" />, color: "bg-amber-100" },
    { name: "Banana", icon: <Banana className="h-5 w-5 text-yellow-500" />, color: "bg-yellow-50" },
  ]

  // Para o slot central (index 7), retornamos null para mostrar o personagem
  if (index === 7) return null

  // Distribuição específica de plantas para o quadrante C2
  const plantIndex = (index * 3) % plants.length
  return plants[plantIndex]
}

export default function GameGrid({ viewType, activeQuadrant, onQuadrantClick }: GameGridProps) {
  const [selectedVillageSpot, setSelectedVillageSpot] = useState<string | null>(null)

  const handleVillageClick = () => {
    // Simulate changing to village view by updating URL or state
    window.history.pushState({}, "", "?view=village")
    // In a real implementation, you would use router or state management
    // to change the view type to "village"
    document.dispatchEvent(new CustomEvent("viewChange", { detail: { view: "village" } }))
  }

  if (viewType === "village") {
    return (
      <div className="h-full p-4">
        <div className="bg-amber-100 h-full rounded-lg p-4 relative">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-amber-900">Vila</h2>
            <button
              className="bg-amber-600 text-white px-3 py-1 rounded-md text-sm hover:bg-amber-700 transition-colors flex items-center gap-1"
              onClick={() => {
                window.history.pushState({}, "", "?view=macro")
                document.dispatchEvent(new CustomEvent("viewChange", { detail: { view: "macro" } }))
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Mapa
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
            {/* Estabelecimentos da Vila */}
            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center">
              <Home className="h-8 w-8 mb-2 text-amber-700" />
              <div className="font-medium">Casa do Tadeu Woodstock</div>
              <div className="text-xs text-amber-700 mt-1">Artesão local</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center">
              <Beer className="h-8 w-8 mb-2 text-amber-700" />
              <div className="font-medium">Bar do Pelé</div>
              <div className="text-xs text-amber-700 mt-1">Bebidas e conversas</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center">
              <Home className="h-8 w-8 mb-2 text-amber-700" />
              <div className="font-medium">Casa do Moacir</div>
              <div className="text-xs text-amber-700 mt-1">Contador de histórias</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center">
              <Utensils className="h-8 w-8 mb-2 text-amber-700" />
              <div className="font-medium">Restaurante da Nenzinha</div>
              <div className="text-xs text-amber-700 mt-1">Comida caseira</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center">
              <ShoppingCart className="h-8 w-8 mb-2 text-amber-700" />
              <div className="font-medium">Mercearia</div>
              <div className="text-xs text-amber-700 mt-1">Produtos diversos</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center">
              <Music className="h-8 w-8 mb-2 text-amber-700" />
              <div className="font-medium">Forró do Vegas</div>
              <div className="text-xs text-amber-700 mt-1">Música e dança</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center">
              <Building className="h-8 w-8 mb-2 text-amber-700" />
              <div className="font-medium">Prefeitura</div>
              <div className="text-xs text-amber-700 mt-1">Administração</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center opacity-70">
              <div className="font-medium">Espaço Disponível</div>
              <div className="text-xs text-amber-700 mt-1">Em construção</div>
            </div>
          </div>

          {/* Personagem no centro da vila */}
          <div className="absolute bottom-8 right-8">
            <Character size="medium" />
          </div>
        </div>
      </div>
    )
  }

  if (viewType === "macro") {
    return (
      <div className="h-full p-4">
        <div className="bg-green-200 h-full rounded-lg p-4 grid grid-cols-4 gap-3">
          {/* 15 lotes de jogadores */}
          {Array.from({ length: 15 }).map((_, index) => (
            <div
              key={`lot-${index + 1}`}
              className="bg-green-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors"
            >
              <div className="text-center">
                <div className="text-lg font-medium">Lote {index + 1}</div>
                <div className="text-sm text-green-800">Jogador {String(index + 1).padStart(2, "0")}</div>
              </div>
            </div>
          ))}

          {/* Vila (área comum) */}
          <div
            className="bg-amber-300 rounded-lg p-3 flex items-center justify-center cursor-pointer hover:bg-amber-400 transition-colors"
            onClick={handleVillageClick}
          >
            <div className="text-center">
              <div className="text-lg font-medium">Vila</div>
              <div className="text-sm text-amber-800">Área comum</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (viewType === "medium") {
    return (
      <div className="h-full p-4">
        <div className="bg-green-600 h-full rounded-lg p-2">
          <div className="grid grid-cols-5 grid-rows-3 gap-2 h-full">
            {Array.from({ length: 15 }).map((_, index) => {
              const col = index % 5
              const row = Math.floor(index / 5)
              const letters = ["A", "B", "C", "D", "E"]
              const quadrant = `${letters[col]}${row + 1}`
              const isActive = quadrant === activeQuadrant
              const isCenter = col === 2 && row === 1

              return (
                <div
                  key={index}
                  className={`bg-green-500 rounded-md flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors relative ${isActive ? "ring-2 ring-red-500" : ""}`}
                  onClick={() => onQuadrantClick(quadrant)}
                >
                  {isCenter && <Character size="small" />}
                  <span className="absolute top-1 left-1 text-xs text-green-900 opacity-70">{quadrant}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Micro view
  return (
    <div className="h-full p-4">
      <div className="bg-green-600 h-full rounded-lg p-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-white font-medium">Quadrante {activeQuadrant}</h2>
          <button
            className="bg-green-700 text-white px-2 py-1 rounded text-sm hover:bg-green-800 transition-colors"
            onClick={() => onQuadrantClick("")}
          >
            Voltar
          </button>
        </div>
        <div className="grid grid-cols-5 grid-rows-3 gap-2 h-[calc(100%-2rem)]">
          {Array.from({ length: 15 }).map((_, index) => {
            // Verificar se estamos no quadrante C2 para mostrar plantas
            const isC2 = activeQuadrant === "C2"
            const plant = isC2 ? getPlantForC2(index) : null

            return (
              <div
                key={index}
                className={`${plant ? plant.color : "bg-green-500"} rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-green-400 transition-colors relative`}
              >
                {index === 7 && <Character size="micro" />}

                {plant && (
                  <>
                    <div className="mb-1">{plant.icon}</div>
                    <span className="text-xs text-center">{plant.name}</span>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
