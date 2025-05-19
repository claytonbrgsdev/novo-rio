import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { Input, InputType, ApiResponse, PaginatedResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"

export function useInputs() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const inputsQuery = useQuery<PaginatedResponse<Input>>(
    ["inputs", currentPlayerId],
    () => apiService.get<PaginatedResponse<Input>>(`/inputs?player_id=${currentPlayerId}`),
    {
      enabled: !!currentPlayerId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  )

  const inputTypesQuery = useQuery<PaginatedResponse<InputType>>(
    ["inputTypes"],
    () => apiService.get<PaginatedResponse<InputType>>("/input-types"),
    {
      staleTime: 1000 * 60 * 60, // 1 hora
    },
  )

  const buyInputMutation = useMutation<ApiResponse<Input>, Error, { inputTypeId: string; quantity: number }>(
    ({ inputTypeId, quantity }) =>
      apiService.post<ApiResponse<Input>>("/inputs/buy", {
        player_id: currentPlayerId,
        input_type_id: inputTypeId,
        quantity,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inputs", currentPlayerId])
        // Também invalidar a query do jogador para atualizar as moedas
        queryClient.invalidateQueries(["player", currentPlayerId])
      },
    },
  )

  const useInputMutation = useMutation<
    ApiResponse<any>,
    Error,
    { inputId: string; targetId: string; quantity: number }
  >(
    ({ inputId, targetId, quantity }) =>
      apiService.post<ApiResponse<any>>(`/inputs/${inputId}/use`, {
        target_id: targetId,
        quantity,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["inputs", currentPlayerId])
        // Também invalidar outras queries que podem ser afetadas
        queryClient.invalidateQueries(["plantings"])
      },
    },
  )

  return {
    inputs: inputsQuery.data?.items || [],
    inputTypes: inputTypesQuery.data?.items || [],
    isLoading: inputsQuery.isLoading || inputTypesQuery.isLoading,
    isError: inputsQuery.isError || inputTypesQuery.isError,
    error: inputsQuery.error || inputTypesQuery.error,
    buyInput: buyInputMutation.mutate,
    useInput: useInputMutation.mutate,
    isBuying: buyInputMutation.isLoading,
    isUsing: useInputMutation.isLoading,
  }
}
