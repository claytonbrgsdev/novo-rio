/* eslint-env vitest, vitest/globals */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import TerrainList from './TerrainList'
import * as infiniteTerrainsHook from '../hooks/useInfiniteTerrains'
import * as terrainActionsHook from '../hooks/useTerrainActions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, test, expect, afterEach } from 'vitest'

// Restore mocks after each test
afterEach(() => { vi.restoreAllMocks() })

// React Query provider wrapper
const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('TerrainList', () => {
  test('loading state', () => {
    vi.spyOn(infiniteTerrainsHook, 'useInfiniteTerrains').mockReturnValue({ data: null, isLoading: true, error: null })
    vi.spyOn(terrainActionsHook, 'useTerrainActions').mockReturnValue({ plantar: { mutate: () => {}, isLoading: false }, regar: { mutate: () => {}, isLoading: false }, colher: { mutate: () => {}, isLoading: false } })
    render(<TerrainList />, { wrapper })
    const loadingEl = screen.getByText(/Loading terrains/i)
    expect(loadingEl).not.toBeNull()
  })

  test('error state', () => {
    vi.spyOn(infiniteTerrainsHook, 'useInfiniteTerrains').mockReturnValue({ data: null, isLoading: false, error: new Error('fail') })
    vi.spyOn(terrainActionsHook, 'useTerrainActions').mockReturnValue({ plantar: { mutate: () => {}, isLoading: false }, regar: { mutate: () => {}, isLoading: false }, colher: { mutate: () => {}, isLoading: false } })
    render(<TerrainList />, { wrapper })
    const errorEl = screen.getByText(/Error loading terrains/i)
    expect(errorEl).not.toBeNull()
  })

  test('renders terrain cards and actions', () => {
    const terrains = [{ id: 1, name: 'T1', player_id: 2, x_coordinate: 0, y_coordinate: 0, access_type: 'public', created_at: '2025-04-19T00:00:00Z' }]
    vi.spyOn(infiniteTerrainsHook, 'useInfiniteTerrains').mockReturnValue({ data: { pages: [terrains] }, isLoading: false, error: null, fetchNextPage: vi.fn(), hasNextPage: false, isFetchingNextPage: false })
    const regarMock = { mutate: vi.fn(), isLoading: false }
    const colherMock = { mutate: vi.fn(), isLoading: false }
    const plantarMock = { mutate: vi.fn(), isLoading: false }
    vi.spyOn(terrainActionsHook, 'useTerrainActions').mockReturnValue({ plantar: plantarMock, regar: regarMock, colher: colherMock })

    const onSelect = vi.fn()
    render(<TerrainList selectedTerrainId={1} onSelect={onSelect} filterPlayerId={2} />, { wrapper })

    // Terrain card
    const terrainEl = screen.getByText(/Terreno #1/i)
    expect(terrainEl).not.toBeNull()
    // Action buttons
    fireEvent.click(screen.getByText(/Regar/i))
    expect(regarMock.mutate).toHaveBeenCalledWith(1)
    fireEvent.click(screen.getByText(/Colher/i))
    expect(colherMock.mutate).toHaveBeenCalledWith(1)
    // select terrain on click
    fireEvent.click(screen.getByText(/Terreno #1/i))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  test('handles load more', () => {
    vi.spyOn(infiniteTerrainsHook, 'useInfiniteTerrains').mockReturnValue({ data: { pages: [[{ id: 1, player_id: 0 }]] }, isLoading: false, error: null, fetchNextPage: vi.fn(), hasNextPage: true, isFetchingNextPage: false })
    vi.spyOn(terrainActionsHook, 'useTerrainActions').mockReturnValue({ plantar: { mutate: () => {}, isLoading: false }, regar: { mutate: () => {}, isLoading: false }, colher: { mutate: () => {}, isLoading: false } })
    const { getByText } = render(<TerrainList />, { wrapper })
    const btn = getByText(/Load More/i)
    fireEvent.click(btn)
    expect(infiniteTerrainsHook.useInfiniteTerrains().fetchNextPage).toHaveBeenCalled()
  })

  test('load more loading state', () => {
    vi.spyOn(infiniteTerrainsHook, 'useInfiniteTerrains').mockReturnValue({ data: { pages: [[{ id: 1, player_id: 0 }]] }, isLoading: false, error: null, fetchNextPage: () => {}, hasNextPage: true, isFetchingNextPage: true })
    vi.spyOn(terrainActionsHook, 'useTerrainActions').mockReturnValue({ plantar: { mutate: () => {}, isLoading: false }, regar: { mutate: () => {}, isLoading: false }, colher: { mutate: () => {}, isLoading: false } })
    render(<TerrainList />, { wrapper })
    const loadingMoreEl = screen.getByText(/Loading.../i)
    expect(loadingMoreEl).not.toBeNull()
  })
})
