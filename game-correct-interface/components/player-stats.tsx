"use client"

import { Coins, Zap } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"
import { useState, useEffect } from "react"
import { loadCharacterCustomizations } from "@/lib/supabase"

export default function PlayerStats() {
  const [playerName, setPlayerName] = useState("PLAYER 04")
  const { user } = useAuth()

  // Mock data for player stats
  const playerStats = {
    money: 1250,
    aura: 75,
  }

  useEffect(() => {
    async function loadPlayerName() {
      if (!user) return

      try {
        const { data, error } = await loadCharacterCustomizations(user.id)

        if (error) throw error

        if (data && data.length > 0) {
          setPlayerName(data[0].name)
        } else {
          // Fallback para localStorage
          const savedChar = localStorage.getItem("character")
          if (savedChar) {
            const parsed = JSON.parse(savedChar)
            if (parsed.name) setPlayerName(parsed.name)
          }
        }
      } catch (err) {
        console.error("Erro ao carregar nome do personagem:", err)
        // Tentar fallback
        const savedChar = localStorage.getItem("character")
        if (savedChar) {
          try {
            const parsed = JSON.parse(savedChar)
            if (parsed.name) setPlayerName(parsed.name)
          } catch (e) {
            console.error("Erro ao parsear personagem do localStorage:", e)
          }
        }
      }
    }

    loadPlayerName()
  }, [user])

  return (
    <div className="h-full flex flex-col bg-paper-300 font-handwritten">
      {/* Player name at the top */}
      <div className="text-center py-2">
        <h2 className="font-bold text-olive-900 text-2xl">{playerName}</h2>
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
