import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { Quadrant, ApiResponse, PaginatedResponse } from "@/types/api"

export function useQuadrants(terrainId: string, quadrantId?: string) {
  const queryClient = useQueryClient()

  const quadrantsQuery = useQuery<PaginatedResponse<Quadrant>>(
    ["quadrants", terrainId],
    () => apiService.get<PaginatedResponse<Quadrant>>(`/quadrants?terrain_id=${terrainId}`),
    {
      enabled: !!terrainId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  )

  const quadrantQuery = useQuery<Quadrant>(
    ["quadrant", quadrantId],
    () => apiService.get<Quadrant>(`/quadrants/${quadrantId}`),
    {
      enabled: !!quadrantId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  )

  const updateQuadrantMutation = useMutation<ApiResponse<Quadrant>, Error, { id: string; data: Partial<Quadrant> }>(
    ({ id, data }) => apiService.patch<ApiResponse<Quadrant>>(`/quadrants/${id}`, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["quadrants", terrainId])
        queryClient.invalidateQueries(["quadrant", variables.id])
      },
    },
  )

  return {
    quadrants: quadrantsQuery.data?.items || [],
    isLoading: quadrantsQuery.isLoading,
    isError: quadrantsQuery.isError,
    error: quadrantsQuery.error,
    quadrant: quadrantQuery.data,
    quadrantIsLoading: quadrantQuery.isLoading,
    quadrantIsError: quadrantQuery.isError,
    quadrantError: quadrantQuery.error,
    updateQuadrant: updateQuadrantMutation.mutate,
    isUpdating: updateQuadrantMutation.isLoading,
  }
}
