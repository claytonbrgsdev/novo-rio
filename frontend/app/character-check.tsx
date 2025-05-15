"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { apiService } from "@/services/api"
import type { CharacterCustomization } from "@/types/game"

export default function CharacterCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkForCharacters = async () => {
      if (!user) return

      try {
        if (!user) return

        const data = await apiService.get<CharacterCustomization[]>(`/players/${user.id}/characters`)
        
        // If user has no characters, redirect to character creation
        if (!data || data.length === 0) {
          router.push("/character")
        }
      } catch (error) {
        console.error("Failed to check for characters:", error)
      }
    }

    checkForCharacters()
  }, [user, router])

  return <>{children}</>
}
