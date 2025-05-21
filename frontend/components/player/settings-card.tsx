"use client"

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import type { UserSettings } from '@/types/player'

export function PlayerSettingsCard() {
  const { user, playerData, updateSettings } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(playerData.settings)
  const [theme, setTheme] = useState<"light" | "dark" | "system">(playerData.settings?.theme || 'light')
  const [volume, setVolume] = useState(playerData.settings?.volume || 0.7)
  const [musicVolume, setMusicVolume] = useState(playerData.settings?.music_volume || 0.5)
  const [sfxVolume, setSfxVolume] = useState(playerData.settings?.sfx_volume || 0.8)
  const [language, setLanguage] = useState(playerData.settings?.language || 'pt-BR')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Se ainda não carregou ou não está autenticado, mostra carregando
  if (!playerData.loaded || !user) {
    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    )
  }
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancelar edição, restaurar valores originais
      setTheme(playerData.settings?.theme || 'light')
      setVolume(playerData.settings?.volume || 0.7)
      setMusicVolume(playerData.settings?.music_volume || 0.5)
      setSfxVolume(playerData.settings?.sfx_volume || 0.8)
      setLanguage(playerData.settings?.language || 'pt-BR')
    }
    setIsEditing(!isEditing)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      if (!playerData.settings) return
      
      const updatedSettings: UserSettings = {
        ...playerData.settings,
        theme: theme,
        volume,
        music_volume: musicVolume,
        sfx_volume: sfxVolume,
        language
      }
      
      await updateSettings(updatedSettings)
      setIsEditing(false)
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err)
      setError('Falha ao atualizar configurações. Por favor, tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Configurações do Jogo</h2>
        <button 
          onClick={handleEditToggle}
          className="px-3 py-1 text-sm font-medium text-blue-600 rounded hover:bg-blue-50"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              Tema
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="light">Claro</option>
              <option value="dark">Escuro</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">
              Volume Geral: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              id="volume"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="musicVolume" className="block text-sm font-medium text-gray-700 mb-1">
              Volume da Música: {Math.round(musicVolume * 100)}%
            </label>
            <input
              type="range"
              id="musicVolume"
              min="0"
              max="1"
              step="0.1"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="sfxVolume" className="block text-sm font-medium text-gray-700 mb-1">
              Volume dos Efeitos: {Math.round(sfxVolume * 100)}%
            </label>
            <input
              type="range"
              id="sfxVolume"
              min="0"
              max="1"
              step="0.1"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Idioma
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es">Español</option>
            </select>
          </div>
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium text-gray-600">Tema</span>
            <span className="text-gray-900">
              {{
                light: 'Claro',
                dark: 'Escuro',
                system: 'Sistema'
              }[playerData.settings?.theme || 'light']}
            </span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium text-gray-600">Volume Geral</span>
            <span className="text-gray-900">{Math.round((playerData.settings?.volume || 0.7) * 100)}%</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium text-gray-600">Volume da Música</span>
            <span className="text-gray-900">{Math.round((playerData.settings?.music_volume || 0.5) * 100)}%</span>
          </div>
          
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="font-medium text-gray-600">Volume dos Efeitos</span>
            <span className="text-gray-900">{Math.round((playerData.settings?.sfx_volume || 0.8) * 100)}%</span>
          </div>
          
          <div className="flex justify-between py-2">
            <span className="font-medium text-gray-600">Idioma</span>
            <span className="text-gray-900">
              {{
                'pt-BR': 'Português (Brasil)',
                'en-US': 'English (US)',
                'es': 'Español'
              }[playerData.settings?.language || 'pt-BR']}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
