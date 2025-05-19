import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { Player, ApiResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"

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
        // setCurrentPlayer(data);
      },
    },
  )

  const updatePlayerMutation = useMutation<ApiResponse<Player>, Error, Partial<Player>>(
    (playerData) => apiService.patch<ApiResponse<Player>>(`/players/${currentPlayerId}`, playerData),
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
