"use client"

import { useState } from "react"
import { Shovel, Droplet, SproutIcon as Seedling } from "lucide-react"
import { useInventory } from "@/hooks/useInventory"

interface InventoryPanelProps {
  activeTab: "tools" | "inputs" | "plantables"
  onTabChange: (tab: "tools" | "inputs" | "plantables") => void
}

export default function InventoryPanel({ activeTab, onTabChange }: InventoryPanelProps) {
  const { inventoryItems, isLoading } = useInventory(activeTab)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const handleItemClick = (itemId: string) => {
    setSelectedItem(itemId === selectedItem ? null : itemId)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-olive-300">
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "tools"
              ? "bg-olive-200 text-olive-900 border-b-2 border-olive-600"
              : "bg-paper-100 text-olive-700 hover:bg-olive-100"
          }`}
          onClick={() => onTabChange("tools")}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Shovel className="h-4 w-4" />
            <span>Ferramentas</span>
          </div>
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "inputs"
              ? "bg-olive-200 text-olive-900 border-b-2 border-olive-600"
              : "bg-paper-100 text-olive-700 hover:bg-olive-100"
          }`}
          onClick={() => onTabChange("inputs")}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Droplet className="h-4 w-4" />
            <span>Insumos</span>
          </div>
        </button>
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${
            activeTab === "plantables"
              ? "bg-olive-200 text-olive-900 border-b-2 border-olive-600"
              : "bg-paper-100 text-olive-700 hover:bg-olive-100"
          }`}
          onClick={() => onTabChange("plantables")}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Seedling className="h-4 w-4" />
            <span>Plantáveis</span>
          </div>
        </button>
      </div>

      {/* Inventory content */}
      <div className="flex-grow overflow-auto p-2">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-t-2 border-olive-600 rounded-full animate-spin"></div>
          </div>
        ) : inventoryItems.length === 0 ? (
          <div className="flex justify-center items-center h-full text-olive-600 text-sm">Nenhum item encontrado</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {inventoryItems.map((item) => (
              <div
                key={item.id}
                className={`bg-olive-100 p-2 rounded cursor-pointer hover:bg-olive-200 transition-colors ${
                  selectedItem === item.id ? "ring-2 ring-olive-600" : ""
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 bg-olive-200 rounded-full flex items-center justify-center mb-1">
                    {/* Ícone baseado no tipo de item */}
                    {item.item_type === "tool" && <Shovel className="h-5 w-5 text-olive-700" />}
                    {item.item_type === "input" && <Droplet className="h-5 w-5 text-olive-700" />}
                    {(item.item_type === "seed" || item.item_type === "seedling") && (
                      <Seedling className="h-5 w-5 text-olive-700" />
                    )}
                  </div>
                  <div className="text-xs text-center font-medium text-olive-800 truncate w-full">
                    {/* Nome do item seria obtido através do item_id e tipo */}
                    Item {item.item_id.substring(0, 8)}
                  </div>
                  <div className="text-[10px] text-olive-600">Qtd: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
