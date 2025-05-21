"use client"

import React from 'react'
import { Quadrant } from '@/types/api'
import PlantingSlot from './PlantingSlot'

interface QuadrantGridProps {
  quadrants: Quadrant[]
  terrainId: string
}

export default function QuadrantGrid({ quadrants, terrainId }: QuadrantGridProps) {
  // Sort quadrants by position (A1, A2, B1, B2, etc.)
  const sortedQuadrants = [...quadrants].sort((a, b) => {
    return a.position.localeCompare(b.position)
  })

  // Organize in a 5x3 grid layout
  const rows = 3
  const cols = 5
  const quadrantGrid = Array(rows).fill(null).map(() => Array(cols).fill(null))

  // Map positions like A1, B2 to grid indices
  sortedQuadrants.forEach(quadrant => {
    const colChar = quadrant.position.charAt(0)
    const rowNum = parseInt(quadrant.position.charAt(1)) - 1
    
    const colIndex = colChar.charCodeAt(0) - 'A'.charCodeAt(0)
    
    if (colIndex >= 0 && colIndex < cols && rowNum >= 0 && rowNum < rows) {
      quadrantGrid[rowNum][colIndex] = quadrant
    }
  })

  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      {quadrantGrid.flatMap((row, rowIndex) =>
        row.map((quadrant, colIndex) => {
          const position = `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
          
          return (
            <div 
              key={`${rowIndex}-${colIndex}`} 
              className="border border-gray-300 rounded-md p-2 aspect-square relative"
            >
              <div className="absolute top-1 left-1 text-xs text-gray-500">
                {position}
              </div>
              
              {quadrant ? (
                <div className="h-full">
                  <div className="text-xs mb-1 mt-3">
                    <div className="flex justify-between">
                      <span>Solo: {Math.round(quadrant.soil_quality)}</span>
                      <span>Agua: {Math.round(quadrant.water_level)}</span>
                    </div>
                    <div>Sol: {Math.round(quadrant.sunlight)}</div>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-1 h-[85%]">
                    {/* Display 15 slots (5x3) per quadrant */}
                    {Array(15).fill(null).map((_, slotIndex) => (
                      <PlantingSlot
                        key={slotIndex}
                        quadrantId={quadrant.id}
                        slotIndex={slotIndex}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Indisponível
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
