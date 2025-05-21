"use client"

import React, { useState } from 'react'
import { useInputs } from '@/hooks/useInputs'
import { useTools } from '@/hooks/useTools'
import { useActions } from '@/hooks/useActions'
import { usePlayerContext } from '@/context/PlayerContext'

export default function InventoryPanel() {
  const [activeTab, setActiveTab] = useState<'inputs' | 'tools'>('inputs')
  const { inputs, useInput } = useInputs()
  const { tools } = useTools()
  const { performAction, isPerforming } = useActions()
  const { currentPlayerId } = usePlayerContext()
  const [selectedPlantingId, setSelectedPlantingId] = useState<string | null>(null)

  const handleUseInput = (inputId: string, plantingId: string, quantity: number = 1) => {
    if (!plantingId) return
    
    useInput({
      inputId,
      targetId: plantingId,
      quantity
    })
  }

  const handleUseTool = (toolId: string, terrainId: string) => {
    performAction({
      action_name: 'usar_ferramenta',
      tool_key: toolId,
      terrain_id: terrainId
    })
  }

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'inputs' ? 'border-b-2 border-green-500' : ''}`}
          onClick={() => setActiveTab('inputs')}
        >
          Insumos
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'tools' ? 'border-b-2 border-green-500' : ''}`}
          onClick={() => setActiveTab('tools')}
        >
          Ferramentas
        </button>
      </div>

      {activeTab === 'inputs' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Seus Insumos</h3>
          {inputs.length === 0 ? (
            <p className="text-gray-500">Você não possui insumos.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {inputs.map(input => (
                <div key={input.id} className="border rounded-md p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{input.input_type?.name || 'Insumo'}</p>
                      <p className="text-sm text-gray-600">Quantidade: {input.quantity}</p>
                    </div>
                    
                    {selectedPlantingId && (
                      <button
                        className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                        onClick={() => handleUseInput(input.id, selectedPlantingId)}
                        disabled={isPerforming}
                      >
                        Aplicar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Input planting selection UI would go here in a real implementation */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Selecione uma planta no mapa para aplicar insumos.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'tools' && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Suas Ferramentas</h3>
          {tools.length === 0 ? (
            <p className="text-gray-500">Você não possui ferramentas.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {tools.map(tool => (
                <div key={tool.id} className="border rounded-md p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{tool.tool_type?.name || 'Ferramenta'}</p>
                      <p className="text-sm text-gray-600">
                        Durabilidade: {tool.durability}% | 
                        Eficiência: {tool.efficiency}%
                      </p>
                    </div>
                    
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                      onClick={() => handleUseTool(tool.id, 'terrain_id_here')}
                      disabled={isPerforming}
                    >
                      Usar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
