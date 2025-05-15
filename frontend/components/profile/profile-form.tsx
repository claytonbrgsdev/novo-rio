"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { apiService } from "@/services/api"
import type { UserProfile } from "@/types/player"

export default function ProfileForm() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [username, setUsername] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      setLoading(true)
      try {
        const data = await apiService.get<UserProfile>(`/players/${user.id}/profile`)
        setProfile(data)
        setUsername(data.username || "")
        setAvatarUrl(data.avatar_url || "")
      } catch (error: any) {
        console.error("Erro ao carregar perfil:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const updatedProfile: UserProfile = {
        id: profile?.id,
        user_id: user.id,
        username,
        avatar_url: avatarUrl,
        game_data: profile?.game_data || {},
      }

      await apiService.put<UserProfile>(`/players/${user.id}/profile`, updatedProfile)

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro ao atualizar perfil" })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Você precisa estar logado para acessar esta página.</div>
  }

  return (
    <div className="bg-amber-100 p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold text-amber-900 mb-6">Seu Perfil</h2>

      {message && (
        <div
          className={`p-3 rounded mb-4 ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-amber-800 mb-1">
            Nome de Usuário
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="avatarUrl" className="block text-amber-800 mb-1">
            URL do Avatar (opcional)
          </label>
          <input
            id="avatarUrl"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar Perfil"}
        </button>
      </form>
    </div>
  )
}
