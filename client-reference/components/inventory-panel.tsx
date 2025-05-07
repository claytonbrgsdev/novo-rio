"use client"

import { Shovel, Droplet, SproutIcon as Seedling, ShoppingBag } from "lucide-react"

interface InventoryPanelProps {
  activeTab: "tools" | "inputs" | "plantables"
  onTabChange: (tab: "tools" | "inputs" | "plantables") => void
}

export default function InventoryPanel({ activeTab, onTabChange }: InventoryPanelProps) {
  const inventoryItems = {
    tools: [
      { name: "Pá", quantity: 1 },
      { name: "Foice", quantity: 1 },
      { name: "Regador", quantity: 1 },
    ],
    inputs: [
      { name: "Água", quantity: 10 },
      { name: "Fertilizante", quantity: 5 },
      { name: "Composto", quantity: 3 },
    ],
    plantables: [
      { name: "Sementes de Abóbora", quantity: 8 },
      { name: "Mudas de Cenoura", quantity: 5 },
      { name: "Sementes de Tomate", quantity: 12 },
    ],
  }

  return (
    <div className="bg-amber-700 text-amber-100 p-2 flex flex-col">
      <div className="flex items-center mb-2 relative">
        <h2 className="font-medium uppercase text-sm w-full text-center">Inventário</h2>
        <button className="bg-amber-600 text-white p-2 rounded-full shadow-md hover:bg-amber-700 transition-colors absolute right-0">
          <ShoppingBag className="h-5 w-5" />
        </button>
      </div>

      <div className="flex justify-around mb-2">
        <button
          className={`p-2 rounded ${activeTab === "tools" ? "bg-amber-600" : "hover:bg-amber-800"}`}
          onClick={() => onTabChange("tools")}
        >
          <Shovel className="h-5 w-5" />
        </button>
        <button
          className={`p-2 rounded ${activeTab === "inputs" ? "bg-amber-600" : "hover:bg-amber-800"}`}
          onClick={() => onTabChange("inputs")}
        >
          <Droplet className="h-5 w-5" />
        </button>
        <button
          className={`p-2 rounded ${activeTab === "plantables" ? "bg-amber-600" : "hover:bg-amber-800"}`}
          onClick={() => onTabChange("plantables")}
        >
          <Seedling className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-amber-200 text-amber-900 rounded-md flex-grow p-2 overflow-y-auto">
        <ul className="space-y-2">
          {inventoryItems[activeTab].map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 bg-amber-100 rounded hover:bg-amber-50 cursor-pointer"
            >
              <span>{item.name}</span>
              <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs">{item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
