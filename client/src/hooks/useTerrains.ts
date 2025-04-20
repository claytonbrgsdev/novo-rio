import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface Terrain {
  id: number;
  name: string;
  // ...outros campos relevantes
}

export function useTerrains() {
  return useQuery<Terrain[]>({
    queryKey: ['terrains'],
    queryFn: async () => {
      const { data } = await api.get('/terrains');
      return data;
    },
  });
}
