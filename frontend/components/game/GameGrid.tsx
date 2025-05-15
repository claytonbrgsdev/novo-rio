"use client"

import React, { useState, useEffect } from 'react'
import { useTerrains } from '@/hooks/useTerrains'
import { useQuadrants } from '@/hooks/useQuadrants'
import { usePlayerContext } from '@/context/PlayerContext'
import { Quadrant } from '@/types/api'
import QuadrantGrid from './QuadrantGrid'

export default function GameGrid() {
  const { currentPlayerId } = usePlayerContext()
  const { terrains, isLoading: terrainsLoading } = useTerrains()
  const [selectedTerrainId, setSelectedTerrainId] = useState<string | null>(null)
  const { quadrants, isLoading: quadrantsLoading } = useQuadrants(selectedTerrainId || '')

  // Select first terrain by default when data loads
  useEffect(() => {
    if (terrains.length > 0 && !selectedTerrainId) {
      setSelectedTerrainId(terrains[0].id)
    }
  }, [terrains, selectedTerrainId])

  if (terrainsLoading) {
    return <div className="flex justify-center items-center h-64">Carregando terrenos...</div>
  }

  if (terrains.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-lg mb-4">Você ainda não possui terrenos.</p>
        <button 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          onClick={() => {/* Add functionality to create a terrain */}}
        >
          Adquirir Terreno
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex mb-4 gap-2 overflow-x-auto pb-2">
        {terrains.map((terrain) => (
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
