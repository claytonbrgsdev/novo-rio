"use client"

import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { Terrain, ApiResponse, PaginatedResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"
import { useCallback, useMemo } from "react"

export function useTerrains() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const terrainsQuery = useQuery<PaginatedResponse<Terrain>>(
    ["terrains", currentPlayerId],
    () => apiService.get<PaginatedResponse<Terrain>>(`/terrains?player_id=${currentPlayerId}`),
    {
      enabled: !!currentPlayerId,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  )

  const terrainQueries = useMemo(() => {
    return new Map<string, any>()
  }, [])

  const getTerrainById = useCallback(
    (terrainId: string) => {
      if (!terrainQueries.has(terrainId)) {
        terrainQueries.set(
          terrainId,
          useQuery<Terrain>(["terrain", terrainId], () => apiService.get<Terrain>(`/terrains/${terrainId}`), {
            enabled: !!terrainId,
            staleTime: 1000 * 60 * 5, // 5 minutos
          }),
        )
      }

      return queryClient.getQueryData(["terrain", terrainId]) || terrainQueries.get(terrainId)?.data
    },
    [queryClient, terrainQueries],
  )

  const createTerrainMutation = useMutation<ApiResponse<Terrain>, Error, Partial<Terrain>>(
    (terrainData) => apiService.post<ApiResponse<Terrain>>("/terrains", terrainData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["terrains", currentPlayerId])
      },
    },
  )

  const updateTerrainMutation = useMutation<ApiResponse<Terrain>, Error, { id: string; data: Partial<Terrain> }>(
    ({ id, data }) => apiService.patch<ApiResponse<Terrain>>(`/terrains/${id}`, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["terrains", currentPlayerId])
        queryClient.invalidateQueries(["terrain", variables.id])
      },
    },
  )

  return {
    terrains: terrainsQuery.data?.items || [],
    isLoading: terrainsQuery.isLoading,
    isError: terrainsQuery.isError,
    error: terrainsQuery.error,
    getTerrainById,
    createTerrain: createTerrainMutation.mutate,
    updateTerrain: updateTerrainMutation.mutate,
    isCreating: createTerrainMutation.isLoading,
    isUpdating: updateTerrainMutation.isLoading,
  }
}
