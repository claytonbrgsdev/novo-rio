import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'

// Hook para executar ações no terreno: plantar, regar e colher
export function useTerrainActions() {
  const queryClient = useQueryClient()

  const plantar = useMutation({
    mutationFn: async (terrainId) => {
      await api.post('/whatsapp/message', { command: 'plantar', terrain_id: terrainId })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terrains'] }),
  })

  const regar = useMutation({
    mutationFn: async (terrainId) => {
      await api.post('/whatsapp/message', { command: 'regar', terrain_id: terrainId })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terrains'] }),
  })

  const colher = useMutation({
    mutationFn: async (terrainId) => {
      await api.post('/whatsapp/message', { command: 'colher', terrain_id: terrainId })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['terrains'] }),
  })

  return { plantar, regar, colher }
}
