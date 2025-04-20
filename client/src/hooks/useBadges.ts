import { useQuery } from '@tanstack/react-query';
import api from '../api';

export interface Badge {
  id: number;
  player_id: number;
  name: string;
  description?: string;
}

/**
 * Hook to fetch badges for a given player
 */
export function useBadges(playerId: number | null) {
  return useQuery<Badge[]>({
    queryKey: ['badges', playerId],
    queryFn: async () => {
      const res = await api.get<Badge[]>(`/badges?player_id=${playerId}`);
      return res.data;
    },
    enabled: playerId != null,
  });
}
