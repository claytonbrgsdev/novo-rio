import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { components, operations } from "@/types/api"

// Define types based on the generated OpenAPI schema
type PlantingSchema = components["schemas"]["PlantingSchema"]
type PlantingCreate = components["schemas"]["PlantingCreate"]
type PlantingUpdate = components["schemas"]["PlantingUpdate"]
type PlantingActionParams = {
  action: string;
  planting_id: string;
}

interface PlantingsFilterParams {
  quadrant_id?: string;
  slot_index?: number;
  species_id?: string;
}

export function usePlantings(filterParams?: PlantingsFilterParams) {
  const queryClient = useQueryClient()

  // Query para buscar plantações
  const query = useQuery({
    queryKey: ["plantings", filterParams],
    queryFn: async () => {
      const queryParams = new URLSearchParams()
      if (filterParams?.quadrant_id) queryParams.append("quadrant_id", filterParams.quadrant_id)
      if (filterParams?.slot_index !== undefined) queryParams.append("slot_index", filterParams.slot_index.toString())
      if (filterParams?.species_id) queryParams.append("species_id", filterParams.species_id)

      return apiService.get<PlantingSchema[]>(`/plantings?${queryParams.toString()}`)
    }
  })

  // Mutation para criar nova plantação
  const createMutation = useMutation({
    mutationFn: (plantingData: PlantingCreate) => {
      return apiService.post<PlantingSchema>(`/plantings`, plantingData)
    },
    onSuccess: () => {
      // Invalidar a query para recarregar os dados
      queryClient.invalidateQueries({ queryKey: ["plantings"] })
    }
  })

  // Mutation para executar ações nas plantações (regar, colher, etc.)
  const actionMutation = useMutation({
    mutationFn: (actionData: PlantingActionParams) => {
      return apiService.post<PlantingSchema>(`/plantings/${actionData.planting_id}/actions`, { action: actionData.action })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plantings"] })
    }
  })

  return {
    plantings: query.data || [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    create: createMutation.mutate,
    createLoading: createMutation.isPending,
    createError: createMutation.error,
    performAction: actionMutation.mutate,
    actionLoading: actionMutation.isPending,
    actionError: actionMutation.error,
  }
}
