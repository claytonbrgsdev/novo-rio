"use client"
import { useRouter } from "next/navigation"
import type { ViewType } from "@/lib/types"

interface CharacterPanelProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export default function CharacterPanel({ currentView, onViewChange }: CharacterPanelProps) {
  const router = useRouter()

  // Mock data for the current tool
  const currentTool = {
    name: "Pá",
    health: 85,
  }

  return (
    <div className="h-full flex flex-col bg-paper-200 font-handwritten">
      <div className="flex-grow bg-paper-100 m-2 flex items-center justify-center relative border-2 border-olive-300 rounded-md">
        <div className="text-center text-xl font-bold text-olive-800">PERSONAGEM</div>

        {/* Character placeholder - would be replaced with actual character rendering */}
        <div className="relative">
          {/* Cabeça */}
          <div className="w-24 h-24 bg-amber-100 rounded-md flex items-center justify-center border-2 border-olive-400">
            <div className="w-3 h-3 bg-stone-800 rounded-full absolute top-9 left-8"></div>
            <div className="w-3 h-3 bg-stone-800 rounded-full absolute top-9 right-8"></div>
            <div className="w-6 h-1.5 bg-stone-800 rounded-full absolute top-14 left-9"></div>
          </div>

          {/* Corpo */}
          <div className="w-32 h-40 bg-amber-100 mt-3 rounded-md flex items-center justify-center relative border-2 border-olive-400">
            <div className="absolute top-6 left-6 w-4 h-4 bg-stone-800 rounded-full"></div>
            <div className="absolute top-6 right-6 w-4 h-4 bg-stone-800 rounded-full"></div>
            <div className="absolute top-16 left-8 w-4 h-4 bg-stone-800 rounded-full"></div>
            <div className="absolute top-16 right-8 w-4 h-4 bg-stone-800 rounded-full"></div>
            <div className="absolute top-26 left-6 w-4 h-4 bg-stone-800 rounded-full"></div>
          </div>

          {/* Braços */}
          <div className="absolute top-32 left-0 w-6 h-20 bg-amber-100 rounded-full border-2 border-olive-400"></div>
          <div className="absolute top-32 right-0 w-6 h-20 bg-amber-100 rounded-full border-2 border-olive-400"></div>

          {/* Pernas */}
          <div className="absolute -bottom-12 left-6 w-8 h-12 bg-amber-100 rounded-full border-2 border-olive-400"></div>
          <div className="absolute -bottom-12 right-6 w-8 h-12 bg-amber-100 rounded-full border-2 border-olive-400"></div>
        </div>

        {/* Tool info at the bottom right */}
        <div className="absolute bottom-2 right-2 bg-olive-200 px-3 py-1 rounded-md text-center border border-olive-400">
          <div className="text-xs font-bold text-olive-900">NOME E SAÚDE DA</div>
          <div className="text-xs font-bold text-olive-900">FERRAMENTA</div>
        </div>
      </div>
    </div>
  )
}
