"use client"

import React, { useState, useEffect } from "react"
import { useCharacter } from "@/hooks/useCharacter"
import CharacterDisplay, { ToolId } from "./character-display"
import { Skeleton } from "@/components/ui/skeleton"

interface UserCharacterProps {
  size?: "small" | "medium" | "large" | "micro"
  showTool?: boolean
  showName?: boolean
  className?: string
}

export default function UserCharacter({ 
  size = "medium", 
  showTool = true, 
  showName = false, 
  className = "" 
}: UserCharacterProps) {
  const { character, isLoading } = useCharacter()
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Reset loading and error states when character changes
  useEffect(() => {
    if (character?.id) {
      setAvatarLoaded(false)
      setHasError(false)
    }
  }, [character?.id])

  // Map "micro" size to "small" for compatibility with CharacterDisplay
  const mappedSize = size === "micro" ? "small" : (size as "small" | "medium" | "large")

  // Show loading skeleton if still loading
  if (isLoading) {
    const skeletonSize = size === "small" ? "h-16 w-12" : 
                         size === "medium" ? "h-24 w-16" : 
                         "h-32 w-24"
    return <Skeleton className={`${skeletonSize} rounded-lg ${className}`} />
  }

  // Return null if no character or there was an error loading the avatar
  if (!character || hasError) return null

  // Define minimum dimensions based on size prop
  const getMinDimensions = () => {
    switch (size) {
      case 'small':
        return 'min-w-[48px] min-h-[64px]' // 3:4 aspect ratio
      case 'medium':
        return 'min-w-[64px] min-h-[85px]' // 3:4 aspect ratio
      case 'large':
        return 'min-w-[96px] min-h-[128px]' // 3:4 aspect ratio
      case 'micro':
      default:
        return 'min-w-[32px] min-h-[42px]' // 3:4 aspect ratio
    }
  }

  // Combine the provided className with our minimum dimensions
  const containerClasses = `${className || ''} ${getMinDimensions()} flex items-center justify-center`

  return (
    <div className={containerClasses}>
      <CharacterDisplay 
        key={`${character.body_id}-${character.head_id}-${character.tool_id}`}
        size={mappedSize}
        headId={character.head_id}
        bodyId={character.body_id}
        toolId={character.tool_id as ToolId | undefined}
        showName={showName}
        showTool={showTool}
        onLoad={() => setAvatarLoaded(true)}
        onError={() => setHasError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  )
}
