import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import api from '../api';

export interface Terrain {
  id: number;
  name?: string;
  player_id: number;
  x_coordinate: number;
  y_coordinate: number;
  access_type: string;
  created_at: string;
}

export function useInfiniteTerrains(limit: number = 10) {
  return useInfiniteQuery<
    Terrain[],                // queryFn data type
    Error,                    // error type
    InfiniteData<Terrain[]>,  // data (pages) wrapper type
    [string, number],         // query key tuple type
    number                    // pageParam type
  >({
    queryKey: ['terrains', limit] as const,
    queryFn: async ({ pageParam = 0 }: { pageParam?: number }) => {
      const skip = pageParam * limit;
      const res = await api.get<Terrain[]>(`/async/terrains?skip=${skip}&limit=${limit}`);
      return res.data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < limit) return undefined;
      return pages.length;
    },
    initialPageParam: 0,
  });
}
