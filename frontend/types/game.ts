// Game-related types

export interface GameSaveData {
  id: number;
  player_id?: number;
  user_id?: number; // Used in save-game-modal
  data?: any; // Adjust according to the actual shape of your JSON
  game_state?: any; // The actual game state data
  created_at?: string;
  updated_at?: string;
  name?: string;
  save_name?: string; // Used in the UI
  description?: string;
}

export interface CharacterCustomization {
  id?: number;
  user_id: number;
  player_id?: number;
  name: string;
  head_id: number;
  body_id: number;
  tool_id?: string;
  created_at?: string;
  updated_at?: string;
}
