import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { InventoryItem, ApiResponse, PaginatedResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"

export function useInventory(itemType?: "seed" | "seedling" | "cutting" | "harvest" | "tool" | "input") {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const inventoryQuery = useQuery<PaginatedResponse<InventoryItem>>(
    ["inventory", currentPlayerId, itemType],
    () => {
      let url = `/inventory?player_id=${currentPlayerId}`
      if (itemType) {
        url += `&item_type=${itemType}`
      }
      return apiService.get<PaginatedResponse<InventoryItem>>(url)
    },
    {
      enabled: !!currentPlayerId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  )

  const useItemMutation = useMutation<
    ApiResponse<any>,
    Error,
    { inventoryItemId: string; targetId?: string; quantity?: number }
  >(
    ({ inventoryItemId, targetId, quantity }) =>
      apiService.post<ApiResponse<any>>(`/inventory/${inventoryItemId}/use`, {
        target_id: targetId,
        quantity: quantity || 1,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inventory", currentPlayerId])
        // Também invalidar outras queries que podem ser afetadas
        queryClient.invalidateQueries(["plantings"])
      },
    },
  )

  const sellItemMutation = useMutation<ApiResponse<any>, Error, { inventoryItemId: string; quantity: number }>(
    ({ inventoryItemId, quantity }) =>
      apiService.post<ApiResponse<any>>(`/inventory/${inventoryItemId}/sell`, {
        quantity,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inventory", currentPlayerId])
        // Também invalidar a query do jogador para atualizar as moedas
        queryClient.invalidateQueries(["player", currentPlayerId])
      },
    },
  )

  return {
    inventoryItems: inventoryQuery.data?.items || [],
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    error: inventoryQuery.error,
    useItem: useItemMutation.mutate,
    sellItem: sellItemMutation.mutate,
    isUsing: useItemMutation.isLoading,
    isSelling: sellItemMutation.isLoading,
  }
}
