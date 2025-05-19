"use client"

import { usePlayer } from "@/hooks/usePlayer"
import { useCharacter } from "@/hooks/useCharacter"

export default function PlayerStats() {
  const { player, isLoading: playerLoading } = usePlayer()
  const { character, isLoading: characterLoading } = useCharacter()

  const isLoading = playerLoading || characterLoading

  return (
    <div className="h-full flex flex-col bg-paper-200 font-handwritten">
      {/* Player name at the top */}
      <div className="text-center py-2">
        <h2 className="font-bold text-olive-900 text-2xl">
          {!isLoading ? (character?.name || "Josué") : (
            <div className="h-8 bg-amber-100 rounded animate-pulse w-32 mx-auto"></div>
          )}
        </h2>
      </div>
    </div>
  )
}
