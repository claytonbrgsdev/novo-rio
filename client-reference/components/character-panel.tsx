"use client"

import { Home, Grid, Maximize } from "lucide-react"
import type { ViewType } from "@/lib/types"

interface CharacterPanelProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export default function CharacterPanel({ currentView, onViewChange }: CharacterPanelProps) {
  return (
    <div className="bg-amber-800 p-3 flex flex-col items-center justify-between">
      <div className="w-full h-3/4 bg-amber-700 rounded-md flex items-center justify-center">
        <div className="relative">
          {/* Cabeça */}
          <div className="w-16 h-16 bg-amber-100 rounded-md flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-800 rounded-full absolute top-6 left-5"></div>
            <div className="w-2 h-2 bg-stone-800 rounded-full absolute top-6 right-5"></div>
            <div className="w-4 h-1 bg-stone-800 rounded-full absolute top-10 left-6"></div>
          </div>

          {/* Corpo */}
          <div className="w-20 h-24 bg-amber-100 mt-2 rounded-md flex items-center justify-center relative">
            <div className="absolute top-4 left-4 w-3 h-3 bg-stone-800 rounded-full"></div>
            <div className="absolute top-4 right-4 w-3 h-3 bg-stone-800 rounded-full"></div>
            <div className="absolute top-12 left-6 w-3 h-3 bg-stone-800 rounded-full"></div>
            <div className="absolute top-12 right-6 w-3 h-3 bg-stone-800 rounded-full"></div>
            <div className="absolute top-18 left-4 w-3 h-3 bg-stone-800 rounded-full"></div>
          </div>

          {/* Braços */}
          <div className="absolute top-20 left-0 w-4 h-12 bg-amber-100 rounded-full"></div>
          <div className="absolute top-20 right-0 w-4 h-12 bg-amber-100 rounded-full"></div>

          {/* Pernas */}
          <div className="absolute -bottom-8 left-4 w-5 h-8 bg-amber-100 rounded-full"></div>
          <div className="absolute -bottom-8 right-4 w-5 h-8 bg-amber-100 rounded-full"></div>
        </div>
      </div>

      <div className="flex justify-around w-full mt-2">
        <button
          className={`p-2 rounded-md ${currentView === "macro" ? "bg-amber-600" : "bg-amber-700 hover:bg-amber-600"}`}
          onClick={() => onViewChange("macro")}
        >
          <Home className="h-5 w-5 text-amber-100" />
        </button>
        <button
          className={`p-2 rounded-md ${currentView === "medium" ? "bg-amber-600" : "bg-amber-700 hover:bg-amber-600"}`}
          onClick={() => onViewChange("medium")}
        >
          <Grid className="h-5 w-5 text-amber-100" />
        </button>
        <button
          className={`p-2 rounded-md ${currentView === "micro" ? "bg-amber-600" : "bg-amber-700 hover:bg-amber-600"}`}
          onClick={() => onViewChange("micro")}
        >
          <Maximize className="h-5 w-5 text-amber-100" />
        </button>
      </div>
    </div>
  )
}
