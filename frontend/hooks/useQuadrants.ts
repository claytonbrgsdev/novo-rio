import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { Quadrant, ApiResponse, PaginatedResponse } from "@/types/api"

export function useQuadrants(terrainId: string, quadrantId?: string) {
  const queryClient = useQueryClient()

  const quadrantsQuery = useQuery({
    queryKey: ["quadrants", terrainId],
    queryFn: () => apiService.get<PaginatedResponse<Quadrant>>(`/quadrants?terrain_id=${terrainId}`),
    enabled: !!terrainId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const quadrantQuery = useQuery({
    queryKey: ["quadrant", quadrantId],
    queryFn: () => apiService.get<Quadrant>(`/quadrants/${quadrantId}`),
    enabled: !!quadrantId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const updateQuadrantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Quadrant> }) => 
      apiService.patch<ApiResponse<Quadrant>>(`/quadrants/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["quadrants", terrainId] })
      queryClient.invalidateQueries({ queryKey: ["quadrant", variables.id] })
    },
  })

  return {
    quadrants: quadrantsQuery.data?.items || [],
    isLoading: quadrantsQuery.isPending,
    isError: quadrantsQuery.isError,
    error: quadrantsQuery.error,
    quadrant: quadrantQuery.data,
    quadrantIsLoading: quadrantQuery.isPending,
    quadrantIsError: quadrantQuery.isError,
    quadrantError: quadrantQuery.error,
    updateQuadrant: updateQuadrantMutation.mutate,
    isUpdating: updateQuadrantMutation.isPending,
  }
}
