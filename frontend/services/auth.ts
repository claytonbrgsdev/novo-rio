import { apiService, AUTH_STORAGE_KEYS, AUTH_EVENTS, dispatchAuthEvent } from './api';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  player_id?: number;
  user?: {
    id: number;
    email: string;
  };
}

export interface User {
  id: number;
  email: string;
  player_id?: number;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  private tokenKey = AUTH_STORAGE_KEYS.TOKEN;
  private userKey = AUTH_STORAGE_KEYS.USER;

  /**
   * Realiza login do usuário
   */
  /**
   * Realiza login do usuário usando OAuth2 Password Flow
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Formato esperado pelo backend (OAuth2PasswordRequestForm)
      const formData = new URLSearchParams();
      formData.append('username', email); // Backend espera 'username' para o email
      formData.append('password', password);

      // Fazendo a requisição diretamente para contornar a necessidade de personalizar o header
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro ao fazer login:', response.status, errorText);
        throw new Error(`Erro ao fazer login: ${response.status} - ${errorText}`);
      }

      // Processar a resposta
      const data: LoginResponse = await response.json();
      
      // Armazenar token
      this.setToken(data.access_token);
      
      // Extrair usuário da resposta ou do payload do token
      let user: User;
      
      if (data.user) {
        // Se a API retorna informações do usuário diretamente
        user = {
          id: data.user.id,
          email: data.user.email,
          player_id: data.player_id
        };
      } else {
        // Extrai informações do token
        try {
          // Decodificar payload do token JWT
          const payload = this.decodeToken(data.access_token);
          user = {
            id: payload.sub || 0,
            email: payload.email || email,
            player_id: data.player_id || payload.player_id
          };
        } catch (decodeError) {
          // Fallback se não conseguir decodificar o token
          user = {
            id: 0, // ID provisório
            email: email,
            player_id: data.player_id
          };
        }
      }
      
      // Armazenar no localStorage para cache
      this.setUser(user);
      
      // Disparar evento de login bem-sucedido
      dispatchAuthEvent('auth:login_success', { user });
      
      return user;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Registra um novo usuário
   */
  /**
   * Registra um novo usuário e realiza login automático
   */
  async register(email: string, password: string): Promise<User> {
    try {
      // Registrar o novo usuário
      const response = await apiService.post<{id: number, email: string}>('/auth/register', {
        email,
        password,
      });

      // Após registro bem-sucedido, fazer login automaticamente
      return await this.login(email, password);
    } catch (error) {
      console.error('Erro durante o registro:', error);
      // Disparar evento de erro no registro
      dispatchAuthEvent('auth:register_error', { error });
      throw error;
    }
  }

  /**
   * Realiza logout do usuário
   */
  /**
   * Realiza logout do usuário
   */
  logout(): void {
    // Remover dados de autenticação do localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    
    // Disparar evento de logout
    dispatchAuthEvent(AUTH_EVENTS.UNAUTHORIZED);
    
    // Redirecionamento será tratado pelo componente que escuta o evento
  }

  /**
   * Obtém o usuário atual
   */
  /**
   * Obtém o usuário atual
   * Primeiro tenta o cache, depois decodifica do token, e por fim faz uma chamada API
   */
  async getCurrentUser(): Promise<User> {
    // Verificar cache primeiro
    const cachedUser = this.getUser();
    if (cachedUser) {
      return cachedUser;
    }

    try {
      // Verificar se há token
      const token = this.getToken();
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      // Tentar obter os dados do usuário da API
      try {
        const user = await apiService.get<User>('/auth/me');
        this.setUser(user);
        return user;
      } catch (apiError) {
        // Se falhar na API, tentar extrair do token
        console.warn('Falha ao buscar usuário da API, tentando decodificar do token');
        
        const payload = this.decodeToken(token);
        const user: User = {
          id: payload.sub || 0,
          email: payload.email || '',
          player_id: payload.player_id,
        };

        // Armazenar no localStorage para cache
        this.setUser(user);
        return user;
      }
    } catch (error) {
      console.error('Erro ao obter usuário atual:', error);
      // Disparar evento de erro na autenticação
      dispatchAuthEvent(AUTH_EVENTS.UNAUTHORIZED);
      throw error;
    }
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Obtém o token JWT
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null; // No server-side
    }
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Define o token JWT
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Obtém o usuário do localStorage
   */
  /**
   * Decodifica um token JWT e retorna seu payload
   */
  private decodeToken(token: string): any {
    try {
      console.log('Tentando decodificar token:', token.substring(0, 15) + '...');
      
      // Dividir o token em duas partes (mensagem.assinatura) - formato personalizado do backend
      const parts = token.split('.');
      if (parts.length !== 2) {
        // Tentar como JWT padrão se não for nosso formato personalizado
        if (parts.length === 3) {
          // Formato JWT padrão com três partes
          const payload = parts[1];
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        }
        throw new Error('Formato de token inválido');
      }

      // Decodificar a parte da mensagem (primeira parte)
      const message = parts[0];
      const base64 = message.replace(/-/g, '+').replace(/_/g, '/');
      let jsonPayload;
      
      try {
        jsonPayload = atob(base64);
        return JSON.parse(jsonPayload);
      } catch (base64Error) {
        // Tentar decodificação mais robusta
        try {
          jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          return JSON.parse(jsonPayload);
        } catch (decodeError) {
          console.error('Erro na decodificação avançada:', decodeError);
          throw new Error('Falha na decodificação do formato de token personalizado');
        }
      }
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      throw new Error('Falha ao processar token de autenticação');
    }
  }
  
  /**
   * Obtém o usuário do localStorage
   */
  private getUser(): User | null {
    if (typeof window === 'undefined') {
      return null; // No server-side
    }
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  /**
   * Define o usuário no localStorage
   */
  private setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }
}

export const authService = new AuthService();
