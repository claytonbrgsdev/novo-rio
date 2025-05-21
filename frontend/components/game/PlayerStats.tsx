"use client"

import React from 'react'
import { usePlayer } from '@/hooks/usePlayer'

export default function PlayerStats() {
  const { player, isLoading, isError } = usePlayer()

  if (isLoading) {
    return <div className="p-4 bg-white shadow-md rounded-md animate-pulse">Carregando dados do jogador...</div>
  }

  if (isError || !player) {
    return (
      <div className="p-4 bg-white shadow-md rounded-md border-l-4 border-red-500">
        <p className="text-red-500">Erro ao carregar dados do jogador</p>
      </div>
    )
  }

  // Function to determine aura color based on aura value
  const getAuraColor = () => {
    if (player.aura > 80) return 'bg-green-500'
    if (player.aura > 60) return 'bg-green-300'
    if (player.aura > 40) return 'bg-yellow-400'
    if (player.aura > 20) return 'bg-orange-400'
    return 'bg-red-500'
  }

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold">
            {player.name.charAt(0)}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${getAuraColor()} border-2 border-white`}></div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">{player.name}</h2>
          <div className="text-sm text-gray-600">Nível {player.level}</div>
          <div className="flex items-center mt-1">
            <span className="text-yellow-500 mr-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 .587l3.668 7.431 8.332 1.21-6.001 5.851 1.412 8.23-7.411-3.895-7.411 3.895 1.412-8.23-6.001-5.851 8.332-1.21z"/>
              </svg>
            </span>
            <span>{player.coins}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm">Aura</span>
          <span className="text-sm font-medium">{player.aura}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getAuraColor()}`}
            style={{ width: `${player.aura}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm">Experiência</span>
          <span className="text-sm font-medium">{player.experience} XP</span>
        </div>
        {/* Assuming XP needed for next level is level*100 */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full bg-blue-500"
            style={{ width: `${(player.experience % (player.level * 100)) / (player.level * 100) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
