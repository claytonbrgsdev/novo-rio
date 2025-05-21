"use client"

import { Home, Grid, Maximize, Settings, Building } from "lucide-react"
import type { ViewType } from "@/lib/types"

interface ViewSwitchProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export default function ViewSwitch({ currentView, onViewChange }: ViewSwitchProps) {
  return (
    <div className="h-full bg-olive-200 flex items-center px-2 font-handwritten">
      <div className="flex items-center space-x-2">
        <button
          className={`w-12 h-12 ${currentView === "micro" ? "bg-olive-600 text-white" : "bg-olive-300 text-olive-800"} flex items-center justify-center rounded-md border border-olive-400 hover:bg-olive-500 hover:text-white transition-colors`}
          onClick={() => onViewChange("micro")}
          title="Quadrante de Terra"
        >
          <Maximize className="h-6 w-6" />
        </button>

        <button
          className={`w-12 h-12 ${currentView === "medium" ? "bg-olive-600 text-white" : "bg-olive-300 text-olive-800"} flex items-center justify-center rounded-md border border-olive-400 hover:bg-olive-500 hover:text-white transition-colors`}
          onClick={() => onViewChange("medium")}
          title="Terreno"
        >
          <Grid className="h-6 w-6" />
        </button>

        <button
          className={`w-12 h-12 ${currentView === "macro" ? "bg-olive-600 text-white" : "bg-olive-300 text-olive-800"} flex items-center justify-center rounded-md border border-olive-400 hover:bg-olive-500 hover:text-white transition-colors`}
          onClick={() => onViewChange("macro")}
          title="Região"
        >
          <Home className="h-6 w-6" />
        </button>

        <button
          className={`w-12 h-12 ${currentView === "village" ? "bg-olive-600 text-white" : "bg-olive-300 text-olive-800"} flex items-center justify-center rounded-md border border-olive-400 hover:bg-olive-500 hover:text-white transition-colors`}
          onClick={() => onViewChange("village")}
          title="Vila"
        >
          <Building className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-grow text-center font-bold text-olive-800 uppercase text-lg">
        {currentView === "micro" && "Quadrante de Terra"}
        {currentView === "macro" && "Região"}
        {currentView === "medium" && "Terreno"}
        {currentView === "village" && "Vila"}
      </div>

      <button
        className="w-12 h-12 bg-olive-300 text-olive-800 flex items-center justify-center rounded-md border border-olive-400 hover:bg-olive-500 hover:text-white transition-colors"
        onClick={() => {}}
        title="Configurações"
      >
        <Settings className="h-6 w-6" />
      </button>
    </div>
  )
}
