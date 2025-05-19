// Tipos básicos para a API

// Usuário/Jogador
export interface User {
  id: string
  email: string
  username?: string
  created_at: string
  updated_at: string
}

export interface Player {
  id: string
  user_id: string
  name: string
  level: number
  experience: number
  coins: number
  aura: number
  created_at: string
  updated_at: string
  avatar_data?: {
    head_id: number
    body_id: number
    tool_id: string
  }
}

// Terreno e Quadrantes
export interface Terrain {
  id: string
  player_id: string
  name: string
  position: string // ex: "A1", "B2", etc.
  soil_quality: number
  water_level: number
  sunlight: number
  created_at: string
  updated_at: string
  quadrants?: Quadrant[]
}

export interface Quadrant {
  id: string
  terrain_id: string
  position: string // ex: "A1", "B2", etc.
  soil_quality: number
  water_level: number
  sunlight: number
  created_at: string
  updated_at: string
  slots?: Slot[]
}

export interface Slot {
  id: string
  quadrant_id: string
  position: number // 0-14 (índice do slot no grid 5x3)
  status: "empty" | "occupied" | "blocked"
  created_at: string
  updated_at: string
  planting?: Planting
}

// Plantações
export interface Planting {
  id: string
  slot_id: string
  plant_id: string
  growth_stage: GrowthStage
  health: HealthLevel
  health_percentage: number
  planted_at: string
  harvested_at?: string
  next_stage_at: string
  water_level: number
  fertilizer_level: number
  needs_water: boolean
  needs_fertilizer: boolean
  issues: string[]
  created_at: string
  updated_at: string
  plant?: Plant
}

export type GrowthStage = "seedling" | "growing" | "flowering" | "mature" | "harvest"
export type HealthLevel = "excellent" | "good" | "average" | "poor" | "critical"

export interface Plant {
  id: string
  name: string
  type: "vegetable" | "fruit" | "grain" | "herb"
  growth_time: number // em horas
  water_needs: number
  fertilizer_needs: number
  sunlight_needs: number
  optimal_soil: number
  value: number
  experience: number
  description: string
  icon_path: string
  created_at: string
  updated_at: string
}

// Ferramentas e Insumos
export interface Tool {
  id: string
  player_id: string
  tool_type_id: string
  durability: number
  efficiency: number
  created_at: string
  updated_at: string
  tool_type?: ToolType
}

export interface ToolType {
  id: string
  name: string
  description: string
  base_durability: number
  base_efficiency: number
  cost: number
  icon_path: string
  created_at: string
  updated_at: string
}

export interface Input {
  id: string
  player_id: string
  input_type_id: string
  quantity: number
  created_at: string
  updated_at: string
  input_type?: InputType
}

export interface InputType {
  id: string
  name: string
  description: string
  effect: "water" | "fertilizer" | "pest_control" | "growth_boost"
  effect_value: number
  cost: number
  icon_path: string
  created_at: string
  updated_at: string
}

// Inventário
export interface InventoryItem {
  id: string
  player_id: string
  item_type: "seed" | "seedling" | "cutting" | "harvest" | "tool" | "input"
  item_id: string
  quantity: number
  created_at: string
  updated_at: string
}

// Clima
export interface Weather {
  condition: "sunny" | "partlyCloudy" | "cloudy" | "rainy" | "drizzle" | "thunderstorm" | "snowy" | "foggy" | "windy"
  temperature: number
  humidity: number
  rain_chance: number
  description: string
  icon: string
  day_period: "dawn" | "morning" | "afternoon" | "evening" | "night"
  forecast: WeatherForecast[]
}

export interface WeatherForecast {
  day: string
  condition: string
  max_temp: number
  min_temp: number
  rain_chance: number
}

// Respostas da API
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: any
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// Requisições
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  username?: string
}

export interface CreatePlayerRequest {
  name: string
  head_id: number
  body_id: number
  tool_id: string
}

export interface PlantingActionRequest {
  action: "water" | "fertilize" | "harvest" | "prune" | "treat" | "inspect" | "support"
  planting_id: string
}
