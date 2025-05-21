"use client"

import { useState } from "react"
import { Shovel, Archive, Sprout as Seedling, ShoppingCart as Store } from "lucide-react"

// Only these tabs are interactive
type InteractiveTab = "tools" | "inputs" | "plantables"
// This is the union type that includes the store tab
type TabType = InteractiveTab | "store"

interface InventoryTabsProps {
  activeTab?: InteractiveTab
  onTabChange?: (tab: InteractiveTab) => void
  showStoreTab?: boolean
}

export default function InventoryTabs({ 
  activeTab: externalActiveTab, 
  onTabChange: externalOnTabChange,
  showStoreTab = true
}: InventoryTabsProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState<TabType>("tools")
  const [showStoreTooltip, setShowStoreTooltip] = useState(false)
  
  // Use external state if provided, otherwise use internal state
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab as InteractiveTab
  
  const handleTabChange = (tab: InteractiveTab) => {
    if (externalOnTabChange) {
      externalOnTabChange(tab)
    } else {
      setInternalActiveTab(tab)
    }
  }
  
  return (
    <div className="flex items-center h-full space-x-1">
      <button
        className={`h-8 px-2 text-xs rounded flex items-center justify-center gap-1 transition-all ${
          activeTab === 'tools' 
            ? 'bg-olive-500 text-white font-medium' 
            : 'bg-paper-200 text-olive-700 hover:bg-paper-300'
        }`}
        onClick={() => handleTabChange("tools")}
      >
        <Shovel className="w-3 h-3 flex-shrink-0" />
        <span className="whitespace-nowrap">Ferramentas</span>
      </button>
      
      <button
        className={`h-8 px-2 text-xs rounded flex items-center justify-center gap-1 transition-all ${
          activeTab === 'inputs' 
            ? 'bg-olive-500 text-white font-medium' 
            : 'bg-paper-200 text-olive-700 hover:bg-paper-300'
        }`}
        onClick={() => handleTabChange("inputs")}
      >
        <Archive className="w-3 h-3 flex-shrink-0" />
        <span className="whitespace-nowrap">Insumos</span>
      </button>
      
      <button
        className={`h-8 px-2 text-xs rounded flex items-center justify-center gap-1 transition-all ${
          activeTab === 'plantables' 
            ? 'bg-olive-500 text-white font-medium' 
            : 'bg-paper-200 text-olive-700 hover:bg-paper-300'
        }`}
        onClick={() => handleTabChange("plantables")}
      >
        <Seedling className="w-3 h-3 flex-shrink-0" />
        <span className="whitespace-nowrap">Plantáveis</span>
      </button>
      
      {showStoreTab && (
        <>
          <div className="border-r border-olive-300 h-4 mx-1"></div>
          <div className="relative">
            <button
              className={`h-8 px-2 text-xs rounded flex items-center justify-center gap-1 transition-all opacity-70 cursor-not-allowed ${
                internalActiveTab === 'store' 
                  ? 'bg-olive-400 text-white' 
                  : 'bg-paper-200 text-olive-400'
              }`}
              disabled
              onMouseEnter={() => setShowStoreTooltip(true)}
              onMouseLeave={() => setShowStoreTooltip(false)}
            >
              <Store className="w-3 h-3 flex-shrink-0" />
              <span className="whitespace-nowrap">Loja</span>
            </button>
            
            {showStoreTooltip && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-olive-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50">
                Loja em breve!!
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-olive-800 rotate-45"></div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
