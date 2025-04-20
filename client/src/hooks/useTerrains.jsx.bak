import { useQuery } from '@tanstack/react-query'
import api from '../api'

export function useTerrains(skip = 0, limit = 100) {
  return useQuery({
    queryKey: ['terrains', { skip, limit }],
    queryFn: async () => {
      const { data } = await api.get(`/async/terrains?skip=${skip}&limit=${limit}`)
      return data
    }
  })
}
