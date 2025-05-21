import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { Input, InputType, ApiResponse, PaginatedResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"

export function useInputs() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const inputsQuery = useQuery({
    queryKey: ["inputs", currentPlayerId],
    queryFn: () => apiService.get<PaginatedResponse<Input>>(`/inputs?player_id=${currentPlayerId}`),
    enabled: !!currentPlayerId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const inputTypesQuery = useQuery({
    queryKey: ["inputTypes"],
    queryFn: () => apiService.get<PaginatedResponse<InputType>>("/input-types"),
    staleTime: 1000 * 60 * 60, // 1 hora
  })

  const buyInputMutation = useMutation({
    mutationFn: ({ inputTypeId, quantity }: { inputTypeId: string; quantity: number }) =>
      apiService.post<ApiResponse<Input>>("/inputs/buy", {
        player_id: currentPlayerId,
        input_type_id: inputTypeId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inputs", currentPlayerId] })
      // Também invalidar a query do jogador para atualizar as moedas
      queryClient.invalidateQueries({ queryKey: ["player", currentPlayerId] })
    },
  })

  const useInputMutation = useMutation({
    mutationFn: ({ inputId, targetId, quantity }: { inputId: string; targetId: string; quantity: number }) =>
      apiService.post<ApiResponse<any>>(`/inputs/${inputId}/use`, {
        target_id: targetId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inputs", currentPlayerId] })
      // Também invalidar outras queries que podem ser afetadas
      queryClient.invalidateQueries({ queryKey: ["plantings"] })
    },
  })

  return {
    inputs: inputsQuery.data?.items || [],
    inputTypes: inputTypesQuery.data?.items || [],
    isLoading: inputsQuery.isPending || inputTypesQuery.isPending,
    isError: inputsQuery.isError || inputTypesQuery.isError,
    error: inputsQuery.error || inputTypesQuery.error,
    buyInput: buyInputMutation.mutate,
    useInput: useInputMutation.mutate,
    isBuying: buyInputMutation.isPending,
    isUsing: useInputMutation.isPending,
  }
}
