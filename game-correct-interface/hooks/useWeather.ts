import { useQuery } from "react-query"
import { apiService } from "@/services/api"
import type { Weather } from "@/types/api"

export function useWeather() {
  const weatherQuery = useQuery<Weather>(["weather"], () => apiService.get<Weather>("/weather"), {
    staleTime: 1000 * 60 * 15, // 15 minutos
    refetchInterval: 1000 * 60 * 15, // Refetch a cada 15 minutos
  })

  return {
    weather: weatherQuery.data,
    isLoading: weatherQuery.isLoading,
    isError: weatherQuery.isError,
    error: weatherQuery.error,
  }
}
