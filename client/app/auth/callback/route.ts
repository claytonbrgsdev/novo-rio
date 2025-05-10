import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/character"

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)

      // Redirecionar para a página especificada ou para a página de personagem por padrão
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error) {
      console.error("Error exchanging code for session:", error)

      // Em caso de erro, redirecionar para a página de erro
      return NextResponse.redirect(new URL(`/error?type=auth&from=${encodeURIComponent(next)}`, requestUrl.origin))
    }
  }

  // Se não houver código, redirecionar para a página inicial
  return NextResponse.redirect(new URL("/", requestUrl.origin))
}
