import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { Tool, ToolType, ApiResponse, PaginatedResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"

export function useTools() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const toolsQuery = useQuery<PaginatedResponse<Tool>>(
    ["tools", currentPlayerId],
    () => apiService.get<PaginatedResponse<Tool>>(`/tools?player_id=${currentPlayerId}`),
    {
      enabled: !!currentPlayerId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  )

  const toolTypesQuery = useQuery<PaginatedResponse<ToolType>>(
    ["toolTypes"],
    () => apiService.get<PaginatedResponse<ToolType>>("/tool-types"),
    {
      staleTime: 1000 * 60 * 60, // 1 hora
    },
  )

  const buyToolMutation = useMutation<ApiResponse<Tool>, Error, { toolTypeId: string }>(
    ({ toolTypeId }) =>
      apiService.post<ApiResponse<Tool>>("/tools/buy", {
        player_id: currentPlayerId,
        tool_type_id: toolTypeId,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["tools", currentPlayerId])
        // Também invalidar a query do jogador para atualizar as moedas
        queryClient.invalidateQueries(["player", currentPlayerId])
      },
    },
  )

  const repairToolMutation = useMutation<ApiResponse<Tool>, Error, { toolId: string }>(
    ({ toolId }) => apiService.post<ApiResponse<Tool>>(`/tools/${toolId}/repair`),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["tools", currentPlayerId])
        // Também invalidar a query do jogador para atualizar as moedas
        queryClient.invalidateQueries(["player", currentPlayerId])
      },
    },
  )

  return {
    tools: toolsQuery.data?.items || [],
    toolTypes: toolTypesQuery.data?.items || [],
    isLoading: toolsQuery.isLoading || toolTypesQuery.isLoading,
    isError: toolsQuery.isError || toolTypesQuery.isError,
    error: toolsQuery.error || toolTypesQuery.error,
    buyTool: buyToolMutation.mutate,
    repairTool: repairToolMutation.mutate,
    isBuying: buyToolMutation.isLoading,
    isRepairing: repairToolMutation.isLoading,
  }
}
