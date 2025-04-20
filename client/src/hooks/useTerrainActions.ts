import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

export function useTerrainActions() {
  const queryClient = useQueryClient();

  // Plant mutation
  const mutationPlantar = useMutation<unknown, Error, number>({
    mutationFn: (terrainId: number) => api.post('/whatsapp/message', { command: 'plantar', terrain_id: terrainId }),
    onSuccess: (_data: unknown, terrainId: number) => {
      queryClient.invalidateQueries({ queryKey: ['terrains'] });
      queryClient.invalidateQueries({ queryKey: ['terrain', terrainId] });
      queryClient.invalidateQueries({ queryKey: ['agents', terrainId] });
    },
  });

  // Water mutation
  const mutationRegar = useMutation<unknown, Error, number>({
    mutationFn: (terrainId: number) => api.post('/whatsapp/message', { command: 'regar', terrain_id: terrainId }),
    onSuccess: (_data: unknown, terrainId: number) => {
      queryClient.invalidateQueries({ queryKey: ['terrains'] });
      queryClient.invalidateQueries({ queryKey: ['terrain', terrainId] });
      queryClient.invalidateQueries({ queryKey: ['agents', terrainId] });
    },
  });

  // Harvest mutation
  const mutationColher = useMutation<unknown, Error, number>({
    mutationFn: (terrainId: number) => api.post('/whatsapp/message', { command: 'colher', terrain_id: terrainId }),
    onSuccess: (_data: unknown, terrainId: number) => {
      queryClient.invalidateQueries({ queryKey: ['terrains'] });
      queryClient.invalidateQueries({ queryKey: ['terrain', terrainId] });
      queryClient.invalidateQueries({ queryKey: ['agents', terrainId] });
    },
  });

  return {
    plantar: { mutate: mutationPlantar.mutate, isLoading: mutationPlantar.status === 'pending' },
    regar:   { mutate: mutationRegar.mutate,   isLoading: mutationRegar.status   === 'pending' },
    colher:  { mutate: mutationColher.mutate,  isLoading: mutationColher.status  === 'pending' },
  };
}
