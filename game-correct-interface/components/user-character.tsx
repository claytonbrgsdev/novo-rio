"use client"

import { useCharacter } from "@/hooks/useCharacter"
import Character from "./character"
import { Loader2 } from "lucide-react"

interface UserCharacterProps {
  size: "small" | "medium" | "micro"
  showTool?: boolean
  customStyle?: string
}

export default function UserCharacter({ size, showTool = true, customStyle = "" }: UserCharacterProps) {
  const { character, isLoading, error } = useCharacter()

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${customStyle}`}>
        <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
      </div>
    )
  }

  if (error || !character) {
    // Fallback para um personagem padrão em caso de erro
    return <Character size={size} customStyle={customStyle} />
  }

  return (
    <Character
      size={size}
      tool={showTool ? character.toolId : undefined}
      headId={character.headId}
      bodyId={character.bodyId}
      customStyle={customStyle}
    />
  )
}
