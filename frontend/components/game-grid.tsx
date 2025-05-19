"use client"

import { useState } from "react"
import {
  Home,
  ArrowLeft,
  Flower,
  Carrot,
  Banana,
  Wheat,
  Sprout,
  Leaf,
  Droplet,
  Scissors,
  Shovel,
  X,
  Sparkles,
  AlertTriangle,
  Heart,
  Store,
  Book,
  Users,
  MapPin,
  User,
  Sun as SunIcon,
} from "lucide-react"
import type { ViewType } from "@/lib/types"
import UserCharacter from "./user-character"
import { cn } from "@/lib/utils"

interface GameGridProps {
  viewType: ViewType
  activeQuadrant: string
  onQuadrantClick: (quadrant: string) => void
}

// Component of the progress bar
function ProgressBar({ progress, nextStage }: { progress: number; nextStage: string }) {
  // Determine progress bar color based on value
  const getProgressColor = (value: number) => {
    if (value < 30) return "bg-red-500"
    if (value < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <div className="w-full mt-1.5">
      <div className="flex justify-between items-center text-[8px] text-gray-600 mb-1">
        <span>{progress}%</span>
        <span>{nextStage}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden shadow-inner">
        <div
          className={`${getProgressColor(progress)} h-full rounded-full transition-all duration-500`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}

// Health indicator component
function HealthIndicator({
  health,
  percentage,
  issues,
}: { health: string; percentage: number; issues: string[] }) {
  // Visual settings for each health level
  const healthConfig: any = {
    excellent: {
      color: "bg-green-500",
      icon: <Heart className="h-3 w-3 text-white fill-white" />,
      label: "Excelente",
    },
    good: {
      color: "bg-green-400",
      icon: <Heart className="h-3 w-3 text-white" />,
      label: "Boa",
    },
    average: {
      color: "bg-yellow-500",
      icon: <Heart className="h-3 w-3 text-white" />,
      label: "Média",
    },
    poor: {
      color: "bg-orange-500",
      icon: <AlertTriangle className="h-3 w-3 text-white" />,
      label: "Fraca",
    },
    critical: {
      color: "bg-red-500",
      icon: <AlertTriangle className="h-3 w-3 text-white" />,
      label: "Crítica",
    },
  }

  const config = healthConfig[health]

  if (!config) return null

  return (
    <div className="w-full mt-2">
      <div className="flex justify-between items-center text-[8px] text-gray-600 mb-1">
        <div className="flex items-center gap-1">
          <span className={`${config.color} rounded-full p-0.5 flex items-center justify-center`}>{config.icon}</span>
          <span>{config.label}</span>
        </div>
        <span>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden shadow-inner">
        <div
          className={`${config.color} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {issues.length > 0 && (
        <div className="mt-1 text-[8px] text-red-600 italic">
          {issues[0]}
          {issues.length > 1 && ` +${issues.length - 1}`}
        </div>
      )}
    </div>
  )
}

export default function GameGrid({ viewType, activeQuadrant, onQuadrantClick }: GameGridProps) {
  // This is a simplified version for styling purposes.
  // The full implementation would be connected to the API through game-grid-with-api.tsx
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [hoveredQuadrant, setHoveredQuadrant] = useState<string | null>(null)
  const [hoveredCell, setHoveredCell] = useState<number | null>(null)

  // Early return for village view
  if (viewType === "village") {
    return (
      <div className="h-full p-5">
        <div className="bg-gradient-to-br from-paper-50 to-paper-200 h-full rounded-lg p-5 relative shadow-md overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-amber-100/30 to-transparent"></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-green-100/30 blur-xl"></div>
          
          {/* Village header */}
          <div className="flex justify-between items-center mb-5 relative z-10">
            <div className="flex items-center gap-2">
              <div className="bg-olive-100 p-1.5 rounded-md shadow-sm">
                <Home className="h-5 w-5 text-olive-700" />
              </div>
              <h2 className="text-xl font-medium text-olive-900 flex items-center">
                Vila
                <span className="ml-2 bg-olive-100 px-2 py-0.5 rounded-full text-xs text-olive-700 shadow-sm">Nível 1</span>
              </h2>
            </div>
            <button
              className="bg-olive-600 text-white px-4 py-2 rounded-md text-sm hover:bg-olive-700 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
              onClick={() => onQuadrantClick("")}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Mapa
            </button>
          </div>
          
          {/* Village buildings */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { name: 'Mercado', status: 'Construído', icon: <Store className="h-5 w-5" /> },
              { name: 'Escola', status: 'Em construção', icon: <Book className="h-5 w-5" /> },
              { name: 'Centro Comunitário', status: 'Bloqueado', icon: <Users className="h-5 w-5" /> }
            ].map((building, index) => (
              <div 
                key={index} 
                className={`bg-gradient-to-b ${building.status === 'Bloqueado' ? 'from-gray-200 to-gray-300 opacity-70' : 'from-amber-50 to-amber-100'} p-3 rounded-lg shadow-sm transition-transform duration-300 hover:shadow-md ${building.status !== 'Bloqueado' ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed'}`}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-md ${building.status === 'Bloqueado' ? 'bg-gray-300' : 'bg-amber-200'}`}>
                    {building.icon}
                  </div>
                  <div className="font-medium">{building.name}</div>
                </div>
                <div className={`text-xs ${building.status === 'Bloqueado' ? 'text-gray-500' : building.status === 'Em construção' ? 'text-amber-600' : 'text-green-600'}`}>
                  {building.status}
                </div>
                {building.status === 'Em construção' && (
                  <div className="w-full bg-amber-200 h-1.5 mt-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full w-[45%] animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-10 right-10 transition-transform duration-500 hover:scale-110 cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
            <UserCharacter size="medium" showTool={true} />
            
            {/* Character info popup */}
            {showInfo && (
              <div className="absolute right-0 bottom-full mb-2 bg-white p-3 rounded-lg shadow-lg w-48 text-sm border border-olive-200 animate-in slide-in-from-bottom-2">
                <div className="font-medium text-olive-900 mb-1">José da Serra</div>
                <div className="text-xs text-olive-700 mb-2">Agricultor Nível 3</div>
                <div className="flex items-center gap-1 text-xs text-olive-600 mb-1">
                  <Heart className="h-3 w-3 text-red-500" /> Energia: 85/100
                </div>
                <div className="flex items-center gap-1 text-xs text-olive-600">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Experiência: 1240 XP
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Early return for macro view
  if (viewType === "macro") {
    // Function to determine the status/type of each lot
    const getLotType = (index: number) => {
      // In a real implementation, this would come from an API
      // For now, we'll show different states for demonstration
      if (index % 7 === 0) return "user" // Current user's lot
      if (index % 5 === 0) return "available" // Available lot
      if (index % 3 === 0) return "inactive" // Unclaimed/inactive lot
      return "active" // Other player's active lot
    }
    
    // Get visual styling based on lot type
    const getLotStyles = (type: string) => {
      switch (type) {
        case "user":
          return "bg-green-400 bg-opacity-30 border-green-500 border-2 shadow-md"
        case "available":
          return "bg-amber-100 bg-opacity-20 border-amber-300 border-dashed border"
        case "inactive":
          return "bg-gray-300 bg-opacity-10 border-gray-400 border-dotted border"
        default: // active
          return "bg-green-300 bg-opacity-20 border-green-400 border"
      }
    }
    
    return (
      <div className="h-full w-full p-0">
        <div className="bg-gradient-to-br from-green-200 to-green-300 h-full w-full rounded-lg relative overflow-hidden shadow-md">
          {/* Environment decorations */}
          <div className="absolute top-0 left-0 h-24 w-full bg-gradient-to-b from-sky-100/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-green-400/20 to-transparent"></div>
          
          {/* Mountain silhouettes in the distance */}
          <div className="absolute top-[5%] left-0 w-full h-[15%] z-0">
            <div className="absolute left-[10%] w-[30%] h-full bg-green-700/20 rounded-t-[100%]"></div>
            <div className="absolute left-[35%] w-[40%] h-full bg-green-700/15 rounded-t-[120%]"></div>
            <div className="absolute left-[60%] w-[25%] h-full bg-green-700/10 rounded-t-[90%]"></div>
          </div>
          
          {/* Container for fence and grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Background image with fences */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/cerca.png"
                alt="Cercas entre lotes"
                className="w-full opacity-80"
                style={{
                  height: "200%",
                  width: "100%",
                  objectFit: "fill",
                  transform: "scale(1)",
                  transformOrigin: "center center",
                  position: "absolute",
                  top: "calc(-50% + 50px)",
                  filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.1))"
                }}
              />
            </div>

            {/* Weather effects - animated clouds */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div className="absolute top-[10%] left-[-10%] w-[15%] h-[8%] bg-white opacity-40 rounded-full blur-md animate-float-slow"></div>
              <div className="absolute top-[5%] left-[20%] w-[20%] h-[6%] bg-white opacity-30 rounded-full blur-md animate-float-medium"></div>
              <div className="absolute top-[15%] left-[60%] w-[25%] h-[10%] bg-white opacity-50 rounded-full blur-md animate-float-slow"></div>
            </div>

            {/* Lots grid */}
            <div className="grid grid-cols-5 grid-rows-3 gap-1 relative z-10 w-full h-full p-3">
              {Array.from({ length: 15 }).map((_, index) => {
                const lotType = getLotType(index)
                const lotStatus = lotType === "user" ? "Seu lote" : 
                                  lotType === "available" ? "Disponível" : 
                                  lotType === "inactive" ? "Não reclamado" : 
                                  "Ativo"
                
                return (
                  <div
                    key={`lot-${index + 1}`}
                    className={`flex flex-col items-center justify-center rounded-md transition-all duration-300 cursor-pointer overflow-hidden relative ${getLotStyles(lotType)} ${lotType !== 'inactive' ? 'hover:scale-[1.02] hover:shadow-lg' : ''}`}
                    onClick={() => lotType !== 'inactive' && onQuadrantClick(`L${index + 1}`)}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Visual indicator for lot type */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${lotType === "user" ? "bg-green-500" : lotType === "available" ? "bg-amber-400" : lotType === "inactive" ? "bg-gray-400" : "bg-green-400"}`}></div>
                    
                    <div className="text-center p-3 w-full z-10">
                      <div className="text-base sm:text-lg font-medium text-green-800 flex items-center justify-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-full ${lotType === "user" ? "bg-green-500" : lotType === "available" ? "bg-amber-400" : lotType === "inactive" ? "bg-gray-400" : "bg-green-400"}`}></div>
                        Lote {index + 1}
                      </div>
                      <div className="text-xs sm:text-sm text-green-700 mt-1">
                        {lotType === "user" ? "Seu lote" : 
                         lotType === "available" ? "Disponível" : 
                         lotType === "inactive" ? "-" : 
                         `Jogador ${String(index + 1).padStart(2, "0")}`}
                      </div>
                    </div>
                    
                    {/* Hover information overlay */}
                    {hoveredItem === index && lotType !== "inactive" && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-3 animate-in fade-in duration-200 z-20">
                        <div className="text-white text-xs">{lotStatus}</div>
                        {lotType === "user" && (
                          <div className="mt-1 bg-green-100 rounded-sm px-1.5 py-0.5 text-green-800 text-xs inline-flex">
                            <Sparkles className="h-3 w-3 mr-1" /> Plante agora!
                          </div>
                        )}
                        {lotType === "available" && (
                          <div className="mt-1 bg-amber-100 rounded-sm px-1.5 py-0.5 text-amber-800 text-xs inline-flex">
                            <Sparkles className="h-3 w-3 mr-1" /> Adquira agora!
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Miniature plants or decorations based on lot type */}
                    {lotType === "user" && (
                      <div className="absolute bottom-2 right-2 animate-gentle-bounce">
                        <Sprout className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    {lotType === "active" && Math.random() > 0.5 && (
                      <div className="absolute bottom-2 right-2">
                        {Math.random() > 0.5 ? 
                          <Carrot className="h-4 w-4 text-orange-500 opacity-70" /> : 
                          <Wheat className="h-4 w-4 text-amber-500 opacity-70" />}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Medium view
  if (viewType === "medium") {
    // Function to determine quadrant data
    const getQuadrantData = (quadrant: string) => {
      // This would come from API in a real implementation
      const isUserPresent = quadrant === "C2" // User is in center quadrant
      const hasCrops = ["A1", "B2", "D2", "E3"].includes(quadrant)
      const hasWater = ["B1", "C3", "E1"].includes(quadrant)
      const terrain = hasWater ? "wetland" : ["A3", "D3", "E2"].includes(quadrant) ? "rocky" : "fertile"
      
      return {
        isUserPresent,
        hasCrops,
        hasWater,
        terrain,
        label: quadrant,
      }
    }
    
    // Function to get terrain styling
    const getTerrainStyles = (terrain: string) => {
      switch (terrain) {
        case "wetland":
          return "from-blue-400/20 to-green-500/80 border-blue-400"
        case "rocky":
          return "from-gray-300/30 to-green-500/70 border-gray-400"
        default: // fertile
          return "from-green-300/30 to-green-500/90 border-green-400"
      }
    }
    
    return (
      <div className="h-full p-5">
        <div className="bg-gradient-to-br from-green-500 to-green-600 h-full rounded-lg p-4 shadow-md">
          {/* Sun effect in the corner */}
          <div className="absolute top-8 right-8 w-24 h-24 bg-yellow-200 rounded-full blur-xl opacity-40"></div>
          
          <div className="relative z-10 mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-green-700 p-1.5 rounded-md shadow-sm">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-white font-medium text-lg">Seu Lote</h2>
            </div>
            
            <div className="flex items-center gap-2 text-xs bg-green-700/50 px-3 py-1.5 rounded-md text-white">
              <SunIcon className="h-4 w-4 text-yellow-300" />
              <span>Dia 12</span>
              <span className="mx-1 opacity-50">|</span>
              <span>Estação: Verão</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 grid-rows-3 gap-3 h-[calc(100%-2.5rem)]">
            {Array.from({ length: 15 }).map((_, index) => {
              const col = index % 5
              const row = Math.floor(index / 5)
              const letters = ["A", "B", "C", "D", "E"]
              const quadrant = `${letters[col]}${row + 1}`
              const isActive = quadrant === activeQuadrant
              const isCenter = col === 2 && row === 1
              const quadrantData = getQuadrantData(quadrant)

              return (
                <div
                  key={index}
                  className={`bg-gradient-to-b ${getTerrainStyles(quadrantData.terrain)} rounded-md flex items-center justify-center cursor-pointer transition-all duration-300 relative p-2 shadow-sm border overflow-hidden ${isActive ? "ring-2 ring-yellow-400 scale-105" : "hover:scale-105 hover:shadow-md"}`}
                  onClick={() => onQuadrantClick(quadrant)}
                  onMouseEnter={() => setHoveredQuadrant(quadrant)}
                  onMouseLeave={() => setHoveredQuadrant(null)}
                >
                  {/* Terrain decoration */}
                  {quadrantData.hasWater && (
                    <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-blue-400/30 z-0 rounded-b-md">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200/40 animate-pulse"></div>
                    </div>
                  )}
                  {quadrantData.terrain === "rocky" && (
                    <div className="absolute top-1 right-1 rounded-full bg-gray-300/70 h-2 w-2"></div>
                  )}
                  
                  {/* Crops indicator */}
                  {quadrantData.hasCrops && (
                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-2">
                        {Array.from({ length: 9 }).map((_, i) => 
                          Math.random() > 0.4 ? (
                            <div key={i} className="flex items-center justify-center">
                              <div className="w-1 h-3 bg-green-700 rounded-full relative animate-gentle-bounce" style={{
                                animationDelay: `${i * 0.1}s`,
                                transform: `rotate(${Math.random() * 10 - 5}deg)` 
                              }}>
                                <div className="absolute -top-1 -left-1 w-3 h-2 bg-green-600 rounded-full"></div>
                              </div>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}
                  {/* User character indicator - Removed to prevent duplication with character panel */}
                  {quadrantData.isUserPresent && (
                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white"></div>
                  )}
                  
                  {/* Quadrant label */}
                  <span className="absolute top-1.5 left-1.5 text-xs bg-white/30 px-1 rounded text-green-900 font-medium">
                    {quadrant}
                  </span>
                  
                  {/* Hover tooltip */}
                  {hoveredQuadrant === quadrant && (
                    <div className="absolute bottom-full left-0 mb-1 bg-white p-2 rounded shadow-lg text-xs w-32 z-20 animate-in fade-in slide-in-from-bottom-2 duration-100">
                      <div className="font-medium mb-1 text-green-800">Quadrante {quadrant}</div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-gray-700">
                          <div className={`h-2 w-2 rounded-full ${quadrantData.terrain === "fertile" ? "bg-green-500" : quadrantData.terrain === "wetland" ? "bg-blue-500" : "bg-gray-500"}`}></div>
                          Terreno: {quadrantData.terrain === "fertile" ? "Fértil" : quadrantData.terrain === "wetland" ? "Pantanoso" : "Pedregoso"}
                        </div>
                        {quadrantData.hasCrops && (
                          <div className="flex items-center gap-1 text-green-700">
                            <Sprout className="h-3 w-3" />
                            Plantado
                          </div>
                        )}
                        {quadrantData.isUserPresent && (
                          <div className="flex items-center gap-1 text-olive-700">
                            <User className="h-3 w-3" />
                            Você está aqui
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Default: Micro view
  // All hooks must be called at the top level, so we've moved them up
  
  // Function to determine soil quality of each cell
  const getCellData = (index: number) => {
    // This would come from API in a real implementation
    const hasCrop = [2, 5, 8, 11].includes(index)
    const isWatered = [2, 5, 11].includes(index)
    const soilQuality = [0, 3, 6].includes(index) ? "poor" : 
                        [1, 4, 7, 10, 13].includes(index) ? "average" : "good"
    const cropType = index % 3 === 0 ? "carrot" : index % 2 === 0 ? "wheat" : "tomato"
    const growthPercentage = Math.floor(Math.random() * 100)
    
    return {
      hasCrop,
      isWatered,
      soilQuality,
      cropType,
      growthPercentage,
      isUserHere: index === 7 // Center position
    }
  }
  
  // Function to get cell styling based on soil quality
  const getSoilStyle = (quality: string, isWatered: boolean) => {
    const waterModifier = isWatered ? "opacity-90" : "opacity-100"
    
    switch(quality) {
      case "poor":
        return `bg-gradient-to-b from-amber-200/40 to-amber-100/80 ${waterModifier}`
      case "average":
        return `bg-gradient-to-b from-amber-100/30 to-green-100/70 ${waterModifier}`
      case "good":
        return `bg-gradient-to-b from-green-200/30 to-green-100/70 ${waterModifier}`
      default:
        return `bg-gradient-to-b from-green-100/20 to-green-50/60 ${waterModifier}`
    }
  }
  
  // Function to render crop icon based on type
  const getCropIcon = (type: string) => {
    switch(type) {
      case "carrot": return <Carrot className="h-4 w-4 text-orange-500" />
      case "wheat": return <Wheat className="h-4 w-4 text-amber-500" />
      case "tomato": return <div className="h-4 w-4 text-red-500 flex items-center justify-center">🍅</div>
      default: return <Sprout className="h-4 w-4 text-green-500" />
    }
  }
  
  return (
    <div className="h-full p-5">
      <div className="bg-gradient-to-br from-green-500 to-green-600 h-full rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <button
              className="bg-green-700 text-white p-1.5 rounded-md hover:bg-green-800 transition-colors shadow-sm flex items-center justify-center"
              onClick={() => onQuadrantClick("")}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h2 className="text-white font-medium text-lg flex items-center gap-2">
              Quadrante {activeQuadrant}
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">8x8m</span>
            </h2>
          </div>
          
          <div className="flex gap-2">
            <button className="bg-green-700 text-white p-1.5 rounded-md hover:bg-green-800 transition-colors shadow-sm text-xs flex items-center gap-1">
              <Shovel className="h-3.5 w-3.5" />
              <span>Preparar</span>
            </button>
            <button className="bg-green-700 text-white p-1.5 rounded-md hover:bg-green-800 transition-colors shadow-sm text-xs flex items-center gap-1">
              <Droplet className="h-3.5 w-3.5" />
              <span>Irrigar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 grid-rows-3 gap-3 h-[calc(100%-3rem)]">
          {Array.from({ length: 15 }).map((_, index) => {
            const cellData = getCellData(index)
            
            return (
              <div
                key={index}
                className={`${getSoilStyle(cellData.soilQuality, cellData.isWatered)} rounded-md flex items-center justify-center cursor-pointer hover:shadow-md transition-all duration-300 relative p-2 border border-green-700/20 ${hoveredCell === index ? 'scale-105' : ''} `}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(null)}
              >
                {/* Water indicator */}
                {cellData.isWatered && (
                  <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
                    <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-blue-400/20 rounded-b-md">
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-blue-200/50 animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                {/* Soil quality indicator */}
                <div className="absolute top-1 right-1 flex gap-0.5">
                  {[...Array(cellData.soilQuality === "good" ? 3 : cellData.soilQuality === "average" ? 2 : 1)].map((_, i) => (
                    <div key={i} className="h-1.5 w-1.5 bg-green-700/70 rounded-full"></div>
                  ))}
                </div>
                
                {/* Growing crop */}
                {cellData.hasCrop && (
                  <div className="relative z-10 animate-gentle-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex flex-col items-center">
                      {getCropIcon(cellData.cropType)}
                      
                      {/* Growth progress */}
                      <div className="mt-1 h-0.5 w-6 bg-gray-200 rounded overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded" 
                          style={{ width: `${cellData.growthPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* User character */}
                {cellData.isUserHere && (
                  <div className="z-10">
                    <UserCharacter size="micro" showTool={true} />
                  </div>
                )}
                
                {/* Hover tooltip with cell information */}
                {hoveredCell === index && (
                  <div className="absolute bottom-full left-0 mb-1 bg-white p-2 rounded shadow-lg text-xs w-40 z-20 animate-in fade-in slide-in-from-bottom-2 duration-100">
                    <div className="font-medium text-green-800 mb-1 flex items-center justify-between">
                      <span>Célula {index + 1}</span>
                      <span className="text-[10px] text-gray-500">1x1m</span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-gray-700">
                        <span>Solo:</span>
                        <span className={cellData.soilQuality === "good" ? "text-green-600" : cellData.soilQuality === "average" ? "text-amber-600" : "text-red-600"}>
                          {cellData.soilQuality === "good" ? "Bom" : cellData.soilQuality === "average" ? "Médio" : "Pobre"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-gray-700">
                        <span>Irrigado:</span>
                        <span>{cellData.isWatered ? "Sim" : "Não"}</span>
                      </div>
                      
                      {cellData.hasCrop && (
                        <>
                          <div className="flex items-center justify-between text-gray-700">
                            <span>Plantado:</span>
                            <span className="capitalize">{cellData.cropType}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-gray-700">
                            <span>Crescimento:</span>
                            <span>{cellData.growthPercentage}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}  
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
