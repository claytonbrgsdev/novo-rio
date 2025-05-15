"use client"

import AutoLogin from "@/components/auth/auto-login"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AutoLoginPage() {
  const [message, setMessage] = useState("Conectando automaticamente...")
  const router = useRouter()

  useEffect(() => {
    // Definir timeout para garantir que o usuário seja redirecionado em 5 segundos
    // mesmo se o componente AutoLogin falhar
    const timeout = setTimeout(() => {
      // Criar token e usuário manualmente
      localStorage.setItem("auth_token", "fallback_token_" + Date.now())
      localStorage.setItem("auth_user", JSON.stringify({
        id: 1,
        email: "teste@exemplo.com",
        player_id: 1
      }))
      
      router.replace("/game")
    }, 5000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-paper-100">
      <div className="text-center max-w-md p-8 bg-paper-200 rounded-lg border-2 border-olive-700 shadow-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-olive-700 mx-auto mb-6"></div>
        <h1 className="text-2xl font-bold text-olive-900 mb-4">Modo de Teste</h1>
        <p className="text-olive-800 mb-4">
          Você está sendo conectado automaticamente para testes manuais.
        </p>
        <p className="text-sm text-olive-600">
          Este modo simplificado não requer autenticação para facilitar os testes.
        </p>
      </div>
      
      {/* Componente de AutoLogin que tenta fazer login automaticamente */}
      <AutoLogin />
    </div>
  )
}
