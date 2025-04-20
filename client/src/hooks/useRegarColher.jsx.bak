import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api'

export function useRegarColher() {
  const queryClient = useQueryClient()
  const regar = useMutation({
    mutationFn: async (terrainId) => {
      await api.post('/whatsapp/message', { command: 'regar', terrain_id: terrainId })
    },
    onSuccess: () => queryClient.invalidateQueries(['terrains'])
  })
  const colher = useMutation({
    mutationFn: async (terrainId) => {
      await api.post('/whatsapp/message', { command: 'colher', terrain_id: terrainId })
    },
    onSuccess: () => queryClient.invalidateQueries(['terrains'])
  })
  return { regar, colher }
}
