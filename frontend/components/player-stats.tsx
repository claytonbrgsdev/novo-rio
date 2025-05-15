"use client"

import { Coins, Zap } from "lucide-react"
import { usePlayer } from "@/hooks/usePlayer"
import { useCharacter } from "@/hooks/useCharacter"

export default function PlayerStats() {
  const { player, isLoading: playerLoading } = usePlayer()
  const { character, isLoading: characterLoading } = useCharacter()

  const isLoading = playerLoading || characterLoading

  return (
    <div className="h-full flex flex-col bg-paper-300 font-handwritten">
      {/* Player name at the top */}
      <div className="text-center py-2">
        <h2 className="font-bold text-olive-900 text-2xl">
          {isLoading ? "Carregando..." : character?.name || "Jogador"}
        </h2>
      </div>

      {/* Balance and Aura in a row */}
      <div className="flex justify-between px-2">
        <div className="bg-olive-200 px-3 py-1 rounded-md flex items-center gap-2 border border-olive-400">
          <Coins className="h-5 w-5 text-olive-800" />
          <span className="font-medium text-olive-800">{isLoading ? "..." : player?.coins || 0}</span>
        </div>

        <div className="bg-olive-200 px-3 py-1 rounded-md flex items-center gap-2 border border-olive-400">
          <Zap className="h-5 w-5 text-olive-800" />
          <span className="font-medium text-olive-800">{isLoading ? "..." : player?.aura || 0}</span>
        </div>
      </div>
    </div>
  )
}
