"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { CharacterDisplay } from "./character-display"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "./error-boundary"
import { useCharacter } from "@/hooks/useCharacter"
import { cn } from "@/lib/utils"
import { DEFAULT_HEAD, DEFAULT_BODY, DEFAULT_TOOL } from "@/constants/character"

type ToolId = 'shovel' | 'sickle' | 'machete' | 'watering_can'

interface CharacterPanelProps {
  className?: string
  currentView?: string
  onViewChange?: (view: string) => void
  activeQuadrant?: string | null
  isQuadrantExpanded?: boolean
}

export function CharacterPanel({ 
  className, 
  currentView, 
  onViewChange, 
  activeQuadrant, 
  isQuadrantExpanded = false 
}: CharacterPanelProps) {
  const router = useRouter()
  const { character, isLoading: isFetching } = useCharacter()
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [shouldShowCharacter, setShouldShowCharacter] = useState(false)
  const prevCharacterId = useRef<string | null>(null)

  // Handle character changes and loading states
  useEffect(() => {
    if (character?.id) {
      setShouldShowCharacter(true)
      // Only reset avatar loaded state if we have a new character
      if (String(character.id) !== prevCharacterId.current) {
        setAvatarLoaded(false)
        prevCharacterId.current = String(character.id)
      }
    } else {
      setShouldShowCharacter(false)
      setAvatarLoaded(false)
      prevCharacterId.current = null
    }
  }, [character?.id])

  const isReady = !!character && avatarLoaded

  const handleCreateCharacter = () => {
    router.push("/character-creation")
  }

  return (
    <div className={cn(
      "relative flex flex-col h-full bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg",
      "border border-amber-200 overflow-hidden",
      "transition-all duration-300",
      className
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-amber-50">
        <h2 className="text-lg font-bold text-amber-900 flex items-center justify-between">
          <span>Personagem</span>
          {isReady && character && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                Nível 1
              </span>
            </div>
          )}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        {isFetching ? (
          <div className="h-full flex items-center justify-center">
            <Skeleton className="h-32 w-32 rounded-full" />
          </div>
        ) : shouldShowCharacter ? (
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
                  {character && (
                    <CharacterDisplay 
                      size="large"
                      headId={character.head_id}
                      bodyId={character.body_id}
                      toolId={character.tool_id as ToolId}
                      showName={false}
                      showTool={true}
                      className="w-full h-full"
                      key={`char-display-${character.id}`}
                      onLoad={() => setAvatarLoaded(true)}
                      onError={(error) => {
                        console.error("Character display error:", error)
                        setAvatarLoaded(false)
                      }}
                      isQuadrantExpanded={false}
                    />
                  )}
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
                showName={false}
                showTool={false}
                className="opacity-50"
                isQuadrantExpanded={false}
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
