import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Singleton para o cliente Supabase
let supabaseClient: SupabaseClient | null = null

// Função para obter o cliente Supabase (singleton)
export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL and Anon Key must be defined")
    // Fornecer valores padrão para evitar erros
    return createClient("https://your-project.supabase.co", "your-anon-key", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}

// Função para verificar se o usuário está autenticado
export const getCurrentUser = async () => {
  const supabase = getSupabaseClient()
  try {
    const { data } = await supabase.auth.getUser()
    return data?.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
