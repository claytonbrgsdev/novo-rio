"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-context"
import { AlertCircle, Loader2 } from "lucide-react"
import HandDrawnButton from "@/components/hand-drawn/button"
import { authService } from "@/services/auth"

type AuthView = "sign-in" | "sign-up" | "forgot-password"

export default function AuthForm() {
  const [view, setView] = useState<AuthView>("sign-in")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirected = searchParams?.get("redirected")
  const fromPath = searchParams?.get("from") || "/character"
  const { refreshUser } = useAuth()

  // Usando nosso serviço de autenticação personalizado em vez do Supabase

  useEffect(() => {
    // Se o usuário foi redirecionado, mostrar mensagem
    if (redirected === "true") {
      setMessage({
        type: "success",
        text: "Para jogar Novo Rio, você precisa criar uma conta ou fazer login.",
      })
    }
  }, [redirected])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await authService.login(email, password)
      
      // Atualizar o contexto de autenticação
      await refreshUser()

      // Redirect to the page the user was trying to access, or character page by default
      window.location.href = fromPath // Usando window.location para garantir navegação completa
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      setMessage({
        type: "error",
        text: "Credenciais inválidas. Verifique seu email e senha."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await authService.register(email, password)

      // Para simplificar, vamos fazer login automaticamente após o registro
      await refreshUser()
      
      window.location.href = fromPath // Redirecionar para a página principal após o registro
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)
      setMessage({
        type: "error",
        text: "Este email já está registrado ou ocorreu um erro ao criar a conta."
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      // Simplificado: apenas uma mensagem de feedback para o usuário
      // Em uma implementação real, você enviaria um email com um link para redefinir a senha
      setMessage({
        type: "success",
        text: "Esta funcionalidade está desativada durante o teste. Por favor, crie uma nova conta.",
      })
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error)
      setMessage({ type: "error", text: "Erro ao solicitar redefinição de senha" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-paper-200 p-6 rounded-lg shadow-lg max-w-md w-full border-2 border-olive-700">
      <h2 className="text-2xl font-bold text-olive-900 mb-6 text-center">
        {view === "sign-in" ? "Entrar" : view === "sign-up" ? "Criar Conta" : "Recuperar Senha"}
      </h2>

      {message && (
        <div
          className={`p-3 rounded-md mb-4 flex items-start gap-2 border-2 ${
            message.type === "error"
              ? "bg-red-100 text-red-700 border-red-700"
              : "bg-green-100 text-green-700 border-green-700"
          }`}
        >
          {message.type === "error" ? <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> : null}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={view === "sign-in" ? handleSignIn : view === "sign-up" ? handleSignUp : handleForgotPassword}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-olive-800 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border-2 border-olive-400 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500 bg-paper-100"
            required
            disabled={loading}
          />
        </div>

        {view !== "forgot-password" && (
          <div className="mb-6">
            <label htmlFor="password" className="block text-olive-800 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border-2 border-olive-400 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-500 bg-paper-100"
              required
              disabled={loading}
              minLength={6}
            />
            {view === "sign-up" && (
              <p className="text-xs text-olive-700 mt-1">A senha deve ter pelo menos 6 caracteres</p>
            )}
          </div>
        )}

        <HandDrawnButton
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center"
          variant={loading ? "disabled" : "primary"}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Carregando...
            </>
          ) : view === "sign-in" ? (
            "Entrar"
          ) : view === "sign-up" ? (
            "Criar Conta"
          ) : (
            "Enviar Email"
          )}
        </HandDrawnButton>
      </form>

      <div className="mt-4 text-center text-sm">
        {view === "sign-in" ? (
          <>
            <button
              onClick={() => setView("forgot-password")}
              className="text-olive-700 hover:underline cursor-pointer"
              type="button"
            >
              Esqueceu sua senha?
            </button>
            <div className="mt-2">
              Não tem uma conta?{" "}
              <button
                onClick={() => setView("sign-up")}
                className="text-olive-700 hover:underline font-medium cursor-pointer"
                type="button"
              >
                Criar Conta
              </button>
            </div>
          </>
        ) : view === "sign-up" ? (
          <div>
            Já tem uma conta?{" "}
            <button
              onClick={() => setView("sign-in")}
              className="text-olive-700 hover:underline font-medium cursor-pointer"
              type="button"
            >
              Entrar
            </button>
          </div>
        ) : (
          <div>
            Lembrou sua senha?{" "}
            <button
              onClick={() => setView("sign-in")}
              className="text-olive-700 hover:underline font-medium cursor-pointer"
              type="button"
            >
              Entrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
