"use client"
import { useRouter } from "next/navigation"
import type { ViewType } from "@/lib/types"
import CharacterDisplay from "./character-display"

interface CharacterPanelProps {
  currentView: ViewType
  onViewChange: (view: ViewType) => void
}

export default function CharacterPanel({ currentView, onViewChange }: CharacterPanelProps) {
  const router = useRouter()

  return (
    <div className="h-full flex flex-col bg-paper-200 font-handwritten">
      <div className="flex-grow bg-paper-100 m-2 flex items-center justify-center relative border-2 border-olive-300 rounded-md">
        {/* Removida a palavra "PERSONAGEM" */}

        {/* Character display - agora muito maior */}
        <div className="relative scale-150 transform">
          <CharacterDisplay size="large" showTool={false} />
        </div>

        {/* Tool info at the bottom right - texto simplificado */}
        <div className="absolute bottom-2 right-2 bg-olive-200 px-3 py-1 rounded-md text-center border border-olive-400">
          <div className="text-xs font-bold text-olive-900">Pá</div>
          <div className="text-xs font-bold text-olive-900">Durabilidade: ∞</div>
        </div>
      </div>
    </div>
  )
}
