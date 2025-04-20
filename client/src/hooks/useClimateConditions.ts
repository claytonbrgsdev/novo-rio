import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface ClimateCondition {
  id: number;
  name: string;
  description: string;
}

/**
 * Hook to fetch climate conditions
 */
export function useClimateConditions() {
  return useQuery<ClimateCondition[]>({
    queryKey: ['climate-conditions'],
    queryFn: async () => {
      const res = await api.get<ClimateCondition[]>('/climate-conditions');
      return res.data;
    },
  });
}
