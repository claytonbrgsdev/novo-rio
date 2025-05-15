"use client"

import CharacterDisplay from "./character-display"

interface UserCharacterProps {
  size?: "small" | "medium" | "large" | "micro"
  showTool?: boolean
  showName?: boolean
}

export default function UserCharacter({ size = "medium", showTool = true, showName = false }: UserCharacterProps) {
  // Mapear o tamanho "micro" para "small" para compatibilidade com CharacterDisplay
  const mappedSize = size === "micro" ? "small" : (size as "small" | "medium" | "large")

  return <CharacterDisplay size={mappedSize} showTool={showTool} showName={showName} />
}
