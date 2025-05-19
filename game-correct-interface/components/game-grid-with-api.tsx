"use client"

import { useState } from "react"
import {
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
import Character from "./character"
import { useTerrains } from "@/hooks/useTerrains"
import { useQuadrants } from "@/hooks/useQuadrants"
import { usePlantings } from "@/hooks/usePlantings"
import { usePlayerContext } from "@/context/PlayerContext"
import type { Slot, Planting } from "@/types/api"

interface GameGridProps {
  viewType: ViewType
  activeQuadrant: string
  onQuadrantClick: (quadrant: string) => void
}

export default function GameGridWithApi({ viewType, activeQuadrant, onQuadrantClick }: GameGridProps) {
  const { currentPlayerId } = usePlayerContext()
  const { terrains, isLoading: terrainsLoading } = useTerrains()

  // Encontrar o terreno ativo com base no quadrante ativo
  const activeTerrain = terrains.find((terrain) => terrain.quadrants?.some((q) => q.position === activeQuadrant))

  const { quadrants, isLoading: quadrantsLoading } = useQuadrants(activeTerrain?.id || "")

  // Encontrar o quadrante ativo
  const activeQuadrantData = quadrants.find((q) => q.position === activeQuadrant)

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const { planting, performAction, isPerformingAction } = usePlantings(selectedSlotId || undefined)

  const [selectedVillageSpot, setSelectedVillageSpot] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<{ message: string; type: string } | null>(null)

  const handlePlantClick = (slot: Slot) => {
    // Não selecionar o slot central (personagem)
    if (slot.position === 7) return

    setSelectedSlotId(slot.id)
  }

  const handleCloseActionMenu = () => {
    setSelectedSlotId(null)
  }

  const handlePlantAction = async (action: string) => {
    if (!selectedSlotId || !planting) return

    try {
      // Chamar a API para realizar a ação
      await performAction({
        action: action as any,
        planting_id: planting.id,
      })

      // Mostrar feedback da ação
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
    } catch (error) {
      console.error("Erro ao realizar ação:", error)
      setActionFeedback({
        message: "Erro ao realizar ação. Tente novamente.",
        type: "error",
      })

      // Limpar feedback de erro após alguns segundos
      setTimeout(() => {
        setActionFeedback(null)
      }, 3000)
    }

    // Fechar o menu de ações
    setSelectedSlotId(null)
  }

  // Renderização condicional baseada no tipo de visualização
  if (viewType === "village") {
    // Código existente para a visualização da vila
    return <div className="h-full p-5">{/* Conteúdo existente */}</div>
  }

  if (viewType === "macro") {
    // Código existente para a visualização macro
    return <div className="h-full w-full p-0">{/* Conteúdo existente */}</div>
  }

  if (viewType === "medium") {
    // Integração com a API para a visualização média
    if (terrainsLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="w-16 h-16 border-t-4 border-olive-600 rounded-full animate-spin"></div>
        </div>
      )
    }

    return (
      <div className="h-full p-5">
        <div className="bg-green-600 h-full rounded-lg p-3">
          <div className="grid grid-cols-5 grid-rows-3 gap-3 h-full">
            {terrains.map((terrain, index) => {
              const col = index % 5
              const row = Math.floor(index / 5)
              const letters = ["A", "B", "C", "D", "E"]
              const quadrant = `${letters[col]}${row + 1}`
              const isActive = quadrant === activeQuadrant
              const isCenter = col === 2 && row === 1

              return (
                <div
                  key={terrain.id}
                  className={`bg-green-500 rounded-md flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors relative p-2 ${isActive ? "ring-2 ring-red-500" : ""}`}
                  onClick={() => onQuadrantClick(quadrant)}
                >
                  {isCenter && <Character size="small" />}
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

  // Micro view - Integração com a API
  if (quadrantsLoading || !activeQuadrantData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-16 h-16 border-t-4 border-olive-600 rounded-full animate-spin"></div>
      </div>
    )
  }

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
                  : actionFeedback.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
            }`}
          >
            {actionFeedback.message}
          </div>
        )}

        <div className="grid grid-cols-5 grid-rows-3 gap-3 h-[calc(100%-3rem)]">
          {activeQuadrantData.slots?.map((slot, index) => {
            const isSelected = selectedSlotId === slot.id
            const slotPlanting = slot.planting

            // Renderizar o slot com base no seu status
            return (
              <div
                key={slot.id}
                className={`${
                  slot.status === "empty"
                    ? "bg-green-500"
                    : slot.status === "blocked"
                      ? "bg-gray-500"
                      : slotPlanting
                        ? getPlantBackgroundColor(slotPlanting)
                        : "bg-green-500"
                } rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-green-400 transition-colors relative p-2 ${
                  slotPlanting?.health === "critical" ? "animate-pulse" : ""
                }`}
                onClick={() => slot.status !== "blocked" && handlePlantClick(slot)}
                style={slotPlanting ? getPlantHealthStyles(slotPlanting) : {}}
              >
                {index === 7 && <Character size="micro" />}

                {slotPlanting && (
                  <>
                    {/* Indicadores de necessidades */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      {slotPlanting.needs_water && (
                        <span className="bg-blue-500 rounded-full p-0.5 shadow-sm">
                          <Droplet className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                      {slotPlanting.needs_fertilizer && (
                        <span className="bg-amber-500 rounded-full p-0.5 shadow-sm">
                          <Sparkles className="h-2.5 w-2.5 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Indicador de saúde crítica */}
                    {slotPlanting.health === "critical" && (
                      <div className="absolute top-1.5 left-1.5">
                        <span className="bg-red-500 rounded-full p-0.5 shadow-sm">
                          <AlertTriangle className="h-2.5 w-2.5 text-white" />
                        </span>
                      </div>
                    )}

                    <div className="mb-2">{getPlantIcon(slotPlanting)}</div>
                    <span className="text-xs text-center font-medium mb-0.5">
                      {slotPlanting.plant?.name || "Planta"}
                    </span>
                    <span className="text-[10px] text-center text-gray-600 mb-1">
                      {getGrowthStageText(slotPlanting.growth_stage)}
                    </span>

                    {/* Barra de progresso */}
                    <ProgressBar
                      progress={getProgressToNextStage(slotPlanting)}
                      nextStage={getNextStageName(slotPlanting.growth_stage)}
                    />

                    {/* Indicador de saúde */}
                    <HealthIndicator
                      health={slotPlanting.health}
                      percentage={slotPlanting.health_percentage}
                      issues={slotPlanting.issues}
                    />

                    {/* Menu de ações quando a planta está selecionada */}
                    {isSelected && (
                      <PlantActionMenu
                        planting={slotPlanting}
                        onClose={handleCloseActionMenu}
                        onAction={handlePlantAction}
                        isLoading={isPerformingAction}
                      />
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

// Funções auxiliares para renderização de plantas
function getPlantBackgroundColor(planting: Planting): string {
  const type = planting.plant?.type || ""

  switch (type) {
    case "vegetable":
      return "bg-green-100"
    case "fruit":
      return "bg-orange-100"
    case "grain":
      return "bg-yellow-100"
    case "herb":
      return "bg-emerald-100"
    default:
      return "bg-green-100"
  }
}

function getPlantIcon(planting: Planting): JSX.Element {
  const stage = planting.growth_stage
  const type = planting.plant?.type || ""

  // Ícones básicos por tipo e estágio
  if (stage === "seedling") {
    return <Sprout className="h-5 w-5 text-green-500" />
  }

  if (stage === "growing") {
    return <Leaf className="h-5 w-5 text-green-600" />
  }

  if (stage === "flowering") {
    return <Flower className="h-5 w-5 text-yellow-400" />
  }

  if (type === "vegetable") {
    return <Carrot className="h-5 w-5 text-orange-500" />
  }

  if (type === "fruit") {
    return <Banana className="h-5 w-5 text-yellow-500" />
  }

  if (type === "grain") {
    return <Wheat className="h-5 w-5 text-yellow-600" />
  }

  return <Leaf className="h-5 w-5 text-green-700" />
}

function getGrowthStageText(stage: string): string {
  switch (stage) {
    case "seedling":
      return "(Muda)"
    case "growing":
      return "(Crescimento)"
    case "flowering":
      return "(Floração)"
    case "mature":
      return "(Maduro)"
    case "harvest":
      return "(Colheita)"
    default:
      return ""
  }
}

function getNextStageName(currentStage: string): string {
  switch (currentStage) {
    case "seedling":
      return "Crescimento"
    case "growing":
      return "Floração"
    case "flowering":
      return "Maduro"
    case "mature":
      return "Colheita"
    case "harvest":
      return "Colheita Pronta"
    default:
      return "Próximo Estágio"
  }
}

function getProgressToNextStage(planting: Planting): number {
  // Calcular o progresso com base no tempo até o próximo estágio
  const now = new Date()
  const nextStageAt = new Date(planting.next_stage_at)
  const plantedAt = new Date(planting.planted_at)

  // Se já passou do tempo para o próximo estágio
  if (now > nextStageAt) {
    return 100
  }

  // Calcular o progresso como porcentagem do tempo total
  const totalTime = nextStageAt.getTime() - plantedAt.getTime()
  const elapsedTime = now.getTime() - plantedAt.getTime()

  return Math.min(100, Math.max(0, Math.floor((elapsedTime / totalTime) * 100)))
}

function getPlantHealthStyles(planting: Planting) {
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

  return healthStyles[planting.health as keyof typeof healthStyles]
}

// Componentes auxiliares
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

function HealthIndicator({ health, percentage, issues }: { health: string; percentage: number; issues: string[] }) {
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

  const config = healthConfig[health as keyof typeof healthConfig]

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

function PlantActionMenu({
  planting,
  onClose,
  onAction,
  isLoading,
}: {
  planting: Planting
  onClose: () => void
  onAction: (action: string) => void
  isLoading: boolean
}) {
  // Definir ações disponíveis com base no estágio da planta
  const getAvailableActions = () => {
    const actions = []

    // Ações básicas disponíveis para todos os estágios
    if (planting.needs_water) {
      actions.push({
        id: "water",
        label: "Regar",
        icon: <Droplet className="h-4 w-4" />,
        color: "bg-blue-500 hover:bg-blue-600",
      })
    }

    if (planting.needs_fertilizer) {
      actions.push({
        id: "fertilize",
        label: "Adubar",
        icon: <Sparkles className="h-4 w-4" />,
        color: "bg-amber-500 hover:bg-amber-600",
      })
    }

    // Ações específicas por estágio
    switch (planting.growth_stage) {
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
    if (planting.health === "poor" || planting.health === "critical") {
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
          <h3 className="text-xs font-bold">{planting.plant?.name || "Planta"}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-2">
            <div className="w-6 h-6 border-t-2 border-olive-600 rounded-full animate-spin"></div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
