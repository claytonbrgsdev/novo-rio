"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./auth-context"

export default function AutoLogin() {
  const [loading, setLoading] = useState(true)
  const { user, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Função para simular login automático sem interação com o backend
    const autoLogin = async () => {
      try {
        // Verificar se o usuário já está autenticado
        if (user) {
          console.log("Usuário já está autenticado:", user)
          setLoading(false)
          return
        }

        // Simular login criando um token falso e salvando no localStorage
        const mockToken = "mock_token_for_testing_" + Date.now()
        localStorage.setItem("auth_token", mockToken)
        
        // Simular usuário com player_id
        const mockUser = {
          id: 1,
          email: "jogador@exemplo.com",
          player_id: 1
        }
        localStorage.setItem("auth_user", JSON.stringify(mockUser))
        
        // Atualizar o contexto de autenticação
        await refreshUser()
        
        console.log("Login automático realizado com sucesso")
        
        // Redirecionar para a página do jogo
        router.replace("/game")
      } catch (error) {
        console.error("Erro no login automático:", error)
      } finally {
        setLoading(false)
      }
    }

    // Executar login automático quando o componente for montado
    autoLogin()
  }, [user, refreshUser, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-paper-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-700 mx-auto mb-4"></div>
          <p className="text-olive-800 text-lg">Conectando automaticamente...</p>
        </div>
      </div>
    )
  }

  return null
}
