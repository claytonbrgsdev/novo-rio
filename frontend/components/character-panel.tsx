"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ViewType } from "@/lib/types"
import CharacterDisplay, { type ToolId } from "./character-display"
import { useCharacter } from "@/hooks/useCharacter"
import { Skeleton } from "@/components/ui/skeleton"
import { DEFAULT_HEAD, DEFAULT_BODY, DEFAULT_TOOL } from "@/constants/character"
import { ErrorBoundary } from "./error-boundary"

interface CharacterPanelProps {
  currentView?: ViewType
  onViewChange?: (view: ViewType) => void
  activeQuadrant?: string | null
  isQuadrantExpanded?: boolean
}

export default function CharacterPanel({ 
  currentView, 
  onViewChange, 
  activeQuadrant = null,
  isQuadrantExpanded = false
}: CharacterPanelProps = {}) {
  const router = useRouter()
  const { character, isLoading: isFetching } = useCharacter()
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  useEffect(() => {
    setAvatarLoaded(false)
  }, [character?.id])

  const hasCharacter = !!character
  const isReady = hasCharacter && avatarLoaded;

  const handleCreateCharacter = () => {
    router.push('/character')
  }

  return (
    <div className=" flex flex-col bg-gradient-to-b from-paper-50 to-paper-100 font-handwritten shadow-md rounded-md overflow-hidden">
      {/* Character Header */}
      <div className="h-16 bg-gradient-to-r from-amber-700 to-amber-600 text-white px-4 py-3 text-xl font-bold flex items-center justify-center">
        <h3 className="panel-title uppercase tracking-wide">
          {isFetching ? 'Carregando...' : (character?.name || 'Meu Personagem')}
        </h3>
      </div>
      
      <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-paper-100 to-paper-300 m-0">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-[url('/pattern-leaves.svg')] bg-repeat opacity-10 animate-float-slow"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-transparent"></div>
        </div>
        
        {isFetching ? (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        ) : hasCharacter ? (
          /* Character display */
          <div className="relative w-full h-full z-10 flex flex-col items-center justify-center">
            <div className="relative w-full flex-1 flex items-center justify-center">
              <ErrorBoundary 
                fallback={
                  <div className="text-center p-4 text-red-600 bg-white/80 rounded-lg shadow-inner">
                    Erro ao carregar o avatar
                  </div>
                }
              >
                <div className="w-full h-full px-4 pb-4 pt-2">
                  <CharacterDisplay 
                    size="large"
                    headId={character?.head_id}
                    bodyId={character?.body_id}
                    toolId={character?.tool_id as ToolId | undefined}
                    showName={false}
                    showTool
                    className="w-full h-full"
                    key={`${character?.body_id}-${character?.head_id}-${character?.tool_id}`}
                    onLoad={() => setAvatarLoaded(true)}
                    onError={(error) => {
                      console.error('Character display error:', error)
                    }}
                    isQuadrantExpanded={isQuadrantExpanded}
                  />
                </div>
              </ErrorBoundary>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-4">
              <CharacterDisplay
                size="large"
                headId={DEFAULT_HEAD}
                bodyId={DEFAULT_BODY}
                toolId={DEFAULT_TOOL}
              />
            </div>
            <p className="text-amber-800 mb-4">Você ainda não criou um personagem.</p>
            <button
              onClick={handleCreateCharacter}
              className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              aria-label="Criar personagem"
            >
              Criar Personagem
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
