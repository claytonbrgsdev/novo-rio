import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Tipos para os dados do jogo baseados no esquema existente
export type GameSaveData = {
  id?: string
  user_id: string
  save_name: string
  created_at?: string
  updated_at?: string
  game_state: {
    inventory: any
    character: any
    farm_state: any
    progress: any
    settings: any
    last_position?: string
    last_view?: string
  }
}

export type UserSettings = {
  id?: string
  user_id: string
  theme: "light" | "dark" | "system"
  volume: number
  music_volume: number
  sfx_volume: number
  language: string
}

export type CharacterCustomization = {
  id?: string
  user_id: string
  name: string
  head_id: number
  body_id: number
  tool_id: string
  created_at?: string
  updated_at?: string
}

export type GameProgress = {
  id?: string
  user_id: string
  level: number
  score: number
  coins: number
  created_at?: string
  updated_at?: string
  last_played_at?: string
}

export type UserProfile = {
  id?: string
  user_id: string
  username: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
  last_login?: string
  game_data?: any
}

// Singleton para o cliente Supabase
let supabaseClient: SupabaseClient | null = null

// Função para obter o cliente Supabase (singleton)
export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be defined")
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
  const { data } = await supabase.auth.getUser()
  return data?.user
}

// Funções para game_saves
export const saveGameData = async (saveData: GameSaveData) => {
  const supabase = getSupabaseClient()

  if (saveData.id) {
    // Atualizar save existente
    const { data, error } = await supabase
      .from("game_saves")
      .update({
        save_name: saveData.save_name,
        game_state: saveData.game_state,
        updated_at: new Date().toISOString(),
      })
      .eq("id", saveData.id)
      .select()

    return { data, error }
  } else {
    // Criar novo save
    const { data, error } = await supabase
      .from("game_saves")
      .insert({
        user_id: saveData.user_id,
        save_name: saveData.save_name,
        game_state: saveData.game_state,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    return { data, error }
  }
}

export const loadGameSaves = async (userId: string) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("game_saves")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  return { data, error }
}

export const loadGameSave = async (saveId: string) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("game_saves").select("*").eq("id", saveId).single()

  return { data, error }
}

export const deleteGameSave = async (saveId: string) => {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from("game_saves").delete().eq("id", saveId)

  return { error }
}

// Funções para user_settings
export const saveUserSettings = async (settings: UserSettings) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: settings.user_id,
      theme: settings.theme,
      volume: settings.volume,
      music_volume: settings.music_volume,
      sfx_volume: settings.sfx_volume,
      language: settings.language,
    })
    .select()

  return { data, error }
}

export const loadUserSettings = async (userId: string) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userId).single()

  return { data, error }
}

// Funções para character_customizations
export const saveCharacterCustomization = async (character: CharacterCustomization) => {
  const supabase = getSupabaseClient()

  if (character.id) {
    // Atualizar personagem existente
    const { data, error } = await supabase
      .from("character_customizations")
      .update({
        name: character.name,
        head_id: character.head_id,
        body_id: character.body_id,
        tool_id: character.tool_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", character.id)
      .select()

    return { data, error }
  } else {
    // Criar novo personagem
    const { data, error } = await supabase
      .from("character_customizations")
      .insert({
        user_id: character.user_id,
        name: character.name,
        head_id: character.head_id,
        body_id: character.body_id,
        tool_id: character.tool_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()

    return { data, error }
  }
}

export const loadCharacterCustomizations = async (userId: string) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from("character_customizations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  return { data, error }
}

// Funções para game_progress
export const updateGameProgress = async (progress: GameProgress) => {
  const supabase = getSupabaseClient()

  if (progress.id) {
    // Atualizar progresso existente
    const { data, error } = await supabase
      .from("game_progress")
      .update({
        level: progress.level,
        score: progress.score,
        coins: progress.coins,
        updated_at: new Date().toISOString(),
        last_played_at: new Date().toISOString(),
      })
      .eq("id", progress.id)
      .select()

    return { data, error }
  } else {
    // Criar novo progresso
    const { data, error } = await supabase
      .from("game_progress")
      .insert({
        user_id: progress.user_id,
        level: progress.level,
        score: progress.score,
        coins: progress.coins,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_played_at: new Date().toISOString(),
      })
      .select()

    return { data, error }
  }
}

export const loadGameProgress = async (userId: string) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("game_progress").select("*").eq("user_id", userId).single()

  return { data, error }
}

// Funções para user_profiles
export const updateUserProfile = async (profile: UserProfile) => {
  const supabase = getSupabaseClient()

  if (profile.id) {
    // Atualizar perfil existente
    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        username: profile.username,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        game_data: profile.game_data,
      })
      .eq("id", profile.id)
      .select()

    return { data, error }
  } else {
    // Criar novo perfil
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: profile.user_id,
        username: profile.username,
        avatar_url: profile.avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        game_data: profile.game_data,
      })
      .select()

    return { data, error }
  }
}

export const loadUserProfile = async (userId: string) => {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

  return { data, error }
}
