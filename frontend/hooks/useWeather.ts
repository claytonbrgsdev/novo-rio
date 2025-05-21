import { useQuery } from "@tanstack/react-query"
import { apiService } from "@/services/api"
import type { Weather } from "@/types/weather"

export function useWeather() {
  const weatherQuery = useQuery({
    queryKey: ["weather"],
    queryFn: () => apiService.get<Weather>("/weather"),
    staleTime: 1000 * 60 * 15, // 15 minutos
    refetchInterval: 1000 * 60 * 15, // Refetch a cada 15 minutos
  })

  return {
    weather: weatherQuery.data,
    isLoading: weatherQuery.isPending, // isPending instead of isLoading in v5
    isError: weatherQuery.isError,
    error: weatherQuery.error,
  }
}
