"use client"

import { useState } from "react"
import { Shovel, Droplet, SproutIcon as Seedling, Store } from "lucide-react"

interface InventoryPanelProps {
  activeTab: "tools" | "inputs" | "plantables"
  onTabChange: (tab: "tools" | "inputs" | "plantables") => void
}

type PlantableSubTab = "seeds" | "seedlings" | "cuttings"

export default function InventoryPanel({ activeTab, onTabChange }: InventoryPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<PlantableSubTab>("seeds")

  // Dados do inventário
  const inventoryItems = {
    tools: [
      { name: "Facão", quantity: 1 },
      { name: "Pá", quantity: 1 },
      { name: "Regador", quantity: 1 },
      { name: "Foice", quantity: 1 },
      { name: "Motoserra", quantity: 1 },
    ],
    inputs: [
      { name: "Água", quantity: 10 },
      { name: "Fertilizante", quantity: 5 },
      { name: "Composto", quantity: 3 },
    ],
    plantables: {
      seeds: [
        { name: "Sementes de Abóbora", quantity: 8 },
        { name: "Sementes de Tomate", quantity: 12 },
        { name: "Sementes de Milho", quantity: 15 },
        { name: "Sementes de Alface", quantity: 20 },
      ],
      seedlings: [
        { name: "Mudas de Cenoura", quantity: 5 },
        { name: "Mudas de Batata", quantity: 7 },
        { name: "Mudas de Couve", quantity: 4 },
      ],
      cuttings: [
        { name: "Estacas de Mandioca", quantity: 6 },
        { name: "Estacas de Hortelã", quantity: 3 },
        { name: "Estacas de Alecrim", quantity: 2 },
      ],
    },
  }

  return (
    <div className="h-full flex flex-col font-handwritten">
      {/* Cabeçalho com título e abas principais */}
      <div className="flex bg-olive-200 items-center">
        {/* Título */}
        <div className="w-1/3 p-2 text-center">
          <h2 className="font-bold uppercase text-base text-olive-900">Inventário</h2>
        </div>

        {/* Abas principais */}
        <div className="w-2/3 flex">
          <button
            className={`flex-1 p-2 ${activeTab === "tools" ? "bg-olive-600 text-white" : "bg-olive-300 text-olive-800"}`}
            onClick={() => onTabChange("tools")}
          >
            <div className="flex justify-center">
              <Shovel className="h-6 w-6" />
            </div>
          </button>
          <button
            className={`flex-1 p-2 ${activeTab === "inputs" ? "bg-olive-600 text-white" : "bg-olive-300 text-olive-800"}`}
            onClick={() => onTabChange("inputs")}
          >
            <div className="flex justify-center">
              <Droplet className="h-6 w-6" />
            </div>
          </button>
          <button
            className={`flex-1 p-2 ${activeTab === "plantables" ? "bg-olive-600 text-white" : "bg-olive-300 text-olive-800"}`}
            onClick={() => onTabChange("plantables")}
          >
            <div className="flex justify-center">
              <Seedling className="h-6 w-6" />
            </div>
          </button>
          <button
            className="flex-1 p-2 bg-olive-100 text-olive-800 hover:bg-olive-200 relative cursor-not-allowed opacity-80"
            disabled={true}
            title="Inauguração da loja em breve"
          >
            <div className="flex justify-center">
              <div className="bg-olive-500 rounded-full p-1.5 border-2 border-olive-300 shadow-sm relative group">
                <Store className="h-4 w-4 text-white" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-olive-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 w-40 text-center hidden group-hover:block">
                  Inauguração da loja em breve
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-olive-800"></div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Sub-abas para plantáveis */}
      {activeTab === "plantables" && (
        <div className="flex bg-olive-100">
          <button
            className={`flex-1 py-2 text-center ${activeSubTab === "seeds" ? "bg-olive-600 text-white" : ""}`}
            onClick={() => setActiveSubTab("seeds")}
          >
            <span className="text-sm">Sementes</span>
          </button>
          <button
            className={`flex-1 py-2 text-center ${activeSubTab === "seedlings" ? "bg-olive-600 text-white" : ""}`}
            onClick={() => setActiveSubTab("seedlings")}
          >
            <span className="text-sm">Mudas</span>
          </button>
          <button
            className={`flex-1 py-2 text-center ${activeSubTab === "cuttings" ? "bg-olive-600 text-white" : ""}`}
            onClick={() => setActiveSubTab("cuttings")}
          >
            <span className="text-sm">Estacas</span>
          </button>
        </div>
      )}

      {/* Lista de itens */}
      <div className="bg-paper-100 flex-grow p-2 overflow-y-auto">
        <ul className="space-y-1">
          {activeTab === "plantables"
            ? inventoryItems.plantables[activeSubTab].map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-paper-200 rounded-md hover:bg-paper-300 transition-colors cursor-pointer border border-olive-300"
                >
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="bg-olive-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    {item.quantity}
                  </span>
                </li>
              ))
            : inventoryItems[activeTab].map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-paper-200 rounded-md hover:bg-paper-300 transition-colors cursor-pointer border border-olive-300"
                >
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="bg-olive-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    {item.quantity}
                  </span>
                </li>
              ))}
        </ul>
      </div>
    </div>
  )
}
