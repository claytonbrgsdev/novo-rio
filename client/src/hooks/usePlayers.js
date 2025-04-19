import { useQuery } from '@tanstack/react-query'
import api from '../api'

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      // Espera que o backend retorne [{id, name, points, badges, ...}, ...]
      const { data } = await api.get('/async/players')
      return data
    }
  })
}
