import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import api from '../api';
import { useBadges } from './useBadges';

vi.mock('../api');

describe('useBadges hook', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);
  };

  it('fetches badges when playerId is provided', async () => {
    const badgesMock = [{ id: 1, player_id: 42, name: 'TestBadge', description: 'Desc' }];
    api.get = vi.fn().mockResolvedValue({ data: badgesMock });

    const { result } = renderHook(() => useBadges(42), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/badges?player_id=42');
      expect(result.current.data).toEqual(badgesMock);
    });
  });

  it('does not fetch when playerId is null', () => {
    api.get = vi.fn();
    const { result } = renderHook(() => useBadges(null), { wrapper: createWrapper() });
    expect(api.get).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});
