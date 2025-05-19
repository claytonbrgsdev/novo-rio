import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import { usePlayerContext } from "@/context/PlayerContext"

// Define types if they're not exported from @/types/api
interface InventoryItem {
  id: string;
  player_id: string;
  item_type: string;
  item_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Add other fields as needed
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  // Add other pagination fields as needed
}

export function useInventory(itemType?: "seed" | "seedling" | "cutting" | "harvest" | "tool" | "input") {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const inventoryQuery = useQuery({
    queryKey: ["inventory", currentPlayerId, itemType],
    queryFn: async () => {
      let url = `/inventory?player_id=${currentPlayerId}`
      if (itemType) {
        url += `&item_type=${itemType}`
      }
      return apiService.get<PaginatedResponse<InventoryItem>>(url)
    },
    enabled: !!currentPlayerId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const useItemMutation = useMutation({
    mutationFn: ({ inventoryItemId, targetId, quantity }: { inventoryItemId: string; targetId?: string; quantity?: number }) =>
      apiService.post<ApiResponse<any>>(`/inventory/${inventoryItemId}/use`, {
        target_id: targetId,
        quantity: quantity || 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", currentPlayerId] })
      // Também invalidar outras queries que podem ser afetadas
      queryClient.invalidateQueries({ queryKey: ["plantings"] })
    },
  })

  const sellItemMutation = useMutation({
    mutationFn: ({ inventoryItemId, quantity }: { inventoryItemId: string; quantity: number }) =>
      apiService.post<ApiResponse<any>>(`/inventory/${inventoryItemId}/sell`, {
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory", currentPlayerId] })
      // Também invalidar a query do jogador para atualizar as moedas
      queryClient.invalidateQueries({ queryKey: ["player", currentPlayerId] })
    },
  })

  return {
    inventoryItems: inventoryQuery.data?.items || [],
    isLoading: inventoryQuery.isLoading,
    isError: inventoryQuery.isError,
    error: inventoryQuery.error,
    useItem: useItemMutation.mutate,
    sellItem: sellItemMutation.mutate,
    isUsing: useItemMutation.isPending,
    isSelling: sellItemMutation.isPending,
  }
}
