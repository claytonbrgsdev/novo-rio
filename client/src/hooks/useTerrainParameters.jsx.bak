import { useQuery } from '@tanstack/react-query'
import api from '../api'

export function useTerrainParameters(terrainId) {
  return useQuery({
    queryKey: ['terrainParameters', terrainId],
    enabled: !!terrainId,
    queryFn: async () => {
      const { data } = await api.get(`/async/terrain-parameters/${terrainId}`)
      return data
    }
  })
}
