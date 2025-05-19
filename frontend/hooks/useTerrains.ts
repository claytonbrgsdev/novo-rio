"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { Terrain, ApiResponse, PaginatedResponse } from "@/types/api.d"
import { usePlayerContext } from "@/context/PlayerContext"
import { useCallback, useMemo } from "react"

export function useTerrains() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const terrainsQuery = useQuery({
    queryKey: ["terrains", currentPlayerId],
    queryFn: () => apiService.get<PaginatedResponse<Terrain>>(`/terrains?player_id=${currentPlayerId}`),
    enabled: !!currentPlayerId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const terrainQueries = useMemo(() => {
    return new Map<string, any>()
  }, [])

  const getTerrainById = useCallback(
    (terrainId: string) => {
      if (!terrainQueries.has(terrainId)) {
        terrainQueries.set(
          terrainId,
          useQuery({
            queryKey: ["terrain", terrainId],
            queryFn: () => apiService.get<Terrain>(`/terrains/${terrainId}`),
            enabled: !!terrainId,
            staleTime: 1000 * 60 * 5, // 5 minutos
          }),
        )
      }

      return queryClient.getQueryData(["terrain", terrainId]) || terrainQueries.get(terrainId)?.data
    },
    [queryClient, terrainQueries],
  )

  // Maximum number of terrains allowed per player
  const MAX_TERRAINS = 15
  
  const createTerrainMutation = useMutation({
    mutationFn: (terrainData: Partial<Terrain>) => {
      // Check if max terrains limit has been reached
      const currentTerrains = queryClient.getQueryData<PaginatedResponse<Terrain>>(["terrains", currentPlayerId])
      
      if (currentTerrains && currentTerrains.items && currentTerrains.items.length >= MAX_TERRAINS) {
        return Promise.reject(new Error(`Limite máximo de ${MAX_TERRAINS} terrenos atingido.`))
      }
      
      return apiService.post<ApiResponse<Terrain>>("/terrains", terrainData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["terrains", currentPlayerId] })
    },
  })

  const updateTerrainMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Terrain> }) => 
      apiService.patch<ApiResponse<Terrain>>(`/terrains/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["terrains", currentPlayerId] })
      queryClient.invalidateQueries({ queryKey: ["terrain", variables.id] })
    },
  })

  return {
    terrains: terrainsQuery.data?.items || [],
    isLoading: terrainsQuery.isLoading,
    isError: terrainsQuery.isError,
    error: terrainsQuery.error,
    getTerrainById,
    createTerrain: createTerrainMutation.mutate,
    updateTerrain: updateTerrainMutation.mutate,
    isCreating: createTerrainMutation.isPending,
    isUpdating: updateTerrainMutation.isPending,
  }
}
