"use client"

import { useQuery } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { ApiResponse, PaginatedResponse } from "@/types/api"

interface Species {
  id: string
  name: string
  scientific_name: string
  description: string
  germination_days: number
  maturity_days: number
  planting_instructions: string
  created_at: string
  updated_at: string
}

export function useSpecies() {
  const speciesQuery = useQuery({
    queryKey: ["species"],
    queryFn: () => apiService.get<PaginatedResponse<Species>>(`/species`),
    staleTime: 1000 * 60 * 60 // 1 hour
  })

  const getSpeciesById = (id: string) => {
    return speciesQuery.data?.items.find(species => species.id === id)
  }

  return {
    species: speciesQuery.data?.items || [],
    isLoading: speciesQuery.isPending,
    isError: speciesQuery.isError,
    error: speciesQuery.error,
    getSpeciesById
  }
}
