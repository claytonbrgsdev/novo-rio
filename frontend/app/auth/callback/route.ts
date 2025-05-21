import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

// Esta rota agora é usada para processar callbacks de autenticação da nossa API personalizada
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get("token")
  const next = requestUrl.searchParams.get("next") || "/character"

  if (token) {
    try {
      // Em um sistema real, poderíamos verificar o token aqui
      // Apenas redirecionamos para a página com o token como query param
      // O cliente JavaScript pode capturar e processar
      return NextResponse.redirect(new URL(`${next}?auth_token=${token}`, requestUrl.origin))
    } catch (error) {
      console.error("Erro ao processar token de autenticação:", error)
      return NextResponse.redirect(new URL(`/error?type=auth&from=${encodeURIComponent(next)}`, requestUrl.origin))
    }
  }

  // Se não houver token, redirecionar para a página inicial
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
