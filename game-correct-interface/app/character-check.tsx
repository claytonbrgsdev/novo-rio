"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { loadCharacterCustomizations } from "@/lib/supabase"

export default function CharacterCheck({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkForCharacters = async () => {
      if (!user) return

      try {
        const { data, error } = await loadCharacterCustomizations(user.id)

        if (error) {
          console.error("Error checking for characters:", error)
          return
        }

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
