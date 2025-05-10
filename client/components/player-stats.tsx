"use client"

import { Coins, Zap } from "lucide-react"

export default function PlayerStats() {
  // Mock data for player stats
  const playerStats = {
    name: "PLAYER 04",
    money: 1250,
    aura: 75,
  }

  return (
    <div className="h-full flex flex-col bg-paper-300 font-handwritten">
      {/* Player name at the top */}
      <div className="text-center py-2">
        <h2 className="font-bold text-olive-900 text-2xl">{playerStats.name}</h2>
      </div>

      {/* Balance and Aura in a row */}
      <div className="flex justify-between px-2">
        <div className="bg-olive-200 px-3 py-1 rounded-md flex items-center gap-2 border border-olive-400">
          <Coins className="h-5 w-5 text-olive-800" />
          <span className="font-medium text-olive-800">BALANCE</span>
        </div>

        <div className="bg-olive-200 px-3 py-1 rounded-md flex items-center gap-2 border border-olive-400">
          <Zap className="h-5 w-5 text-olive-800" />
          <span className="font-medium text-olive-800">AURA</span>
        </div>
      </div>
    </div>
  )
}
