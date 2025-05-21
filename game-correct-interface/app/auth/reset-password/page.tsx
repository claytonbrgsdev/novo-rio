"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase"
import Link from "next/link"
import { AlertCircle, Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null)
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Verificar se as senhas coincidem
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem." })
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      setMessage({
        type: "success",
        text: "Senha atualizada com sucesso! Redirecionando para o login...",
      })

      // Redirecionar para a página de login após alguns segundos
      setTimeout(() => {
        router.push("/auth")
      }, 3000)
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error)
      setMessage({ type: "error", text: error.message || "Erro ao redefinir senha" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-700 to-amber-900 p-4">
      <div className="bg-amber-100 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 text-center">Redefinir Senha</h2>

        {message && (
          <div
            className={`p-3 rounded mb-4 flex items-start gap-2 ${
              message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}
          >
            {message.type === "error" ? <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" /> : null}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="mb-4">
            <label htmlFor="password" className="block text-amber-800 mb-1">
              Nova Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-amber-700 mt-1">A senha deve ter pelo menos 6 caracteres</p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-amber-800 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 text-white py-2 rounded hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processando...
              </>
            ) : (
              "Redefinir Senha"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/auth" className="text-amber-700 hover:underline">
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
