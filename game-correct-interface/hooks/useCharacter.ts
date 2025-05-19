"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { loadCharacterCustomizations } from "@/lib/supabase"

export interface CharacterData {
  id?: string
  name: string
  headId: number
  bodyId: number
  toolId: string
}

export function useCharacter() {
  const { user } = useAuth()
  const [character, setCharacter] = useState<CharacterData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const loadCharacter = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Tentar carregar do Supabase
        const { data, error } = await loadCharacterCustomizations(user.id)

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          // Usar o primeiro personagem
          const characterData: CharacterData = {
            id: data[0].id,
            name: data[0].name,
            headId: data[0].head_id,
            bodyId: data[0].body_id,
            toolId: data[0].tool_id,
          }
          setCharacter(characterData)
        } else {
          // Tentar carregar do localStorage como fallback
          const savedCharacter = localStorage.getItem("character")
          if (savedCharacter) {
            const parsedCharacter = JSON.parse(savedCharacter)
            setCharacter({
              name: parsedCharacter.name,
              headId: parsedCharacter.head || 1,
              bodyId: parsedCharacter.body || 1,
              toolId: parsedCharacter.tool || "shovel",
            })
          } else {
            setCharacter(null)
          }
        }
      } catch (err) {
        console.error("Erro ao carregar personagem:", err)
        setError(err instanceof Error ? err : new Error("Erro desconhecido ao carregar personagem"))

        // Tentar carregar do localStorage como fallback em caso de erro
        try {
          const savedCharacter = localStorage.getItem("character")
          if (savedCharacter) {
            const parsedCharacter = JSON.parse(savedCharacter)
            setCharacter({
              name: parsedCharacter.name,
              headId: parsedCharacter.head || 1,
              bodyId: parsedCharacter.body || 1,
              toolId: parsedCharacter.tool || "shovel",
            })
          }
        } catch (localErr) {
          console.error("Erro ao carregar personagem do localStorage:", localErr)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadCharacter()
  }, [user])

  return { character, isLoading, error, setCharacter }
}
