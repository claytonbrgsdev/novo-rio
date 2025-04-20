import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface Agent {
  id: number;
  name: string;
  type: string;
  // ...outros campos relevantes
}

export interface QuadrantAgents {
  quadrant: number;
  agents: Agent[];
}

export function useAgents(terrainId: number | null) {
  return useQuery<QuadrantAgents[]>({
    queryKey: ['agents', terrainId],
    queryFn: async () => {
      if (terrainId == null) return [];
      const { data } = await api.get(`/terrains/${terrainId}/agents`);
      return data;
    },
    enabled: terrainId != null,
  });
}
