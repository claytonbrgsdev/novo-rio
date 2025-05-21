"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function TransitionPage() {
  const { user, loading: authLoading } = useAuth()
  const [countdown, setCountdown] = useState(3)
  const [characterData, setCharacterData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState({
    auth: { done: false, error: false },
    character: { done: false, error: false },
    gameData: { done: false, error: false },
  })

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!authLoading) {
      setLoadingSteps((prev) => ({
        ...prev,
        auth: { done: true, error: !user },
      }))

      if (!user) {
        setError("Você precisa estar autenticado para acessar esta página.")
        setTimeout(() => {
          window.location.href = "/auth?redirected=true&from=transition"
        }, 2000)
        return
      }

      // Recuperar dados do personagem do localStorage
      try {
        const savedCharacter = localStorage.getItem("character")
        if (savedCharacter) {
          const parsedCharacter = JSON.parse(savedCharacter)
          setCharacterData(parsedCharacter)
          setLoadingSteps((prev) => ({
            ...prev,
            character: { done: true, error: false },
          }))
        } else {
          // Se não houver dados, redirecionar para a criação de personagem
          setLoadingSteps((prev) => ({
            ...prev,
            character: { done: true, error: true },
          }))
          setError("Nenhum personagem encontrado. Redirecionando para a criação de personagem...")
          setTimeout(() => {
            window.location.href = "/character"
          }, 2000)
          return
        }
      } catch (err) {
        console.error("Erro ao carregar dados do personagem:", err)
        setLoadingSteps((prev) => ({
          ...prev,
          character: { done: true, error: true },
        }))
        setError("Erro ao carregar dados do personagem. Redirecionando para a criação de personagem...")

        setTimeout(() => {
          window.location.href = "/character"
        }, 2000)
        return
      }

      // Simular carregamento de dados do jogo
      setTimeout(() => {
        setLoadingSteps((prev) => ({
          ...prev,
          gameData: { done: true, error: false },
        }))
        setIsLoading(false)

        // Iniciar contagem regressiva
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              // Redirecionar para o jogo após a contagem regressiva
              window.location.href = "/game"
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      }, 1500)
    }
  }, [user, authLoading])

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-amber-800 mb-6">Preparando seu jogo...</h1>

          <div className="space-y-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {loadingSteps.auth.done ? (
                  loadingSteps.auth.error ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )
                ) : (
                  <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-left font-medium">Verificando autenticação</p>
                {loadingSteps.auth.error && <p className="text-left text-sm text-red-500">Falha na autenticação</p>}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {loadingSteps.character.done ? (
                  loadingSteps.character.error ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )
                ) : (
                  <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-left font-medium">Carregando personagem</p>
                {loadingSteps.character.error && (
                  <p className="text-left text-sm text-red-500">Personagem não encontrado</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {loadingSteps.gameData.done ? (
                  loadingSteps.gameData.error ? (
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )
                ) : (
                  <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
                )}
              </div>
              <p className="text-left font-medium">Preparando dados do jogo</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-600 h-full transition-all duration-500"
              style={{
                width: `${
                  ((loadingSteps.auth.done ? 1 : 0) +
                    (loadingSteps.character.done ? 1 : 0) +
                    (loadingSteps.gameData.done ? 1 : 0)) *
                  33.33
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-100 p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-amber-800 mb-4">Oops!</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <a
            href="/character"
            className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors inline-block cursor-pointer"
          >
            Criar Personagem
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Preparando seu personagem...</h1>

        {characterData && (
          <div className="bg-amber-50 p-4 rounded-lg mb-6">
            <h2 className="font-semibold text-amber-800 mb-2">Dados do Personagem:</h2>
            <p>
              <span className="font-medium">Nome:</span> {characterData.name || "Aventureiro"}
            </p>
            <p>
              <span className="font-medium">Corpo:</span> {characterData.body}
            </p>
            <p>
              <span className="font-medium">Cabeça:</span> {characterData.head}
            </p>
            <p>
              <span className="font-medium">Criado em:</span> {new Date(characterData.createdAt).toLocaleString()}
            </p>
          </div>
        )}

        <p className="text-lg text-amber-700 mb-4">
          Entrando no jogo em <span className="font-bold">{countdown}</span> segundos...
        </p>

        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-amber-600 h-full transition-all duration-1000"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center">
          <a
            href="/character"
            className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors cursor-pointer"
          >
            Voltar
          </a>

          <button
            onClick={() => {
              // Forçar redirecionamento direto
              window.location.href = "/game?debug=true"
            }}
            className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors cursor-pointer"
            type="button"
          >
            ⚡ Acesso Rápido
          </button>

          <a
            href="/game"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors cursor-pointer"
          >
            Entrar Agora
          </a>
        </div>
      </div>
    </div>
  )
}
