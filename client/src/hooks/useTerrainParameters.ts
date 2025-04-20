import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface TerrainParameter {
  quadrant: number;
  moisture: number;
  fertility: number;
  // ...outros campos relevantes
}

export function useTerrainParameters(terrainId: number | null) {
  return useQuery<TerrainParameter[]>({
    queryKey: ['terrain-parameters', terrainId],
    queryFn: async () => {
      if (terrainId == null) return [];
      const { data } = await api.get(`/terrains/${terrainId}/parameters`);
      return data;
    },
    enabled: terrainId != null,
  });
}
