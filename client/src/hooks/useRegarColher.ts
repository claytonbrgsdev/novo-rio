import { useMutation } from '@tanstack/react-query';
import api from '../api';

export interface ActionPayload {
  action: string;
  quadrant: number;
  // ...outros campos relevantes
}

export function useRegarColher() {
  return useMutation({
    mutationFn: async (payload: ActionPayload) => {
      const { data } = await api.post('/actions', payload);
      return data;
    },
  });
}
