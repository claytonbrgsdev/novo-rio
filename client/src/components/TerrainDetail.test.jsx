/* eslint-env vitest */
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import TerrainDetail from './TerrainDetail'
import api from '../api'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'

vi.mock('../api')

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('prompts to select when no terrainId provided', () => {
  render(<TerrainDetail />, { wrapper: createWrapper() })
  const prompt = screen.getByText(/Selecione um terreno/i)
  expect(prompt).not.toBeNull()
})

test('shows loading state while fetching terrain', () => {
  api.get = vi.fn(() => new Promise(() => {}))
  render(<TerrainDetail terrainId={42} />, { wrapper: createWrapper() })
  const loading = screen.getByText(/Carregando terreno/i)
  expect(loading).not.toBeNull()
})

test('shows error state on fetch failure', async () => {
  api.get = vi.fn(() => Promise.reject(new Error('fail')))
  render(<TerrainDetail terrainId={42} />, { wrapper: createWrapper() })
  await waitFor(() => {
    const error = screen.getByText(/Erro ao carregar terreno/i)
    expect(error).not.toBeNull()
  })
})

test('renders terrain details and agents list on success', async () => {
  const terrainData = {
    id: 1,
    name: 'TestT',
    player_id: 5,
    x_coordinate: 10,
    y_coordinate: 20,
    access_type: 'private',
    updated_at: '2025-04-19T00:00:00Z'
  }
  const agentsData = [
    { quadrant: 1, agents: [{ id: 1 }, { id: 2 }] },
    { quadrant: 2, agents: [] }
  ]
  api.get = vi.fn()
    .mockResolvedValueOnce({ data: terrainData })
    .mockResolvedValueOnce({ data: agentsData })

  render(<TerrainDetail terrainId={1} />, { wrapper: createWrapper() })

  await waitFor(() => {
    const header = screen.getByText(/Detalhes do Terreno #1/i)
    expect(header).not.toBeNull()
  })

  expect(screen.getByText(/Nome:/i)).not.toBeNull()
  expect(screen.getByText(/TestT/i)).not.toBeNull()
  expect(screen.getByText(/Coord.:/i)).not.toBeNull()
  expect(screen.getByText(/10, 20/i)).not.toBeNull()

  // Agents list
  expect(screen.getByRole('heading', { name: /Agentes/i })).not.toBeNull()
  expect(screen.getByText(/Quadrante 1:/i)).not.toBeNull()
  expect(screen.getByText(/2 agentes/i)).not.toBeNull()
  expect(screen.getByText(/Quadrante 2:/i)).not.toBeNull()
})
