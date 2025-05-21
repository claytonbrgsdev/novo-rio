"use client"

import { useState, useEffect } from 'react'
import * as React from 'react'
import { cn } from "@/lib/utils"
import { 
  Droplets, 
  LeafyGreen, 
  AlertTriangle, 
  Clock, 
  Sprout, 
  ArrowUpRight,
  Droplet,
  Leaf,
  Sun,
  Thermometer,
  LucideIcon,
  LucideProps
} from "lucide-react"

type QuadrantData = {
  moisture: number
  fertility: number
  temperature: number
  sunlight: number
  lastWatered: number
  plantCount: number
  hasIssues: boolean
  issues: string[]
  plants: Array<{
    name: string
    health: number
    progress: number
    nextStage: string
    timeToNextStage: string
  }>
}

interface QuadrantInfoProps {
  activeQuadrant: string | null
  className?: string
  onExpandedChange?: (isExpanded: boolean) => void
}

export default function QuadrantInfo({ 
  activeQuadrant, 
  className,
  onExpandedChange 
}: QuadrantInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // Notify parent of expanded state changes
  useEffect(() => {
    onExpandedChange?.(isExpanded)
  }, [isExpanded, onExpandedChange])
  const [data, setData] = useState<QuadrantData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Mock data fetch
  useEffect(() => {
    if (!activeQuadrant) return
    
    const fetchData = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockData: QuadrantData = {
        moisture: Math.floor(Math.random() * 100),
        fertility: Math.floor(Math.random() * 100),
        temperature: 24 + Math.floor(Math.random() * 15),
        sunlight: 40 + Math.floor(Math.random() * 60),
        lastWatered: Math.floor(Math.random() * 24),
        plantCount: Math.floor(Math.random() * 5),
        hasIssues: Math.random() > 0.7,
        issues: [],
        plants: [
          { 
            name: 'Milho', 
            health: 30 + Math.floor(Math.random() * 70),
            progress: 10 + Math.floor(Math.random() * 90),
            nextStage: 'Crescendo',
            timeToNextStage: `${Math.ceil(Math.random() * 3)} dia${Math.random() > 0.5 ? 's' : ''}`
          },
          { 
            name: 'Feijão', 
            health: 30 + Math.floor(Math.random() * 70),
            progress: 10 + Math.floor(Math.random() * 90),
            nextStage: 'Germinando',
            timeToNextStage: `${Math.ceil(Math.random() * 3)} dia${Math.random() > 0.5 ? 's' : ''}`
          }
        ]
      }

      // Add issues based on conditions
      if (mockData.moisture < 30) mockData.issues.push('Baixa umidade')
      if (mockData.fertility < 30) mockData.issues.push('Solo pobre')
      if (Math.random() > 0.7) mockData.issues.push('Pragas detectadas')
      if (mockData.issues.length > 0) mockData.hasIssues = true
      
      setData(mockData)
      setIsLoading(false)
    }
    
    fetchData()
  }, [activeQuadrant])

  const getStatusColor = (value: number) => 
    value > 70 ? "text-green-600" : value > 40 ? "text-amber-500" : "text-red-500"

  const getStatusBgColor = (value: number) =>
    value > 70 ? "bg-green-50" : value > 40 ? "bg-amber-50" : "bg-red-50"

  const handleWaterClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Implement water action
    console.log(`Watering quadrant ${activeQuadrant}`)
  }

  if (!activeQuadrant) {
    return (
      <div className={cn("text-center py-3 px-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg text-sm", className)}>
        <p className="text-amber-700 flex items-center justify-center gap-2">
          <Sprout className="w-4 h-4" />
          Selecione um quadrante
        </p>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className={cn("p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg text-sm", className)}>
        <div className="animate-pulse space-y-2">
          <div className="h-5 bg-amber-200 rounded w-3/4"></div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="h-12 bg-amber-100 rounded"></div>
            <div className="h-12 bg-amber-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const { 
    moisture, 
    fertility, 
    temperature, 
    sunlight,
    lastWatered, 
    plantCount, 
    hasIssues, 
    issues,
    plants
  } = data

  return (
    <div 
      className={cn(
        "bg-gradient-to-r from-amber-50 to-amber-100 rounded-t-lg overflow-hidden shadow-md text-sm transition-all duration-300 ease-in-out transform",
        isExpanded ? "max-h-[500px]" : "max-h-[180px]",
        "hover:shadow-lg hover:translate-y-[-2px]",
        className
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-amber-200 flex justify-between items-center cursor-pointer hover:bg-amber-50/50 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm">
            {activeQuadrant}
          </div>
          <span className="font-bold text-amber-900">Quadrante {activeQuadrant}</span>
          {hasIssues && (
            <span className="flex items-center text-red-600 text-xs bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {issues[0]}
              {issues.length > 1 && ` +${issues.length - 1}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-amber-700 bg-white/50 px-2 py-0.5 rounded-full">
            <Droplet className="w-3 h-3 text-blue-500" />
            <span>{lastWatered}h</span>
          </div>
          <button 
            onClick={handleWaterClick}
            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
            title="Regar quadrante"
          >
            <Droplets className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-2">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <StatCard 
            icon={<Droplets className="w-4 h-4 text-blue-500" />}
            label="Umidade"
            value={`${moisture}%`}
            statusColor={getStatusColor(moisture)}
            bgColor={getStatusBgColor(moisture)}
          />
          
          <StatCard 
            icon={<LeafyGreen className="w-4 h-4 text-green-500" />}
            label="Fertilidade"
            value={`${fertility}%`}
            statusColor={getStatusColor(fertility)}
            bgColor={getStatusBgColor(fertility)}
          />
          
          {isExpanded && (
            <>
              <StatCard 
                icon={<Thermometer className="w-4 h-4 text-orange-500" />}
                label="Temperatura"
                value={`${temperature}°C`}
                statusColor="text-gray-800"
                bgColor="bg-orange-50"
              />
              
              <StatCard 
                icon={<Sun className="w-4 h-4 text-yellow-500" />}
                label="Luz Solar"
                value={`${sunlight}%`}
                statusColor="text-gray-800"
                bgColor="bg-yellow-50"
              />
            </>
          )}
        </div>
        
        {/* Plants Summary */}
        <div 
          className={cn(
            "bg-white/50 rounded-lg border border-amber-100 overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-96" : "max-h-0 opacity-0"
          )}
        >
          <div className="p-2">
            <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center">
              <Leaf className="w-3.5 h-3.5 mr-1.5" />
              Plantas ({plantCount})
            </h4>
            
            {plantCount > 0 ? (
              <div className="space-y-2">
                {plants.slice(0, 3).map((plant, index) => (
                  <div key={index} className="p-2 bg-white rounded border border-amber-50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-amber-900">{plant.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusBgColor(plant.health)} ${getStatusColor(plant.health)}`}>
                        {plant.health}%
                      </span>
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      {plant.nextStage} • Próximo estágio em {plant.timeToNextStage}
                    </div>
                    <div className="mt-1.5 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusBgColor(plant.health)}`}
                        style={{ width: `${plant.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-amber-600 text-xs">
                Nenhuma planta neste quadrante
              </div>
            )}
          </div>
        </div>
        
        {/* Expand/Collapse Button */}
        <div className="mt-2 flex justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 px-2 py-1 hover:bg-amber-100 rounded-full transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Menos detalhes</span>
                <ArrowUpRight className="w-3 h-3 rotate-180" />
              </>
            ) : (
              <>
                <span>Mais detalhes</span>
                <ArrowUpRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactElement<LucideProps>;
  label: string;
  value: string;
  statusColor: string;
  bgColor: string;
}

function StatCard({ 
  icon, 
  label, 
  value, 
  statusColor,
  bgColor 
}: StatCardProps) {
  // Clone the icon with additional props
  const iconWithClass = React.cloneElement(icon, { 
    className: 'w-4 h-4',
    ...icon.props
  });

  return (
    <div className={`p-2 rounded-xl border ${bgColor} border-amber-100/70 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-white shadow-sm border border-amber-50">
          {iconWithClass}
        </div>
        <div>
          <div className="text-xs font-medium text-amber-700 mb-0.5">{label}</div>
          <div className={`font-semibold text-base ${statusColor}`}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
