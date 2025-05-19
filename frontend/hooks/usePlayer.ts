import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import { usePlayerContext } from "@/context/PlayerContext"
import type { components, operations } from "@/types/api"

// Define types based on the generated OpenAPI schema
type Player = components["schemas"]["PlayerOut"]
type PlayerUpdate = components["schemas"]["PlayerUpdate"]

export function usePlayer() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const playerQuery = useQuery({
    queryKey: ["player", currentPlayerId],
    queryFn: () => apiService.get<Player>(`/players/${currentPlayerId}`),
    enabled: !!currentPlayerId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const updatePlayerMutation = useMutation({
    mutationFn: (playerData: Partial<PlayerUpdate>) => apiService.patch<Player>(`/players/${currentPlayerId}`, playerData),
    onSuccess: () => {
      // Invalidar a query para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ["player", currentPlayerId] })
    },
  })

  return {
    player: playerQuery.data,
    isLoading: playerQuery.isPending,
    isError: playerQuery.isError,
    error: playerQuery.error,
    updatePlayer: updatePlayerMutation.mutate,
    isUpdating: updatePlayerMutation.isPending,
  }
}
