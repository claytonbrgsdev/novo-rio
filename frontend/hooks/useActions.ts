"use client"

import { useQuery, useMutation, useQueryClient } from "react-query"
import { apiService } from "@/services/api"
import type { ApiResponse } from "@/types/api"
import { usePlayerContext } from "@/context/PlayerContext"

interface ActionParams {
  action_name: string;
  quadrant_id?: string;
  terrain_id?: string;
  tool_key?: string;
  planting_id?: string;
  slot_index?: number;
  [key: string]: any;
}

export function useActions() {
  const { currentPlayerId } = usePlayerContext()
  const queryClient = useQueryClient()

  const performActionMutation = useMutation<ApiResponse<any>, Error, ActionParams>(
    (actionParams) => apiService.post<ApiResponse<any>>("/actions", {
      player_id: currentPlayerId,
      ...actionParams
    }),
    {
      onSuccess: () => {
        // Invalidate relevant queries that might be affected by the action
        queryClient.invalidateQueries(["terrains", currentPlayerId])
        queryClient.invalidateQueries(["quadrants"])
        queryClient.invalidateQueries(["plantings"])
        queryClient.invalidateQueries(["player", currentPlayerId])
      },
    }
  )

  return {
    performAction: performActionMutation.mutate,
    isPerforming: performActionMutation.isLoading,
    actionError: performActionMutation.error,
    isActionError: performActionMutation.isError,
    reset: performActionMutation.reset
  }
}
