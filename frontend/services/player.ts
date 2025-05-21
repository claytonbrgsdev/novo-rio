import { apiService } from './api';
import type {
  UserProfile,
  GameProgress,
  UserSettings,
  CharacterCustomization
} from '@/types/player';
import { DEFAULT_HEAD, DEFAULT_BODY, DEFAULT_TOOL, DEFAULT_NAME } from '@/constants/character';

class PlayerService {
  /**
   * Inicializa os dados do jogador após o login
   * Carrega ou cria todos os dados necessários para o jogo
   */
  async initializePlayerData(userId: string): Promise<{
    profile: UserProfile;
    progress: GameProgress;
    settings: UserSettings;
    character: CharacterCustomization;
  }> {
    try {
      console.log('Inicializando dados do jogador para:', userId);
      
      // Carregar perfil do usuário
      let profile: UserProfile;
      try {
        profile = await apiService.get<UserProfile>(`/players/${userId}/profile`);
      } catch (error) {
        profile = await this.createDefaultProfile(userId);
      }
      
      // Carregar progresso do jogo
      let progress: GameProgress;
      try {
        progress = await apiService.get<GameProgress>(`/players/${userId}/progress`);
      } catch (error) {
        progress = await this.createDefaultProgress(userId);
      }
      
      // Carregar configurações
      let settings: UserSettings;
      try {
        settings = await apiService.get<UserSettings>(`/players/${userId}/settings`);
      } catch (error) {
        settings = await this.createDefaultSettings(userId);
      }
      
      // Carregar customização de personagem
      let character: CharacterCustomization;
      try {
        const characters = await apiService.get<CharacterCustomization[]>(`/players/${userId}/characters`);
        character = characters[0];
      } catch (error) {
        character = await this.createDefaultCharacter(userId);
      }
      
      return {
        profile,
        progress,
        settings,
        character
      };
    } catch (error) {
      console.error('Erro ao inicializar dados do jogador:', error);
      throw error;
    }
  }
  
  /**
   * Cria um perfil padrão para um novo jogador
   */
  private async createDefaultProfile(userId: string): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      user_id: userId,
      username: 'Agricultor Novo',
      avatar_url: '/images/avatars/default.png',
    };
    
    return await apiService.post<UserProfile>(`/players/${userId}/profile`, defaultProfile);
  }
  
  /**
   * Cria um progresso padrão para um novo jogador
   */
  private async createDefaultProgress(userId: string): Promise<GameProgress> {
    const defaultProgress: GameProgress = {
      user_id: userId,
      level: 1,
      score: 0,
      coins: 100,
    };
    
    return await apiService.post<GameProgress>(`/players/${userId}/progress`, defaultProgress);
  }
  
  /**
   * Cria configurações padrão para um novo jogador
   */
  private async createDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      user_id: userId,
      theme: 'light',
      volume: 0.7,
      music_volume: 0.5,
      sfx_volume: 0.8,
      language: 'pt-BR',
    };
    
    return await apiService.post<UserSettings>(`/players/${userId}/settings`, defaultSettings);
  }
  
  /**
   * Cria um personagem padrão para um novo jogador
   */
  private async createDefaultCharacter(userId: string): Promise<CharacterCustomization> {
    const defaultCharacter = {
      user_id: userId,
      name: DEFAULT_NAME,
      head_id: DEFAULT_HEAD,
      body_id: DEFAULT_BODY,
      tool_id: DEFAULT_TOOL,
    };
    
    return await this.createCharacter(userId, defaultCharacter);
  }
  
  /**
   * Atualiza o perfil do jogador
   */
  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    return await apiService.put<UserProfile>(`/players/${profile.user_id}/profile`, profile);
  }
  
  /**
   * Atualiza o progresso do jogo
   */
  async updateProgress(progress: GameProgress): Promise<GameProgress> {
    return await apiService.put<GameProgress>(`/players/${progress.user_id}/progress`, progress);
  }
  
  /**
   * Atualiza as configurações do usuário
   */
  async updateSettings(settings: UserSettings): Promise<UserSettings> {
    return await apiService.put<UserSettings>(`/players/${settings.user_id}/settings`, settings);
  }
  
  /**
   * Atualiza a personalização do personagem
   */
  // Character management methods
  async getCharacters(userId: string | number): Promise<CharacterCustomization | CharacterCustomization[] | null> {
    try {
      const response = await apiService.get(`/players/${userId}/characters`)
      
      // Helper function to normalize character data
      const normalizeCharacter = (char: any): CharacterCustomization => ({
        id: char?.id,
        name: char?.name || 'Sem Nome',
        user_id: Number(char?.user_id || userId),
        head_id: Number(char?.head_id || 1),
        body_id: Number(char?.body_id || 1),
        tool_id: char?.tool_id || 'shovel',
        created_at: char?.created_at,
        updated_at: char?.updated_at,
      })
      
      // If response is an array, return the most recent character (highest id)
      if (Array.isArray(response)) {
        if (response.length === 0) return null
        
        // Find the character with the highest ID (most recent)
        const mostRecent = response.reduce((prev, current) => 
          (prev?.id && current?.id && prev.id > current.id) ? prev : current
        )
        
        return normalizeCharacter(mostRecent)
      }
      
      // If response is a single character object, normalize and return it
      if (response && typeof response === 'object') {
        // Handle case where response might be { character: Character }
        if ('character' in response) {
          return normalizeCharacter(response.character)
        }
        return normalizeCharacter(response)
      }
      
      return null
    } catch (error) {
      console.error('Error fetching characters:', error)
      throw error
    }
  }

  async createCharacter(
    userId: string | number, 
    data: Omit<CharacterCustomization, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ): Promise<CharacterCustomization> {
    try {
      console.log(`Creating character for user ${userId} with data:`, data)
      
      // Prepare the payload - only include the fields the backend expects
      const payload = {
        name: data.name,
        head_id: Number(data.head_id),
        body_id: Number(data.body_id),
        tool_id: data.tool_id,
      }
      
      console.log('Sending character creation request with payload:', payload)
      const response = await apiService.post<CharacterCustomization>(
        `/players/${userId}/characters`,
        payload
      )
      
      console.log('Character creation response:', response)
      
      // Ensure consistent typing in the response
      return {
        ...response,
        user_id: Number(response.user_id),
        head_id: Number(response.head_id),
        body_id: Number(response.body_id),
      }
    } catch (error) {
      console.error('Error creating character:', error)
      throw error
    }
  }

  async updateCharacter(character: CharacterCustomization): Promise<CharacterCustomization> {
    try {
      if (character.id === undefined) {
        throw new Error('Cannot update character without an ID')
      }
      
      if (!character.user_id) {
        throw new Error('Cannot update character without a user ID')
      }
      
      console.log(`Updating character ${character.id} for user ${character.user_id} with data:`, character)
      
      // Prepare the payload - only include the fields the backend expects
      const payload = {
        name: character.name,
        head_id: Number(character.head_id),
        body_id: Number(character.body_id),
        tool_id: character.tool_id,
      }
      
      console.log('Sending character update request with payload:', payload)
      const response = await apiService.put<CharacterCustomization>(
        `/players/${character.user_id}/characters/${character.id}`,
        payload
      )
      
      console.log('Character update response:', response)
      
      // Ensure consistent typing in the response
      return {
        ...response,
        user_id: Number(response.user_id),
        head_id: Number(response.head_id),
        body_id: Number(response.body_id),
      }
    } catch (error) {
      console.error('Error updating character:', error)
      throw error
    }
  }
}

export const playerService = new PlayerService();
