import { apiService } from './api';
import type {
  UserProfile,
  GameProgress,
  UserSettings,
  CharacterCustomization
} from '@/types/player';

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
    const defaultCharacter: CharacterCustomization = {
      user_id: userId,
      name: 'Agricultor',
      head_id: 1,
      body_id: 1,
      tool_id: '1',
    };
    
    return await apiService.post<CharacterCustomization>(`/players/${userId}/characters`, defaultCharacter);
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
  async updateCharacter(character: CharacterCustomization): Promise<CharacterCustomization> {
    return await apiService.put<CharacterCustomization>(`/players/${character.user_id}/characters/${character.id}`, character);
  }
}

export const playerService = new PlayerService();
