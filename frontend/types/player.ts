// Player and game data interfaces
// Previously imported from supabase, now defined directly

export interface UserProfile {
  id?: string | number
  user_id: string | number
  username: string
  avatar_url?: string
  created_at?: string
  updated_at?: string
  last_login?: string
  game_data?: any
}

export interface GameProgress {
  id?: string | number
  user_id: string | number
  level: number
  score: number
  coins: number
  created_at?: string
  updated_at?: string
  last_played_at?: string
}

export interface UserSettings {
  id?: string | number
  user_id: string | number
  theme: "light" | "dark" | "system"
  volume: number
  music_volume: number
  sfx_volume: number
  language: string
}

export interface CharacterCustomization {
  id?: number
  user_id: number
  player_id?: number
  name: string
  head_id: number
  body_id: number
  tool_id?: string
  created_at?: string
  updated_at?: string
}

export interface GameSaveData {
  id?: string | number
  user_id: string | number
  save_name: string
  created_at?: string
  updated_at?: string
  game_state: {
    level: number
    score: number
    items: Array<any>
    position: { x: number; y: number }
    completed_missions: string[]
    inventory: Record<string, number>
  }
}
