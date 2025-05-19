import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { Planting, ApiResponse, PlantingActionRequest } from "@/types/api"

export function usePlantings(slotId?: string) {
  const queryClient = useQueryClient()

  const plantingQuery = useQuery<Planting>(
    ["planting", slotId],
    () => apiService.get<Planting>(`/plantings/slot/${slotId}`),
    {
      enabled: !!slotId,
      staleTime: 1000 * 60, // 1 minuto
    },
  )

  const createPlantingMutation = useMutation<ApiResponse<Planting>, Error, { slotId: string; plantId: string }>(
    ({ slotId, plantId }) =>
      apiService.post<ApiResponse<Planting>>("/plantings", {
        slot_id: slotId,
        plant_id: plantId,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["planting", slotId])
      },
    },
  )

  const performActionMutation = useMutation<ApiResponse<Planting>, Error, PlantingActionRequest>(
    (actionData) => apiService.post<ApiResponse<Planting>>("/plantings/action", actionData),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["planting", slotId])
      },
    },
  )

  return {
    planting: plantingQuery.data,
    isLoading: plantingQuery.isLoading,
    isError: plantingQuery.isError,
    error: plantingQuery.error,
    createPlanting: createPlantingMutation.mutate,
    performAction: performActionMutation.mutate,
    isCreating: createPlantingMutation.isLoading,
    isPerformingAction: performActionMutation.isLoading,
  }
}
