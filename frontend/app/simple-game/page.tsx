"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Home } from "lucide-react"

// Versão simplificada do jogo para testes
export default function SimpleGamePage() {
  const [characterData, setCharacterData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Carregar dados do personagem do localStorage
    try {
      const savedCharacter = localStorage.getItem("character")
      if (savedCharacter) {
        setCharacterData(JSON.parse(savedCharacter))
      }
    } catch (err) {
      console.error("Erro ao carregar dados do personagem:", err)
    }

    // Simular tempo de carregamento
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleSaveGame = () => {
    try {
      // Salvar estado do jogo no localStorage
      const gameState = {
        character: characterData,
        lastSaved: new Date().toISOString(),
        position: "C2",
        inventory: ["Pá", "Sementes", "Água"],
      }
      localStorage.setItem("gameState", JSON.stringify(gameState))
      setMessage("Jogo salvo com sucesso!")

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      console.error("Erro ao salvar jogo:", err)
      setMessage("Erro ao salvar jogo!")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-100">
        <div className="w-16 h-16 border-t-4 border-amber-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <Link href="/" className="bg-amber-700 hover:bg-amber-600 p-2 rounded-full mr-4 transition-colors">
              <ArrowLeft className="h-6 w-6 text-white" />
            </Link>
            <h1 className="text-3xl font-bold text-amber-800">Jogo Simplificado</h1>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveGame}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded flex items-center gap-2"
            >
              <Save className="h-5 w-5" />
              Salvar Jogo
            </button>

            <Link
              href="/"
              className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded flex items-center gap-2"
            >
              <Home className="h-5 w-5" />
              Menu Principal
            </Link>
          </div>
        </div>

        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">Seu Personagem</h2>

          {characterData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="mb-2">
                  <span className="font-bold">Nome:</span> {characterData.name || "Aventureiro"}
                </p>
                <p className="mb-2">
                  <span className="font-bold">Corpo:</span> {characterData.body}
                </p>
                <p className="mb-2">
                  <span className="font-bold">Cabeça:</span> {characterData.head}
                </p>
                <p className="mb-2">
                  <span className="font-bold">Criado em:</span> {new Date(characterData.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="font-bold text-amber-800 mb-2">Inventário</h3>
                <ul className="list-disc pl-5">
                  <li>Pá</li>
                  <li>Sementes de Abóbora</li>
                  <li>Regador</li>
                  <li>Fertilizante</li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-amber-800">Nenhum personagem encontrado. Por favor, crie um personagem primeiro.</p>
          )}
        </div>

        <div className="bg-amber-200 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-amber-800 mb-4">Área de Jogo</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className="aspect-square bg-green-600 rounded-lg flex items-center justify-center hover:bg-green-500 cursor-pointer transition-colors"
              >
                {i === 5 && characterData ? (
                  <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-amber-800 font-bold">{characterData.name?.charAt(0) || "A"}</span>
                  </div>
                ) : (
                  <span className="text-green-200">Lote {i}</span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center text-amber-800">
            <p>Esta é uma versão simplificada do jogo para testes.</p>
            <p>Seu personagem foi carregado com sucesso!</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/game"
            className="bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg text-lg inline-block"
          >
            Ir para o Jogo Completo
          </Link>
        </div>
      </div>
      <div className="mt-12 text-amber-300 text-sm">Versão 1.0.0 • Novo Rio</div>
    </div>
  )
}
