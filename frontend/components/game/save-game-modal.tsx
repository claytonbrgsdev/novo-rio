"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { apiService } from "@/services/api"
import type { GameSaveData } from "@/types/game"
import { Save, Trash2, X } from "lucide-react"

interface SaveGameModalProps {
  isOpen: boolean
  onClose: () => void
  characterData: any
  onSave: (saveData: any) => void
}

export default function SaveGameModal({ isOpen, onClose, characterData, onSave }: SaveGameModalProps) {
  const { user } = useAuth()
  const [saveName, setSaveName] = useState("")
  const [existingSaves, setExistingSaves] = useState<GameSaveData[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSaves, setLoadingSaves] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const [showExistingSaves, setShowExistingSaves] = useState(false)

  // Carregar saves existentes
  const fetchExistingSaves = async () => {
    if (!user) return

    setLoadingSaves(true)
    try {
      if (!user) throw new Error("Usuário não autenticado")
      const data = await apiService.get<GameSaveData[]>(`/players/${user.id}/saves`)

      setExistingSaves(data || [])
      setShowExistingSaves(true)
    } catch (error: any) {
      console.error("Erro ao carregar saves:", error)
      setMessage({ type: "error", text: "Erro ao carregar saves existentes." })
    } finally {
      setLoadingSaves(false)
    }
  }

  // Salvar jogo
  const handleSaveGame = async () => {
    if (!user) return
    if (!saveName.trim()) {
      setMessage({ type: "error", text: "Por favor, digite um nome para o save." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      if (!user) throw new Error("Usuário não autenticado")
      const saveData = {
        save_name: saveName,
        game_state: characterData,
      }

      await apiService.post(`/players/${user.id}/saves`, saveData)

      setMessage({ type: "success", text: "Jogo salvo com sucesso!" })
      setSaveName("")
      onSave(saveData)

      // Recarregar saves após salvar
      fetchExistingSaves()
    } catch (error: any) {
      console.error("Erro ao salvar jogo:", error)
      setMessage({ type: "error", text: "Erro ao salvar jogo. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  // Sobrescrever save existente
  const handleOverwriteSave = async (saveId: number) => {
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      if (!user) throw new Error("Usuário não autenticado")
      const saveData = {
        save_name: existingSaves.find((save) => save.id === saveId)?.save_name || "Save sobrescrito",
        game_state: characterData,
      }

      await apiService.put(`/players/${user.id}/saves/${saveId}`, saveData)

      setMessage({ type: "success", text: "Save sobrescrito com sucesso!" })
      onSave(saveData)

      // Recarregar saves após sobrescrever
      fetchExistingSaves()
    } catch (error: any) {
      console.error("Erro ao sobrescrever save:", error)
      setMessage({ type: "error", text: "Erro ao sobrescrever save. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  // Excluir save
  const handleDeleteSave = async (saveId: number) => {
    if (!confirm("Tem certeza que deseja excluir este save?")) return

    setLoading(true)
    try {
      if (!user) throw new Error("Usuário não autenticado")
      await apiService.delete(`/players/${user.id}/saves/${saveId}`)

      // Atualizar lista de saves
      setExistingSaves(existingSaves.filter((save) => save.id !== saveId))
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
          <h2 className="text-2xl font-bold">Salvar Jogo</h2>
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

        <div className="mb-6">
          <label htmlFor="saveName" className="block text-olive-800 mb-1">
            Nome do Save
          </label>
          <input
            id="saveName"
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="w-full p-2 border-2 border-olive-300 rounded focus:outline-none focus:ring-2 focus:ring-olive-500 bg-paper-100"
            placeholder="Ex: Fazenda Dia 10"
          />
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleSaveGame}
            disabled={loading}
            className="flex-1 bg-olive-600 text-white py-2 px-4 rounded hover:bg-olive-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 hand-drawn-button"
          >
            {loading ? "Salvando..." : "Salvar Novo"}
            <Save className="h-5 w-5" />
          </button>

          <button
            onClick={fetchExistingSaves}
            disabled={loadingSaves}
            className="flex-1 bg-olive-600 text-white py-2 px-4 rounded hover:bg-olive-700 transition-colors disabled:opacity-50 hand-drawn-button"
          >
            {loadingSaves ? "Carregando..." : "Ver Saves Existentes"}
          </button>
        </div>

        {showExistingSaves && (
          <div>
            <h3 className="font-medium mb-2">Saves Existentes</h3>
            {existingSaves.length > 0 ? (
              <div className="max-h-60 overflow-y-auto bg-paper-100 rounded-md p-2 border border-olive-300">
                <ul className="space-y-2">
                  {existingSaves.map((save) => (
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
                          onClick={() => handleOverwriteSave(save.id)}
                          className="p-1.5 bg-olive-500 text-white rounded hover:bg-olive-600 transition-colors"
                          title="Sobrescrever"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSave(save.id)}
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
            ) : (
              <p className="text-olive-700 text-sm">Nenhum save encontrado.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
