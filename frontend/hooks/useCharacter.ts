"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { CharacterCustomization } from "@/types/game" // Import from our new types
import { useAuth } from "@/components/auth/auth-context"

// Define API response type if it doesn't exist elsewhere
interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export function useCharacter() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const characterQuery = useQuery({
    queryKey: ["character", user?.id],
    queryFn: () => apiService.get<CharacterCustomization[]>(`/players/${user?.id}/characters`),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const createCharacterMutation = useMutation({
    mutationFn: (characterData: Omit<CharacterCustomization, "id" | "created_at" | "updated_at">) => 
      apiService.post<CharacterCustomization>(`/players/${user?.id}/characters`, characterData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character", user?.id] })
    },
  })

  const updateCharacterMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CharacterCustomization> }) => 
      apiService.put<CharacterCustomization>(`/players/${user?.id}/characters/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character", user?.id] })
    },
  })

  return {
    character: characterQuery.data?.[0] || null,
    characters: characterQuery.data || [],
    isLoading: characterQuery.isPending,
    isError: characterQuery.isError,
    error: characterQuery.error,
    createCharacter: createCharacterMutation.mutate,
    updateCharacter: updateCharacterMutation.mutate,
    isCreating: createCharacterMutation.isPending,
    isUpdating: updateCharacterMutation.isPending,
  }
}
