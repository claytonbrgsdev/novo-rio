/* eslint-env vitest, vitest/globals */
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Stub defaultMutationOptions for react-query v5 in test environment
QueryClient.prototype.defaultMutationOptions = function(options) { return options; };
import { useTerrainActions } from './useTerrainActions'
import api from '../api'
import { vi } from 'vitest'

// Mock api module
vi.mock('../api')

const createWrapper = (queryClient: any) => ({
  children
}: any) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
)

describe('useTerrainActions hook', () => {
  test.each([
    ['plantar', 'plantar'],
    ['regar', 'regar'],
    ['colher', 'colher'],
  ])('calls api.post and invalidates queries on %s', async (key: any, command: any) => {
    api.post = vi.fn().mockResolvedValue({})
    const queryClient = new QueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createWrapper(queryClient)
    const { result } = renderHook(() => useTerrainActions(), { wrapper })

    // Trigger mutation
    result.current[key].mutate(42)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/whatsapp/message', { command, terrain_id: 42 })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['terrains'] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['terrain', 42] })
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['agents', 42] })
    })
  })
})
