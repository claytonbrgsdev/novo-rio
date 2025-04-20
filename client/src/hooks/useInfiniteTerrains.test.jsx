/* eslint-env vitest */
import { test, expect, vi } from 'vitest'
import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useInfiniteTerrains } from './useInfiniteTerrains'
import api from '../api'

test('useInfiniteTerrains fetches and paginates terrains', async () => {
  // Mock API responses for two pages
  const page1 = [{ id: 1 }, { id: 2 }]
  const page2 = [{ id: 3 }]
  api.get = vi.fn()
    .mockResolvedValueOnce({ data: page1 })
    .mockResolvedValueOnce({ data: page2 })

  // Setup React Query client
  const queryClient = new QueryClient()
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  const { result } = renderHook(() => useInfiniteTerrains(2), { wrapper })

  // Wait for first page data to be available
  await waitFor(() => {
    expect(result.current.data.pages).toEqual([page1])
  })
  expect(api.get).toHaveBeenCalledWith('/async/terrains?skip=0&limit=2')

  // Fetch next page
  await act(async () => {
    await result.current.fetchNextPage()
  })

  // Wait for next page data to be appended
  await waitFor(() => {
    expect(result.current.data.pages).toEqual([page1, page2])
  })
  expect(api.get).toHaveBeenCalledWith('/async/terrains?skip=2&limit=2')
})
