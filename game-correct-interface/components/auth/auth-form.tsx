"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-context"
import { AlertCircle, Loader2 } from "lucide-react"
import HandDrawnButton from "@/components/hand-drawn/button"

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

  const supabase = getSupabaseClient()

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      // Atualizar o contexto de autenticação
      await refreshUser()

      // Redirect to the page the user was trying to access, or character page by default
      window.location.href = fromPath // Usando window.location para garantir navegação completa
    } catch (error: any) {
      console.error("Erro ao fazer login:", error)
      setMessage({
        type: "error",
        text:
          error.message === "Invalid login credentials"
            ? "Credenciais inválidas. Verifique seu email e senha."
            : error.message || "Erro ao fazer login",
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }

      setMessage({
        type: "success",
        text: "Verifique seu email para confirmar seu cadastro!",
      })
    } catch (error: any) {
      console.error("Erro ao criar conta:", error)
      setMessage({
        type: "error",
        text:
          error.message === "User already registered"
            ? "Este email já está registrado. Tente fazer login."
            : error.message || "Erro ao criar conta",
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setMessage({
        type: "success",
        text: "Verifique seu email para redefinir sua senha!",
      })
    } catch (error: any) {
      console.error("Erro ao solicitar redefinição de senha:", error)
      setMessage({ type: "error", text: error.message || "Erro ao solicitar redefinição de senha" })
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
