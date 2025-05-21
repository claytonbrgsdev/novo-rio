"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Home, ArrowLeft } from "lucide-react"

export default function ErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorType = searchParams.get("type") || "unknown"
  const from = searchParams.get("from") || "/"
  const [errorMessage, setErrorMessage] = useState<string>("Ocorreu um erro inesperado.")
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Definir mensagem de erro com base no tipo
    switch (errorType) {
      case "auth":
        setErrorMessage("Erro de autenticação. Por favor, faça login novamente.")
        break
      case "character":
        setErrorMessage("Erro ao carregar personagem. Por favor, crie um novo personagem.")
        break
      case "permission":
        setErrorMessage("Você não tem permissão para acessar esta página.")
        break
      case "not_found":
        setErrorMessage("A página que você está procurando não foi encontrada.")
        break
      default:
        setErrorMessage("Ocorreu um erro inesperado. Por favor, tente novamente.")
    }

    // Iniciar contagem regressiva para redirecionamento
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          // Redirecionar para a página inicial após a contagem regressiva
          router.push("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [errorType, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-amber-800 mb-4">Oops!</h1>

        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-6 w-6 mr-2 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>

        <p className="text-amber-700 mb-6">
          Redirecionando para a página inicial em <span className="font-bold">{countdown}</span> segundos...
        </p>

        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-6">
          <div
            className="bg-amber-600 h-full transition-all duration-1000"
            style={{ width: `${((5 - countdown) / 5) * 100}%` }}
          ></div>
        </div>

        <div className="flex justify-between">
          <Link
            href={from}
            className="bg-amber-600 text-white py-2 px-4 rounded hover:bg-amber-700 transition-colors flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Link>

          <Link
            href="/"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center"
          >
            <Home className="h-4 w-4 mr-1" />
            Página Inicial
          </Link>
        </div>
      </div>
    </div>
  )
}
