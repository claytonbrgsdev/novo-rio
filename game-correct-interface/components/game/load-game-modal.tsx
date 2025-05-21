"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { loadGameSaves, loadGameSave, deleteGameSave } from "@/lib/supabase"
import type { GameSaveData } from "@/lib/supabase"
import { Trash2, X, Download } from "lucide-react"

interface LoadGameModalProps {
  isOpen: boolean
  onClose: () => void
  onLoadGame: (gameState: any) => void
}

export default function LoadGameModal({ isOpen, onClose, onLoadGame }: LoadGameModalProps) {
  const { user } = useAuth()
  const [saves, setSaves] = useState<GameSaveData[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  useEffect(() => {
    if (isOpen && user) {
      fetchSaves()
    }
  }, [isOpen, user])

  const fetchSaves = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await loadGameSaves(user.id)
      if (error) throw error

      setSaves(data || [])
    } catch (error: any) {
      console.error("Erro ao carregar saves:", error)
      setMessage({ type: "error", text: "Erro ao carregar saves. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  const handleLoadGame = async (saveId: string) => {
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await loadGameSave(saveId)
      if (error) throw error
      if (!data) throw new Error("Save não encontrado")

      onLoadGame(data.game_state)
      onClose()
    } catch (error: any) {
      console.error("Erro ao carregar jogo:", error)
      setMessage({ type: "error", text: "Erro ao carregar jogo. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSave = async (saveId: string) => {
    if (!confirm("Tem certeza que deseja excluir este save?")) return

    setLoading(true)
    try {
      const { error } = await deleteGameSave(saveId)
      if (error) throw error

      // Atualizar lista de saves
      setSaves(saves.filter((save) => save.id !== saveId))
      setMessage({ type: "success", text: "Save excluído com sucesso!" })
    } catch (error: any) {
      console.error("Erro ao excluir save:", error)
      setMessage({ type: "error", text: "Erro ao excluir save. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 font-handwritten">
      <div className="bg-paper-200 text-olive-900 p-6 rounded-lg max-w-md w-full border-2 border-olive-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Carregar Jogo</h2>
          <button
            onClick={onClose}
            className="text-olive-700 hover:text-olive-900 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded mb-4 border-2 ${message.type === "error" ? "bg-red-100 text-red-700 border-red-700" : "bg-green-100 text-green-700 border-green-700"}`}
          >
            {message.text}
          </div>
        )}

        {loading && <div className="text-center py-4">Carregando saves...</div>}

        {!loading && saves.length === 0 && (
          <div className="text-center py-4 text-olive-700">
            Nenhum save encontrado. Comece um novo jogo e salve seu progresso.
          </div>
        )}

        {!loading && saves.length > 0 && (
          <div className="max-h-80 overflow-y-auto">
            <ul className="space-y-2">
              {saves.map((save) => (
                <li
                  key={save.id}
                  className="bg-paper-300 p-3 rounded-md flex justify-between items-center border border-olive-300"
                >
                  <div>
                    <div className="font-medium">{save.save_name}</div>
                    <div className="text-xs text-olive-700">{new Date(save.updated_at!).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadGame(save.id!)}
                      className="p-1.5 bg-olive-600 text-white rounded hover:bg-olive-700 transition-colors"
                      title="Carregar"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSave(save.id!)}
                      className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-olive-600 text-white py-2 rounded hover:bg-olive-700 transition-colors hand-drawn-button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
