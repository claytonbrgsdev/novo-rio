"use client"

import React, { useState, useEffect } from "react"
import { useCharacter } from "@/hooks/useCharacter"
import CharacterDisplay, { ToolId } from "./character-display"

interface UserCharacterProps {
  size?: "small" | "medium" | "large" | "micro"
  showTool?: boolean
  showName?: boolean
}

export default function UserCharacter({ size = "medium", showTool = true, showName = false }: UserCharacterProps) {
  const { character } = useCharacter()
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  useEffect(() => {
    setAvatarLoaded(false)
  }, [character?.id])

  // Map "micro" size to "small" for compatibility with CharacterDisplay
  const mappedSize = size === "micro" ? "small" : (size as "small" | "medium" | "large")

  if (!character) return null
  if (!avatarLoaded) return null

  return (
    <CharacterDisplay 
      key={`${character.body_id}-${character.head_id}-${character.tool_id}`}
      size={mappedSize}
      headId={character.head_id}
      bodyId={character.body_id}
      toolId={character.tool_id as ToolId | undefined}
      showName={showName}
      showTool={showTool}
      onLoad={() => setAvatarLoaded(true)}
    />
  )
}
