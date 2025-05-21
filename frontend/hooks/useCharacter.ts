"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { playerService } from "@/services/player"
import type { CharacterCustomization } from "@/types/game"
import { useAuth } from "@/components/auth/auth-context"
import { DEFAULT_HEAD, DEFAULT_BODY } from "@/constants/character"

export function useCharacter() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // Local state to hold character data for instant updates
  const [character, setCharacter] = useState<CharacterCustomization | null>(null)

  // Fetch character data
  const characterQuery = useQuery<CharacterCustomization | null>({
    queryKey: ["character", user?.id],
    queryFn: async (): Promise<CharacterCustomization | null> => {
      if (!user?.id) return null
      
      try {
        console.log('[useCharacter] Fetching character data...')
        const data = await playerService.getCharacters(user.id)
        console.log('[useCharacter] Raw response:', data)
        
        // If data is null or undefined, return null
        if (!data) {
          console.log('[useCharacter] No character data found')
          return null
        }
        
        // If data is an array (shouldn't happen with our updated service, but just in case)
        if (Array.isArray(data)) {
          const char = data.length > 0 ? data[0] : null
          console.log('[useCharacter] Processed array response:', char)
          return char
        }
        
        // If data is a single character object
        console.log('[useCharacter] Processed single character:', data)
        return data
      } catch (error) {
        console.error("Failed to fetch character:", error)
        throw error // Re-throw to let the error boundary handle it
      }
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Update local state when query data changes
  useEffect(() => {
    console.log('[useCharacter] Query data changed:', characterQuery.data)
    if (characterQuery.data) {
      setCharacter(characterQuery.data)
    } else {
      console.log('[useCharacter] No character data in query')
    }
  }, [characterQuery.data])

  // Create character mutation
  const createCharacterMutation = useMutation({
    mutationFn: async (data: Partial<CharacterCustomization> = {}) => {
      if (!user?.id) throw new Error("User not authenticated")
      
      const characterData = {
        name: data.name || "Agricultor",
        head_id: data.head_id || DEFAULT_HEAD,
        body_id: data.body_id || DEFAULT_BODY,
        tool_id: data.tool_id || "shovel",
      }
      
      console.log('[useCharacter] Creating character with data:', characterData)
      const result = await playerService.createCharacter(user.id, characterData)
      console.log('[useCharacter] Character created:', result)
      return result
    },
    onSuccess: (newCharacter) => {
      if (!newCharacter || !user?.id) return
      
      // Update local state immediately for instant UI update
      setCharacter(newCharacter)
      
      // Update query cache for single character
      queryClient.setQueryData(["character", user.id], newCharacter)
      
      // Update characters list cache if it exists
      queryClient.setQueryData(["characters", user.id], (old: CharacterCustomization[] = []) => {
        const exists = old.some(char => char.id === newCharacter.id)
        return exists 
          ? old.map(char => char.id === newCharacter.id ? newCharacter : char)
          : [...old, newCharacter]
      })
      
      // Invalidate the characters query to refetch if needed
      queryClient.invalidateQueries({ 
        queryKey: ["characters", user.id],
        refetchType: 'active',
      })
    },
    onError: (error) => {
      console.error('Error creating character:', error)
      throw error // Re-throw to be caught by the component
    }
  })

  // Update character mutation
  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CharacterCustomization> }) => {
      if (!user?.id) throw new Error("User not authenticated")
      
      console.log('Updating character:', id, 'with data:', data)
      
      // Get current character data from server to ensure we have the latest
      const currentCharacter = await playerService.getCharacters(user.id)
      const currentData = Array.isArray(currentCharacter) 
        ? currentCharacter.find(c => c.id === id)
        : currentCharacter
        
      if (!currentData) throw new Error("Character not found")
      
      // Merge current data with updates
      const updatedData = {
        ...currentData,
        ...data,
        id,
        // Don't include user_id in the update as it's not needed
      } as CharacterCustomization
      
      // Update on the server
      console.log('Sending update with data:', updatedData)
      const updatedCharacter = await playerService.updateCharacter(updatedData)
      console.log('Update response:', updatedCharacter)
      
      return updatedCharacter
    },
    onSuccess: (updatedCharacter) => {
      if (!updatedCharacter) return
      
      console.log('Update successful, updating cache')
      
      // Update local state immediately
      setCharacter(updatedCharacter)
      
      // Update query cache for single character
      queryClient.setQueryData(["character", user?.id], updatedCharacter)
      
      // Update characters list cache
      queryClient.setQueryData(["characters", user?.id], (old: CharacterCustomization[] = []) => {
        const index = old.findIndex(c => c.id === updatedCharacter.id)
        if (index >= 0) {
          const updated = [...old]
          updated[index] = updatedCharacter
          return updated
        }
        return [updatedCharacter, ...old]
      })
      
      // Invalidate the characters query to refetch if needed
      queryClient.invalidateQueries({ queryKey: ["characters", user?.id] })
    },
    onError: (error) => {
      console.error('Error updating character:', error)
      throw error // Re-throw to be caught by the component
    }
  })

  // Auto-create default character if none exists
  useEffect(() => {
    if (
      user?.id && 
      characterQuery.isSuccess && 
      !characterQuery.data && 
      !createCharacterMutation.isPending && 
      !createCharacterMutation.isSuccess
    ) {
      console.log("Creating default character for user:", user.id)
      createCharacterMutation.mutate({
        name: "Agricultor",
        head_id: DEFAULT_HEAD,
        body_id: DEFAULT_BODY,
        tool_id: "shovel"
      })
    }
  }, [
    user?.id, 
    characterQuery.isSuccess, 
    characterQuery.data, 
    createCharacterMutation
  ])

  const isLoading = characterQuery.isLoading || createCharacterMutation.isPending || updateCharacterMutation.isPending
  const isError = characterQuery.isError || createCharacterMutation.isError || updateCharacterMutation.isError
  const error = characterQuery.error || createCharacterMutation.error || updateCharacterMutation.error
  
  return {
    character,
    isLoading,
    isError,
    error,
    createCharacter: createCharacterMutation.mutateAsync,
    updateCharacter: updateCharacterMutation.mutateAsync,
  }
}
