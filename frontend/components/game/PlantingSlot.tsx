"use client"

import React, { useState } from 'react'
import { usePlantings } from '@/hooks/usePlantings'
import { useSpecies } from '@/hooks/useSpecies'
import { useActions } from '@/hooks/useActions'
import { useInputs } from '@/hooks/useInputs'
import { usePlayerContext } from '@/context/PlayerContext'
import { components } from '@/types/api'

type PlantingSchema = components["schemas"]["PlantingSchema"]

interface PlantingSlotProps {
  quadrantId: string
  slotIndex: number
}

export default function PlantingSlot({ quadrantId, slotIndex }: PlantingSlotProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { currentPlayerId } = usePlayerContext()
  const { plantings, createPlanting, isLoading } = usePlantings({ quadrant_id: quadrantId })
  const { species } = useSpecies()
  const { performAction, isPerforming } = useActions()
  const { inputs } = useInputs()

  // Find planting in this slot
  const planting = plantings.find(p => 
    p.quadrant_id === parseInt(quadrantId) && p.slot_index === slotIndex
  )
  
  // Background color based on plant state and days without water
  const getSlotBgColor = () => {
    if (!planting) return 'bg-brown-100'
    
    // Use days_sem_rega as a rough equivalent to health
    // The more days without water, the worse the health
    if (planting.days_sem_rega === 0) return 'bg-green-500'
    if (planting.days_sem_rega <= 1) return 'bg-green-400'
    if (planting.days_sem_rega <= 3) return 'bg-yellow-400'
    if (planting.days_sem_rega <= 5) return 'bg-orange-400'
    return 'bg-red-400'
  }
  
  // Plant a new seed/seedling in empty slot
  const handlePlant = (speciesId: string) => {
    if (!currentPlayerId) return
    
    createPlanting({
      quadrant_id: parseInt(quadrantId),
      slot_index: slotIndex,
      species_id: parseInt(speciesId),
      player_id: parseInt(currentPlayerId)
    })
    setIsMenuOpen(false)
  }
  
  // Apply input/resource to existing planting
  const handleApplyInput = (inputId: string) => {
    if (!planting) return
    
    performAction({
      action_name: 'apply_input',
      planting_id: planting.id.toString(),
      input_id: inputId
    })
    setIsMenuOpen(false)
  }
  
  // Handle clicks on the slot
  const handleSlotClick = () => {
    if (isLoading || isPerforming) return
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="relative">
      <div 
        className={`w-full aspect-square rounded-sm cursor-pointer ${getSlotBgColor()} flex items-center justify-center`}
        onClick={handleSlotClick}
      >
        {planting ? (
          <div className="text-xs text-center">
            {planting.current_state.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="text-xs text-center text-gray-500">+</div>
        )}
      </div>
      
      {/* Popup menu for actions */}
      {isMenuOpen && (
        <div className="absolute bottom-full left-0 z-10 bg-white shadow-md rounded-md p-2 min-w-[150px] mb-1">
          {planting ? (
            <div>
              <div className="text-xs font-semibold mb-1">
                Planta ID: {planting.species_id}
              </div>
              <div className="text-xs mb-2">
                Dias plantada: {planting.days_since_planting}<br/>
                Dias sem água: {planting.days_sem_rega}
              </div>
              <div className="text-xs mb-1 font-semibold">Aplicar:</div>
              <div className="flex flex-col gap-1">
                {inputs.length > 0 ? (
                  inputs.map((input: any) => (
                    <button
                      key={input.id}
                      className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded-sm"
                      onClick={() => handleApplyInput(input.id.toString())}
                    >
                      {input.input_type?.name || 'Insumo'} ({input.quantity})
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">Sem insumos</div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold mb-1">Plantar:</div>
              <div className="flex flex-col gap-1">
                {species.length > 0 ? (
                  species.map((species: any) => (
                    <button
                      key={species.id}
                      className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 rounded-sm"
                      onClick={() => handlePlant(species.id.toString())}
                    >
                      {species.name}
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-gray-500">Sem espécies</div>
                )}
              </div>
            </div>
          )}
          <button
            className="text-xs mt-2 w-full text-center text-gray-500 hover:text-gray-700"
            onClick={() => setIsMenuOpen(false)}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  )
}
