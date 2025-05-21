"use client"

import { useState } from 'react'
import UserCharacter from './user-character'

interface GameGridProps {
  viewType: 'village' | 'macro' | 'medium' | 'micro'
  activeQuadrant: string
  onQuadrantClick: (quadrant: string) => void
}

export default function ScreenshotGameGrid({ viewType, activeQuadrant, onQuadrantClick }: GameGridProps) {
  // Get the row and column from activeQuadrant (e.g., "B3" -> row: "B", col: "3")
  const activeRow = activeQuadrant?.charAt(0) || ''
  const activeCol = activeQuadrant?.substring(1) || ''
  // Render the medium view (grid of 5x3 quadrants)
  const renderMediumView = () => {
    // Create grid of quadrants A1-E3
    const rows = ['A', 'B', 'C']
    const cols = [1, 2, 3, 4, 5]
    
    return (
      <div className="h-full w-full">
        <div className="grid grid-cols-5 grid-rows-3 gap-[1px] h-full bg-green-600">
          {rows.map(row => (
            cols.map(col => {
              const position = `${row}${col}`
              const isCenter = position === 'C3'
              const isActive = position === activeQuadrant
              
              return (
                <div 
                  key={position}
                  className={`bg-green-400 flex items-center justify-center relative ${isActive ? 'border-[3px] border-amber-700' : 'border border-green-500'}`}
                  onClick={() => onQuadrantClick(position)}
                >
                  {isActive && (
                    <div className="absolute">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-black rounded-full"></div>
                      </div>
                    </div>
                  )}
                  <span className="absolute top-1 left-1 text-[10px] text-green-900 opacity-70 font-medium">
                    {position}
                  </span>
                </div>
              )
            })
          ))}
        </div>
      </div>
    )
  }

  return renderMediumView()
}
