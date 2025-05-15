"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function DebugPage() {
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Redirecionar automaticamente após 5 segundos
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = "/game?debug=true"
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-amber-100 p-4">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Página de Depuração</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mb-8">
        <h2 className="text-xl font-semibold mb-4 text-amber-700">Opções de Navegação</h2>

        <div className="space-y-4">
          <div>
            <p className="mb-2">Redirecionamento automático em: {countdown} segundos</p>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full" style={{ width: `${((5 - countdown) / 5) * 100}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
              href="/game?debug=true"
              className="bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700"
            >
              Ir para o jogo (Link Next.js)
            </Link>

            <button
              onClick={() => (window.location.href = "/game?debug=true")}
              className="bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
            >
              Ir para o jogo (window.location)
            </button>

            <button
              onClick={() => {
                try {
                  window.open("/game?debug=true", "_self")
                } catch (error) {
                  console.error("Erro ao abrir nova janela:", error)
                }
              }}
              className="bg-purple-600 text-white py-2 px-4 rounded text-center hover:bg-purple-700"
            >
              Ir para o jogo (window.open)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300 max-w-md w-full">
        <h3 className="font-medium text-yellow-800 mb-2">Informações de Depuração</h3>
        <p className="text-sm text-yellow-700">
          Esta página contorna o middleware de autenticação usando o parâmetro <code>debug=true</code>. Use os botões
          acima para testar diferentes métodos de navegação.
        </p>
      </div>
    </div>
  )
}
