import { useQuery } from '@tanstack/react-query'
import api from '../api'

// Retorna um array de agentes para cada quadrante de um terreno
export function useAgents(terrainId) {
  return useQuery({
    queryKey: ['agents', terrainId],
    enabled: !!terrainId,
    queryFn: async () => {
      // Exemplo de endpoint esperado: /async/agents?terrain_id=123
      const { data } = await api.get(`/async/agents?terrain_id=${terrainId}`)
      return data // [{quadrant: 1, agents: [...]}, ...]
    }
  })
}
