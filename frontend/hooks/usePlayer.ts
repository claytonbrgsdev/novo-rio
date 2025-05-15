import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import { usePlayerContext } from "@/context/PlayerContext"
import type { components, operations } from "@/types/api"

// Define types based on the generated OpenAPI schema
type Player = components["schemas"]["PlayerOut"]
type PlayerUpdate = components["schemas"]["PlayerUpdate"]

export function usePlayer() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const playerQuery = useQuery<Player>(
    ["player", currentPlayerId],
    () => apiService.get<Player>(`/players/${currentPlayerId}`),
    {
      enabled: !!currentPlayerId,
      staleTime: 1000 * 60 * 5, // 5 minutos
      onSuccess: (data) => {
        // Atualizar o contexto do jogador se necessário
      },
    },
  )

  const updatePlayerMutation = useMutation<Player, Error, Partial<PlayerUpdate>>(
    (playerData) => apiService.patch<Player>(`/players/${currentPlayerId}`, playerData),
    {
      onSuccess: () => {
        // Invalidar a query para recarregar os dados
        queryClient.invalidateQueries(["player", currentPlayerId])
      },
    },
  )

  return {
    player: playerQuery.data,
    isLoading: playerQuery.isLoading,
    isError: playerQuery.isError,
    error: playerQuery.error,
    updatePlayer: updatePlayerMutation.mutate,
    isUpdating: updatePlayerMutation.isLoading,
  }
}
