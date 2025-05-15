"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Player } from "@/types/api"
import { apiService } from "@/services/api"
import { useAuth } from "@/components/auth/auth-context"

interface PlayerContextType {
  currentPlayerId: string | null
  currentPlayer: Player | null
  setCurrentPlayerId: (id: string | null) => void
  setCurrentPlayer: (player: Player | null) => void
  loadPlayer: (id: string) => Promise<Player | null>
  isLoading: boolean
  error: Error | null
}

const PlayerContext = createContext<PlayerContextType>({
  currentPlayerId: null,
  currentPlayer: null,
  setCurrentPlayerId: () => {},
  setCurrentPlayer: () => {},
  loadPlayer: async () => null,
  isLoading: false,
  error: null,
})

export const usePlayerContext = () => useContext(PlayerContext)

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)

  // Carregar o ID do jogador do localStorage ao iniciar
  useEffect(() => {
    const storedPlayerId = localStorage.getItem("currentPlayerId")
    if (storedPlayerId) {
      setCurrentPlayerId(storedPlayerId)
    }
  }, [])

  // Salvar o ID do jogador no localStorage quando mudar
  useEffect(() => {
    if (currentPlayerId) {
      localStorage.setItem("currentPlayerId", currentPlayerId)
    } else {
      localStorage.removeItem("currentPlayerId")
    }
  }, [currentPlayerId])

  // Função para carregar os dados do jogador da API
  const loadPlayer = async (id: string): Promise<Player | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const player = await apiService.get<Player>(`/players/${id}`)
      setCurrentPlayer(player)
      return player
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar os dados do jogador quando o ID mudar
  useEffect(() => {
    if (currentPlayerId) {
      loadPlayer(currentPlayerId)
    } else {
      setCurrentPlayer(null)
    }
  }, [currentPlayerId])

  // Tentar carregar o jogador associado ao usuário atual
  useEffect(() => {
    const loadPlayerFromUser = async () => {
      if (!user || currentPlayerId) return

      setIsLoading(true)
      try {
        // Buscar jogador associado ao usuário atual
        const players = await apiService.get<Player[]>(`/players/user/${user.id}`)
        if (players && players.length > 0) {
          setCurrentPlayerId(players[0].id)
        }
      } catch (err) {
        console.error("Erro ao carregar jogador do usuário:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadPlayerFromUser()
  }, [user, currentPlayerId])

  return (
    <PlayerContext.Provider
      value={{
        currentPlayerId,
        currentPlayer,
        setCurrentPlayerId,
        setCurrentPlayer,
        loadPlayer,
        isLoading,
        error,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}
