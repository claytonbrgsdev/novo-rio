import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { Tool, ToolType, ApiResponse, PaginatedResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"

export function useTools() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const toolsQuery = useQuery({
    queryKey: ["tools", currentPlayerId],
    queryFn: () => apiService.get<PaginatedResponse<Tool>>(`/tools?player_id=${currentPlayerId}`),
    enabled: !!currentPlayerId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const toolTypesQuery = useQuery({
    queryKey: ["toolTypes"],
    queryFn: () => apiService.get<PaginatedResponse<ToolType>>("/tool-types"),
    staleTime: 1000 * 60 * 60, // 1 hora
  })

  const buyToolMutation = useMutation({
    mutationFn: ({ toolTypeId }: { toolTypeId: string }) =>
      apiService.post<ApiResponse<Tool>>("/tools/buy", {
        player_id: currentPlayerId,
        tool_type_id: toolTypeId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools", currentPlayerId] })
      // Também invalidar a query do jogador para atualizar as moedas
      queryClient.invalidateQueries({ queryKey: ["player", currentPlayerId] })
    },
  })

  const repairToolMutation = useMutation({
    mutationFn: ({ toolId }: { toolId: string }) => apiService.post<ApiResponse<Tool>>(`/tools/${toolId}/repair`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tools", currentPlayerId] })
      // Também invalidar a query do jogador para atualizar as moedas
      queryClient.invalidateQueries({ queryKey: ["player", currentPlayerId] })
    },
  })

  return {
    tools: toolsQuery.data?.items || [],
    toolTypes: toolTypesQuery.data?.items || [],
    isLoading: toolsQuery.isPending || toolTypesQuery.isPending,
    isError: toolsQuery.isError || toolTypesQuery.isError,
    error: toolsQuery.error || toolTypesQuery.error,
    buyTool: buyToolMutation.mutate,
    repairTool: repairToolMutation.mutate,
    isBuying: buyToolMutation.isPending,
    isRepairing: repairToolMutation.isPending,
  }
}
