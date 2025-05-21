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
  Sprout,
  Leaf,
  Droplet,
  Scissors,
  Shovel,
  X,
  Sparkles,
  AlertTriangle,
  Heart,
} from "lucide-react"
import type { ViewType } from "@/lib/types"
import type { JSX } from "react/jsx-runtime"
import UserCharacter from "./user-character"

interface GameGridProps {
  viewType: ViewType
  activeQuadrant: string
  onQuadrantClick: (quadrant: string) => void
}

// Tipos para os estágios de crescimento das plantas
type GrowthStage = "seedling" | "growing" | "flowering" | "mature" | "harvest"

// Tipos para os níveis de saúde das plantas
type HealthLevel = "excellent" | "good" | "average" | "poor" | "critical"

// Interface para as plantas
interface Plant {
  name: string
  stage: GrowthStage
  icon: JSX.Element
  color: string
  stageText: string
  progress: number // Progresso para o próximo estágio (0-100)
  nextStage: string // Nome do próximo estágio
  needsWater: boolean // Indica se a planta precisa de água
  needsFertilizer: boolean // Indica se a planta precisa de fertilizante
  health: HealthLevel // Nível de saúde da planta
  healthPercentage: number // Percentual de saúde (0-100)
  issues: string[] // Problemas que afetam a saúde da planta
}

// Componente da barra de progresso
function ProgressBar({ progress, nextStage }: { progress: number; nextStage: string }) {
  // Determinar a cor da barra de progresso com base no valor
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

// Componente do indicador de saúde
function HealthIndicator({
  health,
  percentage,
  issues,
}: { health: HealthLevel; percentage: number; issues: string[] }) {
  // Configurações visuais para cada nível de saúde
  const healthConfig = {
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

// Componente do menu de ações da planta
function PlantActionMenu({
  plant,
  onClose,
  onAction,
}: {
  plant: Plant
  onClose: () => void
  onAction: (action: string) => void
}) {
  // Definir ações disponíveis com base no estágio da planta
  const getAvailableActions = () => {
    const actions = []

    // Ações básicas disponíveis para todos os estágios
    if (plant.needsWater) {
      actions.push({
        id: "water",
        label: "Regar",
        icon: <Droplet className="h-4 w-4" />,
        color: "bg-blue-500 hover:bg-blue-600",
      })
    }

    if (plant.needsFertilizer) {
      actions.push({
        id: "fertilize",
        label: "Adubar",
        icon: <Sparkles className="h-4 w-4" />,
        color: "bg-amber-500 hover:bg-amber-600",
      })
    }

    // Ações específicas por estágio
    switch (plant.stage) {
      case "seedling":
      case "growing":
        actions.push({
          id: "inspect",
          label: "Examinar",
          icon: <Flower className="h-4 w-4" />,
          color: "bg-purple-500 hover:bg-purple-600",
        })
        break
      case "flowering":
        actions.push({
          id: "prune",
          label: "Podar",
          icon: <Scissors className="h-4 w-4" />,
          color: "bg-green-600 hover:bg-green-700",
        })
        break
      case "mature":
        actions.push({
          id: "support",
          label: "Escorar",
          icon: <Shovel className="h-4 w-4" />,
          color: "bg-stone-500 hover:bg-stone-600",
        })
        break
      case "harvest":
        actions.push({
          id: "harvest",
          label: "Colher",
          icon: <Scissors className="h-4 w-4" />,
          color: "bg-red-500 hover:bg-red-600",
        })
        break
    }

    // Ações específicas para problemas de saúde
    if (plant.health === "poor" || plant.health === "critical") {
      actions.push({
        id: "treat",
        label: "Tratar",
        icon: <Heart className="h-4 w-4" />,
        color: "bg-pink-500 hover:bg-pink-600",
      })
    }

    return actions
  }

  const actions = getAvailableActions()

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center rounded-md">
      <div className="bg-white p-3 rounded-md shadow-lg w-[90%]">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold">{plant.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              className={`${action.color} text-white text-xs py-1.5 px-2.5 rounded flex items-center justify-center gap-1.5 transition-colors`}
              onClick={() => onAction(action.id)}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Função auxiliar para obter uma planta aleatória para o quadrante C2
const getPlantForC2 = (index: number): Plant | null => {
  // Para o slot central (index 7), retornamos null para mostrar o personagem
  if (index === 7) return null

  // Definição dos estágios de crescimento
  const growthStages: Record<GrowthStage, { suffix: string; opacity: string; nextStage: string }> = {
    seedling: { suffix: "(Muda)", opacity: "opacity-60", nextStage: "Crescimento" },
    growing: { suffix: "(Crescimento)", opacity: "opacity-80", nextStage: "Floração" },
    flowering: { suffix: "(Floração)", opacity: "opacity-90", nextStage: "Maduro" },
    mature: { suffix: "(Maduro)", opacity: "opacity-100", nextStage: "Colheita" },
    harvest: { suffix: "(Colheita)", opacity: "opacity-100", nextStage: "Colheita Pronta" },
  }

  // Plantas específicas para o quadrante C2 com seus estágios
  const plantTypes = [
    {
      name: "Abóbora",
      baseColor: "bg-orange-100",
      icons: {
        seedling: <Sprout className="h-5 w-5 text-green-500" />,
        growing: <Leaf className="h-5 w-5 text-green-600" />,
        flowering: <Flower className="h-5 w-5 text-yellow-400" />,
        mature: <Flower className="h-5 w-5 text-orange-500" />,
        harvest: <Flower className="h-6 w-6 text-orange-600" />,
      },
    },
    {
      name: "Cenoura",
      baseColor: "bg-orange-50",
      icons: {
        seedling: <Sprout className="h-5 w-5 text-green-500" />,
        growing: <Leaf className="h-5 w-5 text-green-600" />,
        flowering: <Leaf className="h-5 w-5 text-green-700" />,
        mature: <Carrot className="h-5 w-5 text-orange-400" />,
        harvest: <Carrot className="h-6 w-6 text-orange-600" />,
      },
    },
    {
      name: "Milho",
      baseColor: "bg-yellow-100",
      icons: {
        seedling: <Sprout className="h-5 w-5 text-green-500" />,
        growing: <Leaf className="h-5 w-5 text-green-600" />,
        flowering: <Wheat className="h-5 w-5 text-green-700" />,
        mature: <Wheat className="h-5 w-5 text-yellow-500" />,
        harvest: <Wheat className="h-6 w-6 text-yellow-600" />,
      },
    },
    {
      name: "Tomate",
      baseColor: "bg-red-100",
      icons: {
        seedling: <Sprout className="h-5 w-5 text-green-500" />,
        growing: <Leaf className="h-5 w-5 text-green-600" />,
        flowering: <Flower className="h-5 w-5 text-white" />,
        mature: <Flower className="h-5 w-5 text-red-400" />,
        harvest: <Flower className="h-6 w-6 text-red-600" />,
      },
    },
    {
      name: "Alface",
      baseColor: "bg-green-100",
      icons: {
        seedling: <Sprout className="h-5 w-5 text-green-400" />,
        growing: <Leaf className="h-5 w-5 text-green-500" />,
        flowering: <Leaf className="h-5 w-5 text-green-600" />,
        mature: <Leaf className="h-5 w-5 text-green-700" />,
        harvest: <Leaf className="h-6 w-6 text-green-800" />,
      },
    },
    {
      name: "Batata",
      baseColor: "bg-amber-100",
      icons: {
        seedling: <Sprout className="h-5 w-5 text-green-500" />,
        growing: <Leaf className="h-5 w-5 text-green-600" />,
        flowering: <Flower className="h-5 w-5 text-white" />,
        mature: <Leaf className="h-5 w-5 text-green-700" />,
        harvest: <Leaf className="h-6 w-6 text-green-800" />,
      },
    },
    {
      name: "Banana",
      baseColor: "bg-yellow-50",
      icons: {
        seedling: <Sprout className="h-5 w-5 text-green-500" />,
        growing: <Leaf className="h-5 w-5 text-green-600" />,
        flowering: <Leaf className="h-5 w-5 text-green-700" />,
        mature: <Banana className="h-5 w-5 text-yellow-400" />,
        harvest: <Banana className="h-6 w-6 text-yellow-500" />,
      },
    },
  ]

  // Distribuição específica de plantas para o quadrante C2
  const plantIndex = (index * 3) % plantTypes.length
  const plantType = plantTypes[plantIndex]

  // Determinar o estágio de crescimento com base na posição
  // Isso cria uma distribuição variada de estágios no quadrante
  const stageKeys = Object.keys(growthStages) as GrowthStage[]
  const stageIndex = (index + plantIndex) % stageKeys.length
  const stage = stageKeys[stageIndex]
  const stageInfo = growthStages[stage]

  // Gerar um valor de progresso baseado na posição do slot
  // Isso cria uma variação realista de progresso entre as plantas
  const baseProgress = ((index * 17) % 100) + 1

  // Ajustar o progresso para plantas em estágio de colheita
  const progress = stage === "harvest" ? 100 : baseProgress

  // Determinar necessidades da planta com base no índice
  // Algumas plantas precisam de água, outras de fertilizante, algumas de ambos
  const needsWater = index % 3 === 0
  const needsFertilizer = index % 4 === 0

  // Determinar o nível de saúde da planta
  // Criar uma distribuição variada de níveis de saúde para demonstração
  const healthLevels: HealthLevel[] = ["excellent", "good", "average", "poor", "critical"]
  const healthIndex = (index + plantIndex) % healthLevels.length
  const health = healthLevels[healthIndex]

  // Calcular o percentual de saúde com base no nível
  const healthPercentages = {
    excellent: 95 + (index % 6), // 95-100%
    good: 75 + (index % 15), // 75-89%
    average: 50 + (index % 20), // 50-69%
    poor: 25 + (index % 20), // 25-44%
    critical: 5 + (index % 15), // 5-19%
  }
  const healthPercentage = healthPercentages[health]

  // Definir possíveis problemas de saúde
  const possibleIssues = [
    "Falta de água",
    "Solo pobre",
    "Pragas",
    "Fungos",
    "Excesso de sol",
    "Falta de nutrientes",
    "Doença",
    "Raízes danificadas",
  ]

  // Atribuir problemas com base no nível de saúde
  const issues: string[] = []
  if (health === "critical") {
    // 3-4 problemas para saúde crítica
    const numIssues = 3 + (index % 2)
    for (let i = 0; i < numIssues; i++) {
      issues.push(possibleIssues[(index + i) % possibleIssues.length])
    }
  } else if (health === "poor") {
    // 1-2 problemas para saúde fraca
    const numIssues = 1 + (index % 2)
    for (let i = 0; i < numIssues; i++) {
      issues.push(possibleIssues[(index + i) % possibleIssues.length])
    }
  } else if (health === "average") {
    // 1 problema para saúde média
    issues.push(possibleIssues[index % possibleIssues.length])
  }
  // Plantas com saúde boa ou excelente não têm problemas

  return {
    name: plantType.name,
    stage: stage,
    icon: plantType.icons[stage],
    color: plantType.baseColor,
    stageText: stageInfo.suffix,
    progress: progress,
    nextStage: stageInfo.nextStage,
    needsWater,
    needsFertilizer,
    health,
    healthPercentage,
    issues,
  }
}

// Função para aplicar efeitos visuais com base na saúde da planta
const getPlantHealthStyles = (plant: Plant) => {
  if (!plant) return {}

  // Estilos para diferentes níveis de saúde
  const healthStyles = {
    excellent: {
      filter: "brightness(1.1) saturate(1.2)",
      transform: "scale(1.05)",
    },
    good: {
      filter: "brightness(1.05) saturate(1.1)",
      transform: "scale(1.02)",
    },
    average: {
      filter: "brightness(1) saturate(1)",
      transform: "scale(1)",
    },
    poor: {
      filter: "brightness(0.9) saturate(0.8)",
      transform: "scale(0.98)",
    },
    critical: {
      filter: "brightness(0.8) saturate(0.6) grayscale(0.3)",
      transform: "scale(0.95)",
    },
  }

  return healthStyles[plant.health]
}

export default function GameGrid({ viewType, activeQuadrant, onQuadrantClick }: GameGridProps) {
  const [selectedVillageSpot, setSelectedVillageSpot] = useState<string | null>(null)
  const [selectedPlantIndex, setSelectedPlantIndex] = useState<number | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: string } | null>(null)

  const handlePlantClick = (index: number) => {
    // Não selecionar o slot central (personagem)
    if (index === 7) return

    setSelectedPlantIndex(index)
  }

  const handleCloseActionMenu = () => {
    setSelectedPlantIndex(null)
  }

  const handlePlantAction = (action: string) => {
    // Simular a execução da ação
    let feedbackMessage = ""
    let feedbackType = "success"

    switch (action) {
      case "water":
        feedbackMessage = "Planta regada com sucesso!"
        break
      case "fertilize":
        feedbackMessage = "Adubo aplicado com sucesso!"
        break
      case "inspect":
        feedbackMessage = "Planta examinada. Está saudável!"
        break
      case "prune":
        feedbackMessage = "Planta podada com sucesso!"
        break
      case "support":
        feedbackMessage = "Suporte adicionado à planta!"
        break
      case "harvest":
        feedbackMessage = "Planta colhida com sucesso!"
        feedbackType = "harvest"
        break
      case "treat":
        feedbackMessage = "Tratamento aplicado com sucesso!"
        feedbackType = "health"
        break
      default:
        feedbackMessage = "Ação realizada com sucesso!"
    }

    // Mostrar feedback da ação
    setActionFeedback({ message: feedbackMessage, type: feedbackType })

    // Limpar feedback após alguns segundos
    setTimeout(() => {
      setActionFeedback(null)
    }, 3000)

    // Fechar o menu de ações
    setSelectedPlantIndex(null)
  }

  if (viewType === "village") {
    return (
      <div className="h-full p-5">
        <div className="bg-amber-100 h-full rounded-lg p-5 relative">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-medium text-amber-900">Vila</h2>
            <button
              className="bg-amber-600 text-white px-4 py-2 rounded-md text-sm hover:bg-amber-700 transition-colors flex items-center gap-2"
              onClick={() => {
                window.history.pushState({}, "", "?view=macro")
                document.dispatchEvent(new CustomEvent("viewChange", { detail: { view: "macro" } }))
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Mapa
            </button>
          </div>

          <div className="grid grid-cols-3 gap-5 md:grid-cols-4">
            {/* Estabelecimentos da Vila */}
            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center shadow-sm">
              <Home className="h-10 w-10 mb-3 text-amber-700" />
              <div className="font-medium">Casa do Tadeu Woodstock</div>
              <div className="text-xs text-amber-700 mt-1.5">Artesão local</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center shadow-sm">
              <Beer className="h-10 w-10 mb-3 text-amber-700" />
              <div className="font-medium">Bar do Pelé</div>
              <div className="text-xs text-amber-700 mt-1.5">Bebidas e conversas</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center shadow-sm">
              <Home className="h-10 w-10 mb-3 text-amber-700" />
              <div className="font-medium">Casa do Moacir</div>
              <div className="text-xs text-amber-700 mt-1.5">Contador de histórias</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center shadow-sm">
              <Utensils className="h-10 w-10 mb-3 text-amber-700" />
              <div className="font-medium">Restaurante da Nenzinha</div>
              <div className="text-xs text-amber-700 mt-1.5">Comida caseira</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center shadow-sm">
              <ShoppingCart className="h-10 w-10 mb-3 text-amber-700" />
              <div className="font-medium">Mercearia</div>
              <div className="text-xs text-amber-700 mt-1.5">Produtos diversos</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center shadow-sm">
              <Music className="h-10 w-10 mb-3 text-amber-700" />
              <div className="font-medium">Forró do Vegas</div>
              <div className="text-xs text-amber-700 mt-1.5">Música e dança</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center shadow-sm">
              <Building className="h-10 w-10 mb-3 text-amber-700" />
              <div className="font-medium">Prefeitura</div>
              <div className="text-xs text-amber-700 mt-1.5">Administração</div>
            </div>

            <div className="bg-amber-200 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-300 transition-colors text-center opacity-70 shadow-sm">
              <div className="font-medium">Espaço Disponível</div>
              <div className="text-xs text-amber-700 mt-1.5">Em construção</div>
            </div>
          </div>

          {/* Personagem no centro da vila */}
          <div className="absolute bottom-10 right-10">
            <UserCharacter size="medium" showTool={true} />
          </div>
        </div>
      </div>
    )
  }

  // Modificar a seção do viewType === "macro" para agrupar a cerca com o grid e ocupar todo o container

  if (viewType === "macro") {
    return (
      <div className="h-full w-full p-0">
        <div className="bg-green-200 h-full w-full rounded-lg relative overflow-hidden">
          {/* Container agrupado para cerca e grid */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Imagem de fundo com as cercas */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/cerca.png"
                alt="Cercas entre lotes"
                className="w-full"
                style={{
                  height: "200%",
                  width: "100%",
                  objectFit: "fill", // Mudando de 'cover' para 'fill' para permitir a distorção
                  transform: "scale(1)",
                  transformOrigin: "center center",
                  position: "absolute",
                  top: "calc(-50% + 50px)",
                }}
              />
            </div>

            {/* Grid de lotes - ajustado para encaixar na cerca */}
            <div className="grid grid-cols-5 grid-rows-3 gap-0 relative z-10 w-full h-full">
              {Array.from({ length: 15 }).map((_, index) => {
                // Calcular a posição do lote no grid
                const col = index % 5
                const row = Math.floor(index / 5)

                return (
                  <div
                    key={`lot-${index + 1}`}
                    className="bg-transparent flex items-center justify-center cursor-pointer hover:bg-green-400 hover:bg-opacity-20 transition-colors border border-green-400 border-opacity-20"
                  >
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-medium text-green-800">Lote {index + 1}</div>
                      <div className="text-xs sm:text-sm text-green-700 mt-1">
                        Jogador {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (viewType === "medium") {
    return (
      <div className="h-full p-5">
        <div className="bg-green-600 h-full rounded-lg p-3">
          <div className="grid grid-cols-5 grid-rows-3 gap-3 h-full">
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
                  className={`bg-green-500 rounded-md flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors relative p-2 ${isActive ? "ring-2 ring-red-500" : ""}`}
                  onClick={() => onQuadrantClick(quadrant)}
                >
                  {isCenter && <UserCharacter size="small" showTool={true} />}
                  <span className="absolute top-1.5 left-1.5 text-xs text-green-900 opacity-70 font-medium">
                    {quadrant}
                  </span>
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
    <div className="h-full p-5">
      <div className="bg-green-600 h-full rounded-lg p-3">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white font-medium text-lg">Quadrante {activeQuadrant}</h2>
          <button
            className="bg-green-700 text-white px-3 py-1.5 rounded text-sm hover:bg-green-800 transition-colors"
            onClick={() => onQuadrantClick("")}
          >
            Voltar
          </button>
        </div>

        {/* Feedback de ação */}
        {actionFeedback && (
          <div
            className={`mb-3 p-2.5 rounded text-sm text-center font-medium ${
              actionFeedback.type === "harvest"
                ? "bg-green-500 text-white"
                : actionFeedback.type === "health"
                  ? "bg-pink-500 text-white"
                  : "bg-blue-500 text-white"
            }`}
          >
            {actionFeedback.message}
          </div>
        )}

        <div className="grid grid-cols-5 grid-rows-3 gap-3 h-[calc(100%-3rem)]">
          {Array.from({ length: 15 }).map((_, index) => {
            // Verificar se estamos no quadrante C2 para mostrar plantas
            const isC2 = activeQuadrant === "C2"
            const plant = isC2 ? getPlantForC2(index) : null
            const isSelected = selectedPlantIndex === index

            // Obter estilos baseados na saúde da planta
            const healthStyles = plant ? getPlantHealthStyles(plant) : {}

            return (
              <div
                key={index}
                className={`${plant ? plant.color : "bg-green-500"} rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-green-400 transition-colors relative p-2 ${
                  plant && plant.health === "critical" ? "animate-pulse" : ""
                }`}
                onClick={() => plant && handlePlantClick(index)}
                style={healthStyles}
              >
                {index === 7 && <UserCharacter size="micro" showTool={true} />}

                {plant && (
                  <>
                    {/* Indicadores de necessidades */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      {plant.needsWater && (
                        <span className="bg-blue-500 rounded-full p-0.5 shadow-sm">
                          <Droplet className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                      {plant.needsFertilizer && (
                        <span className="bg-amber-500 rounded-full p-0.5 shadow-sm">
                          <Sparkles className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Indicador de saúde crítica */}
                    {plant.health === "critical" && (
                      <div className="absolute top-1.5 left-1.5">
                        <span className="bg-red-500 rounded-full p-0.5 shadow-sm">
                          <AlertTriangle className="h-2.5 w-2.5 text-white" />
                        </span>
                      </div>
                    )}

                    <div className="mb-2">{plant.icon}</div>
                    <span className="text-xs text-center font-medium mb-0.5">{plant.name}</span>
                    <span className="text-[10px] text-center text-gray-600 mb-1">{plant.stageText}</span>

                    {/* Barra de progresso */}
                    <ProgressBar progress={plant.progress} nextStage={plant.nextStage} />

                    {/* Indicador de saúde */}
                    <HealthIndicator health={plant.health} percentage={plant.healthPercentage} issues={plant.issues} />

                    {/* Menu de ações quando a planta está selecionada */}
                    {isSelected && (
                      <PlantActionMenu plant={plant} onClose={handleCloseActionMenu} onAction={handlePlantAction} />
                    )}
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
