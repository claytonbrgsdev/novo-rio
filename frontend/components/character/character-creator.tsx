"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { apiService } from "@/services/api"
import type { CharacterCustomization } from "@/types/game"

// Opções de personalização
const headOptions = [
  { id: 1, name: "Cabeça Redonda" },
  { id: 2, name: "Cabeça Quadrada" },
  { id: 3, name: "Cabeça Oval" },
]

const bodyOptions = [
  { id: 1, name: "Corpo Padrão" },
  { id: 2, name: "Corpo Robusto" },
  { id: 3, name: "Corpo Esbelto" },
]

const toolOptions = [
  { id: "shovel", name: "Pá" },
  { id: "hoe", name: "Enxada" },
  { id: "watering_can", name: "Regador" },
]

export default function CharacterCreator() {
  const { user } = useAuth()
  const [characters, setCharacters] = useState<CharacterCustomization[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterCustomization | null>(null)
  const [name, setName] = useState("")
  const [headId, setHeadId] = useState(1)
  const [bodyId, setBodyId] = useState(1)
  const [toolId, setToolId] = useState("shovel")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)

  useEffect(() => {
    const fetchCharacters = async () => {
      if (!user) return

      setLoading(true)
      try {
        if (!user) throw new Error("Usuário não autenticado")
        const data = await apiService.get<CharacterCustomization[]>(`/players/${user.id}/characters`)

        if (data && data.length > 0) {
          setCharacters(data)
          setSelectedCharacter(data[0])
          setName(data[0].name || "")
          setHeadId(data[0].head_id || 1)
          setBodyId(data[0].body_id || 1)
          setToolId(data[0].tool_id || "shovel")
        }
      } catch (error: any) {
        console.error("Erro ao carregar personagens:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCharacters()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage(null)

    try {
      const character: CharacterCustomization = {
        id: selectedCharacter?.id,
        user_id: user.id,
        name,
        head_id: headId,
        body_id: bodyId,
        tool_id: toolId,
      }

      if (!user) throw new Error("Usuário não autenticado")
      
      if (selectedCharacter?.id) {
        // Atualizar personagem existente
        await apiService.put<CharacterCustomization>(`/players/${user.id}/characters/${selectedCharacter.id}`, character)
      } else {
        // Criar novo personagem
        await apiService.post<CharacterCustomization>(`/players/${user.id}/characters`, character)
      }

      setMessage({ type: "success", text: "Personagem salvo com sucesso!" })

      // Recarregar personagens
      const data = await apiService.get<CharacterCustomization[]>(`/players/${user.id}/characters`)
      if (data) {
        setCharacters(data)
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro ao salvar personagem" })
    } finally {
      setLoading(false)
    }
  }

  const handleNewCharacter = () => {
    setSelectedCharacter(null)
    setName("")
    setHeadId(1)
    setBodyId(1)
    setToolId("shovel")
  }

  const handleSelectCharacter = (character: CharacterCustomization) => {
    setSelectedCharacter(character)
    setName(character.name || "")
    setHeadId(character.head_id || 1)
    setBodyId(character.body_id || 1)
    setToolId(character.tool_id || "shovel")
  }

  if (!user) {
    return <div>Você precisa estar logado para acessar esta página.</div>
  }

  return (
    <div className="bg-amber-100 p-6 rounded-lg shadow-lg max-w-4xl w-full">
      <h2 className="text-2xl font-bold text-amber-900 mb-6">Criação de Personagem</h2>

      {message && (
        <div
          className={`p-3 rounded mb-4 ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Lista de personagens */}
        <div className="w-full md:w-1/3">
          <h3 className="text-lg font-medium text-amber-800 mb-3">Seus Personagens</h3>
          <div className="bg-amber-50 p-3 rounded-md mb-3 max-h-60 overflow-y-auto">
            {characters.length > 0 ? (
              <ul className="space-y-2">
                {characters.map((char) => (
                  <li
                    key={char.id}
                    className={`p-2 rounded cursor-pointer ${selectedCharacter?.id === char.id ? "bg-amber-300" : "bg-amber-200 hover:bg-amber-300"}`}
                    onClick={() => handleSelectCharacter(char)}
                  >
                    {char.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-amber-700 text-sm">Nenhum personagem criado ainda.</p>
            )}
          </div>
          <button
            onClick={handleNewCharacter}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
          >
            Novo Personagem
          </button>
        </div>

        {/* Formulário de personalização */}
        <div className="w-full md:w-2/3">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-amber-800 mb-1">
                Nome do Personagem
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-amber-800 mb-1">Tipo de Cabeça</label>
                <select
                  value={headId}
                  onChange={(e) => setHeadId(Number(e.target.value))}
                  className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {headOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-amber-800 mb-1">Tipo de Corpo</label>
                <select
                  value={bodyId}
                  onChange={(e) => setBodyId(Number(e.target.value))}
                  className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {bodyOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-amber-800 mb-1">Ferramenta Inicial</label>
                <select
                  value={toolId}
                  onChange={(e) => setToolId(e.target.value)}
                  className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {toolOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visualização do personagem */}
            <div className="bg-amber-50 p-4 rounded-md mb-6 flex justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 bg-amber-500 rounded-full opacity-20"></div>
                <div className="absolute inset-4 bg-amber-400 rounded-full opacity-30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Cabeça - varia com headId */}
                    <div
                      className={`w-20 h-20 bg-amber-100 ${headId === 1 ? "rounded-full" : headId === 2 ? "rounded-md" : "rounded-[40%]"} flex items-top justify-center`}
                    >
                      <div className="w-2 h-2 bg-stone-800 rounded-full absolute top-0 left-6"></div>
                      <div className="w-2 h-2 bg-stone-800 rounded-full absolute top-0 right-6"></div>
                      <div className="w-4 h-1 bg-stone-800 rounded-full absolute top-12 left-8"></div>
                    </div>

                    {/* Corpo - varia com bodyId */}
                    <div
                      className={`w-24 h-28 bg-amber-100 mt-2 rounded-md flex items-center justify-center relative ${
                        bodyId === 2 ? "w-28" : bodyId === 3 ? "w-20" : "w-24"
                      }`}
                    >
                      <div className="absolute top-4 left-4 w-3 h-3 bg-green-800 rounded-full"></div>
                      <div className="absolute top-4 right-4 w-3 h-3 bg-green-800 rounded-full"></div>
                      <div className="absolute top-12 left-6 w-3 h-3 bg-green-800 rounded-full"></div>
                      <div className="absolute top-12 right-6 w-3 h-3 bg-green-800 rounded-full"></div>
                    </div>

                    {/* Braços */}
                    <div className="absolute top-24 left-0 w-4 h-14 bg-amber-100 rounded-full"></div>
                    <div className="absolute top-24 right-0 w-4 h-14 bg-amber-100 rounded-full"></div>

                    {/* Ferramenta - varia com toolId */}
                    {toolId === "shovel" && (
                      <div className="absolute top-20 right-[-15px] w-2 h-24 bg-amber-900 rounded-full transform rotate-12"></div>
                    )}
                    {toolId === "hoe" && (
                      <div className="absolute top-20 right-[-20px] w-2 h-24 bg-amber-900 rounded-full transform rotate-45">
                        <div className="absolute top-0 right-0 w-10 h-2 bg-stone-600 rounded-sm transform rotate-90"></div>
                      </div>
                    )}
                    {toolId === "watering_can" && (
                      <div className="absolute top-20 right-[-20px] w-8 h-10 bg-blue-600 rounded-sm transform rotate-12"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Personagem"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
