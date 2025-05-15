"use client"

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import type { UserProfile } from '@/types/player'
import Image from 'next/image'

export function PlayerProfileCard() {
  const { user, playerData, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(playerData.profile?.username || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Se ainda não carregou ou não está autenticado, mostra carregando
  if (!playerData.loaded || !user) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar edição, restaurar valores originais
      setUsername(playerData.profile?.username || '')
    }
    setIsEditing(!isEditing)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      if (!playerData.profile) return
      
      const updatedProfile: UserProfile = {
        ...playerData.profile,
        username
      }
      
      await updateProfile(updatedProfile)
      setIsEditing(false)
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
      setError('Falha ao atualizar perfil. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Perfil do Jogador</h2>
        <button 
          onClick={handleEditToggle}
          className="px-3 py-1 text-sm font-medium text-blue-600 rounded hover:bg-blue-50"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative w-16 h-16 overflow-hidden rounded-full bg-gray-100">
          {playerData.profile?.avatar_url ? (
            <Image 
              src={playerData.profile.avatar_url} 
              alt="Avatar" 
              fill 
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-green-100 text-green-800 text-xl font-bold">
              {playerData.profile?.username?.charAt(0) || user.email.charAt(0)}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de usuário
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nome de usuário"
                  required
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-600 mb-3">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900">
                {playerData.profile?.username || 'Jogador'}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-md font-medium text-gray-800 mb-3">Estatísticas do jogo</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Nível</p>
            <p className="text-lg font-semibold text-gray-900">{playerData.progress?.level || 1}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Pontos</p>
            <p className="text-lg font-semibold text-gray-900">{playerData.progress?.score || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Moedas</p>
            <p className="text-lg font-semibold text-gray-900">{playerData.progress?.coins || 0}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Personagem</p>
            <p className="text-lg font-semibold text-gray-900">{playerData.character?.name || 'Padrão'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
