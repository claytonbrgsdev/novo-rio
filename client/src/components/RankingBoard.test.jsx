/* eslint-env vitest */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RankingBoard from './RankingBoard'
import { usePlayers } from '../hooks/usePlayers'
import { test, expect, vi } from 'vitest'

// Mock the usePlayers hook
vi.mock('../hooks/usePlayers')

test('displays loading state', () => {
  usePlayers.mockReturnValue({ data: null, isLoading: true, error: null })
  render(<RankingBoard />)
  const loadingEl = screen.getByText(/Carregando ranking/i)
  expect(loadingEl).not.toBeNull()
})

test('displays error state', () => {
  usePlayers.mockReturnValue({ data: null, isLoading: false, error: new Error('fail') })
  render(<RankingBoard />)
  const errorEl = screen.getByText(/Erro ao carregar ranking/i)
  expect(errorEl).not.toBeNull()
})

test('displays empty state', () => {
  usePlayers.mockReturnValue({ data: [], isLoading: false, error: null })
  render(<RankingBoard />)
  const emptyEl = screen.getByText(/Nenhum jogador encontrado/i)
  expect(emptyEl).not.toBeNull()
})

test('renders sorted players and handles selection', () => {
  const players = [
    { id: 1, name: 'Alice', points: 10 },
    { id: 2, name: 'Bob', points: 20 },
  ]
  usePlayers.mockReturnValue({ data: players, isLoading: false, error: null })
  const onSelect = vi.fn()
  render(<RankingBoard selectedPlayerId={1} onSelect={onSelect} />)

  const items = screen.getAllByRole('listitem')
  // First item should be Bob (higher points)
  expect(items[0].textContent).toContain('Bob')
  expect(items[1].textContent).toContain('Alice')

  // Click Bob (id 2)
  fireEvent.click(items[0])
  expect(onSelect).toHaveBeenCalledWith(2)

  // Click Alice (id 1), same as selected, should clear selection
  onSelect.mockClear()
  fireEvent.click(items[1])
  expect(onSelect).toHaveBeenCalledWith(null)
})
