"use client"

import { useState } from "react"
import { useInventory } from "@/hooks/useInventory"

export type ActiveTab = "tools" | "inputs" | "plantables"

type PlantableSubTab = "seeds" | "seedlings" | "cuttings"

interface InventoryItem {
  id: number
  name: string
  icon: string
  quantity: number
  durability?: number
  description?: string
  type?: string
}

interface InventoryPanelProps {
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
}

export default function InventoryPanel({ 
  activeTab, 
  onTabChange 
}: InventoryPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<PlantableSubTab>("seeds")
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  
  // Map UI tabs to API types
  const tabToApiType = {
    tools: 'tool',
    inputs: 'input',
    plantables: 'seed'
  } as const
  
  const { inventoryItems = [], isLoading } = useInventory(tabToApiType[activeTab])

  // Enhanced inventory items with actual icons and descriptions
  const toolItems: InventoryItem[] = [
    { 
      id: 1, 
      name: "Pá", 
      icon: "🪴", 
      quantity: 1,
      durability: 100,
      description: "Utilizada para preparar a terra para plantio."
    },
    { 
      id: 2, 
      name: "Regador", 
      icon: "💧", 
      quantity: 1,
      durability: 100,
      description: "Usado para irrigar as plantas."
    },
    { 
      id: 3, 
      name: "Tesoura", 
      icon: "✂️", 
      quantity: 1,
      durability: 100,
      description: "Para podar plantas e colher."
    },
  ]
  
  const inputItems: InventoryItem[] = [
    { 
      id: 1, 
      name: "Adubo Natural", 
      icon: "🧪", 
      quantity: 5,
      description: "Enriquece o solo com nutrientes."
    },
    { 
      id: 2, 
      name: "Composto Orgânico", 
      icon: "🌱", 
      quantity: 3,
      description: "Melhora a estrutura do solo."
    },
  ]
  
  const plantableItems: InventoryItem[] = [
    { 
      id: 1, 
      name: "Semente de Cenoura", 
      icon: "🥕", 
      quantity: 10,
      description: "Produz em 90 dias."
    },
    { 
      id: 2, 
      name: "Semente de Tomate", 
      icon: "🍅", 
      quantity: 15,
      description: "Produz em 75 dias."
    },
    { 
      id: 3, 
      name: "Muda de Alface", 
      icon: "🥬", 
      quantity: 5,
      description: "Produz em 60 dias."
    },
  ]
  
  // Function to get the current active items
  const getActiveItems = (): InventoryItem[] => {
    if (isLoading) return []
    
    // If we have API data, use it
    if (inventoryItems && inventoryItems.length > 0) {
      const items = inventoryItems.map((item: any, index: number) => ({
        id: index,
        name: item.name || "Item",
        icon: getIconForItem(item.type),
        quantity: item.quantity || 1,
        durability: item.durability,
        description: item.description,
        type: item.type
      }))
      
      // Filter by sub-tab if on plantables tab
      if (activeTab === 'plantables') {
        return items.filter(item => {
          if (activeSubTab === 'seeds') return item.type === 'seed'
          if (activeSubTab === 'seedlings') return item.type === 'seedling'
          if (activeSubTab === 'cuttings') return item.type === 'cutting'
          return true
        })
      }
      
      return items
    }
    
    // Otherwise use our dummy data
    switch(activeTab) {
      case 'tools': return toolItems
      case 'inputs': return inputItems
      case 'plantables': 
        // Filter plantable items by active sub-tab
        return plantableItems.filter(item => {
          if (activeSubTab === 'seeds') return item.name.includes('Semente')
          if (activeSubTab === 'seedlings') return item.name.includes('Muda')
          if (activeSubTab === 'cuttings') return item.name.includes('Estaca')
          return true
        })
      default: return toolItems
    }
  }
  
  // Helper to get icons based on item type
  const getIconForItem = (type: string): string => {
    switch(type) {
      case 'shovel':
      case 'pá':
        return '🪴'
      case 'water':
      case 'regador':
        return '💧'
      case 'scissors':
      case 'tesoura':
        return '✂️'
      default:
        return '📦'
    }
  }
  
  return (
    <div className="h-full bg-gradient-to-b from-paper-50 to-paper-100 p-2 font-handwritten overflow-y-auto">
      {/* Content area */}
      
      {/* Plantable subtabs - only show when on plantables tab */}
      {activeTab === "plantables" && (
        <div className="flex gap-1 mb-3">
          <button
            className={`px-2 py-1 text-xs rounded-md flex items-center transition-all ${activeSubTab === 'seeds' ? 'bg-olive-600 text-white font-medium' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
            onClick={() => setActiveSubTab("seeds")}
          >
            Sementes
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-md flex items-center transition-all ${activeSubTab === 'seedlings' ? 'bg-olive-600 text-white font-medium' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
            onClick={() => setActiveSubTab("seedlings")}
          >
            Mudas
          </button>
          <button
            className={`px-2 py-1 text-xs rounded-md flex items-center transition-all ${activeSubTab === 'cuttings' ? 'bg-olive-600 text-white font-medium' : 'bg-olive-100 text-olive-700 hover:bg-olive-200'}`}
            onClick={() => setActiveSubTab("cuttings")}
          >
            Estacas
          </button>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-24">
          <div className="w-8 h-8 border-t-2 border-olive-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Inventory items based on active tab */}
      {!isLoading && (
        <div className="grid grid-cols-2 gap-2.5">
          {getActiveItems().map(item => (
            <div 
              key={item.id} 
              className="bg-paper-200 border border-olive-300 rounded-md p-2 flex items-center relative transition-all hover:bg-paper-300 hover:shadow-sm cursor-pointer"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="bg-paper-300 h-10 w-10 flex items-center justify-center rounded-md mr-3 border border-olive-200 shadow-sm">
                {item.icon}
              </div>
              <div>
                <div className="text-xs font-medium text-olive-900">{item.name}</div>
                <div className="text-xs text-olive-700">Qtd: {item.quantity}</div>
                {item.durability && (
                  <div className="w-full bg-olive-200 h-1.5 mt-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full" 
                      style={{ width: `${item.durability}%` }}
                    ></div>
                  </div>
                )}
              </div>
              
              {/* Tooltip */}
              {hoveredItem === item.id && item.description && (
                <div className="absolute bottom-full left-0 mb-1 p-2 bg-olive-800 text-white text-xs rounded shadow-md z-10 w-full">
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Empty state if no items */}
      {!isLoading && getActiveItems().length === 0 && (
        <div className="flex items-center justify-center h-24 text-olive-500 text-sm">
          Nenhum item disponível
        </div>
      )}
      
      {/* Store button (coming soon) */}
      <div className="mt-4 flex justify-center">
        <button
          className="bg-amber-100 text-amber-800 px-3 py-2 rounded-md text-xs flex items-center gap-1.5 opacity-80 cursor-not-allowed"
          disabled={true}
          title="Loja em breve"
        >
          <span className="text-base">🛒</span>
          Loja em breve
        </button>
      </div>
    </div>
  )
}
