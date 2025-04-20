import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface Player {
  id: number;
  name: string;
  points?: number;
  badges?: any[];
  // ...outros campos relevantes
}

export function usePlayers() {
  return useQuery<Player[]>({
    queryKey: ['players'],
    queryFn: async () => {
      const { data } = await api.get('/players');
      return data;
    },
  });
}
