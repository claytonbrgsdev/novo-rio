"use client"

import React, { useState, useEffect } from 'react'
import { useTerrains } from '@/hooks/useTerrains'
import { useQuadrants } from '@/hooks/useQuadrants'
import { usePlayerContext } from '@/context/PlayerContext'
import type { Quadrant } from '@/types/api.d'
import QuadrantGrid from './QuadrantGrid'

export default function GameGrid() {
  const { currentPlayerId } = usePlayerContext()
  const { terrains, isLoading: terrainsLoading, createTerrain, isCreating } = useTerrains()
  const [selectedTerrainId, setSelectedTerrainId] = useState<string | null>(null)
  const { quadrants, isLoading: quadrantsLoading } = useQuadrants(selectedTerrainId || '')
  
  // Maximum number of terrains allowed
  const MAX_TERRAINS = 15

  // Select first terrain by default when data loads
  useEffect(() => {
    if (terrains.length > 0 && !selectedTerrainId) {
      setSelectedTerrainId(terrains[0].id)
    }
  }, [terrains, selectedTerrainId])

  if (terrainsLoading) {
    return <div className="flex justify-center items-center h-64">Carregando terrenos...</div>
  }

  const handleCreateTerrain = () => {
    if (!currentPlayerId) return
    
    createTerrain({
      name: `Terreno ${terrains.length + 1}`,
      player_id: currentPlayerId // Pass as string, not number
    })
  }

  if (terrains.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-lg mb-4">Você ainda não possui terrenos.</p>
        <button 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          onClick={handleCreateTerrain}
          disabled={isCreating}
        >
          {isCreating ? 'Adquirindo...' : 'Adquirir Terreno'}
        </button>
      </div>
    )
  }

  const canCreateMoreTerrains = terrains.length < MAX_TERRAINS

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-2">
          {terrains.map((terrain: any) => (
            <button
              key={terrain.id}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                selectedTerrainId === terrain.id 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedTerrainId(terrain.id)}
            >
              {terrain.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-end ml-4">
          <div className="text-sm text-gray-700 mb-1">
            Terrenos: <span className={terrains.length >= MAX_TERRAINS ? 'text-red-600 font-bold' : ''}>{terrains.length}/{MAX_TERRAINS}</span>
          </div>
          {canCreateMoreTerrains && (
            <button
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center"
              onClick={handleCreateTerrain}
              disabled={isCreating}
            >
              {isCreating ? 'Adquirindo...' : 'Novo Terreno'}
            </button>
          )}
        </div>
      </div>

      {selectedTerrainId && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-4">
            {terrains.find(t => t.id === selectedTerrainId)?.name}
          </h3>
          
          {quadrantsLoading ? (
            <div className="flex justify-center items-center h-64">Carregando quadrantes...</div>
          ) : (
            <QuadrantGrid quadrants={quadrants} terrainId={selectedTerrainId} />
          )}
        </div>
      )}
    </div>
  )
}
