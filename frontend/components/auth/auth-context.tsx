"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { authService, type User, type LoginData, type RegisterData } from "@/services/auth"
import { playerService } from "@/services/player"
import type { UserProfile, GameProgress, UserSettings, CharacterCustomization } from "@/types/player"
import { AUTH_EVENTS, AUTH_STORAGE_KEYS } from "@/services/api"

// Interface para o estado de autenticação
interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
}

// Dados de jogador que são carregados após autenticação
interface PlayerData {
  profile: UserProfile | null
  progress: GameProgress | null
  settings: UserSettings | null
  character: CharacterCustomization | null
  loaded: boolean
}

type AuthContextType = {
  // Estado de autenticação
  user: User | null
  isAuthenticated: boolean
  playerData: PlayerData
  loading: boolean
  error: string | null
  
  // Ações de autenticação
  login: (data: LoginData) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  signOut: () => void
  refreshUser: () => Promise<void>
  setUser: React.Dispatch<React.SetStateAction<User | null>> // adicionado
  
  // Ações de dados do jogador
  updateProfile: (profile: UserProfile) => Promise<UserProfile>
  updateProgress: (progress: GameProgress) => Promise<GameProgress>
  updateSettings: (settings: UserSettings) => Promise<UserSettings>
  updateCharacter: (character: CharacterCustomization) => Promise<CharacterCustomization>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  playerData: {
    profile: null,
    progress: null,
    settings: null,
    character: null,
    loaded: false
  },
  loading: true,
  error: null,
  login: async () => { throw new Error('AuthContext not initialized') },
  register: async () => { throw new Error('AuthContext not initialized') },
  signOut: () => {},
  refreshUser: async () => {},
  updateProfile: async () => { throw new Error('AuthContext not initialized') },
  updateProgress: async () => { throw new Error('AuthContext not initialized') },
  updateSettings: async () => { throw new Error('AuthContext not initialized') },
  updateCharacter: async () => { throw new Error('AuthContext not initialized') },
  setUser: () => { throw new Error('AuthContext not initialized') }
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado local para autenticação e dados do jogador
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  })
  
  const [playerData, setPlayerData] = useState<PlayerData>({
    profile: null,
    progress: null,
    settings: null,
    character: null,
    loaded: false
  })
  
  const router = useRouter()
  const queryClient = useQueryClient()
  
  // Debug: log token on initialization
  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    console.log('AuthProvider:init token=', token);
  }, []);
  
  // Desestruturas valores do estado de autenticação para simplificar o restante do código
  const { isAuthenticated, isLoading: loading, user, error } = authState
  
  // Debug: log user whenever it changes
  useEffect(() => {
    console.log('AuthProvider:set user=', user);
  }, [user]);

  // Check for existing auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthProvider: Starting authentication check...');
        
        const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
        console.log('AuthProvider: Initial token check=', token ? `${token.substring(0, 15)}...` : 'null');
        
        if (!token) {
          console.log('AuthProvider: No token found, not authenticated');
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: null
          });
          return;
        }
        
        // Validate token with the server
        console.log('AuthProvider: Validating token with server...');
        try {
          // Call the token validation endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            console.log('AuthProvider: Token validation failed:', response.status);
            throw new Error('Token validation failed');
          }
          
          const validationData = await response.json();
          console.log('AuthProvider: Token validated successfully', validationData);
          
          // Use the validation data directly to set user
          const userData = {
            id: validationData.id, // Usando 'id' diretamente em vez de 'user_id'
            email: validationData.email,
            player_id: validationData.player_id
          };
          console.log('AuthProvider: Setting user from validation data:', userData);
          
          setAuthState({
            isAuthenticated: true,
            isLoading: false,
            user: userData,
            error: null
          });
          
          // If player_id is null, we should redirect to character customization
          if (validationData.player_id === null && window.location.pathname === '/game') {
            console.log('AuthProvider: Player ID is null, should redirect to character customizer');
            // Will be handled by game page component
          }
        } catch (validationError) {
          console.error('AuthProvider: Token validation error:', validationError);
          // Clear token and throw error to trigger catch block
          localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
          localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        // Clear local storage on auth error
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: "Falha ao verificar a autenticação"
        });
      }
    };
    
    checkAuth();
  }, []);

  // Definir a query de dados do jogador
  const { data: playerDataQuery, error: playerDataError } = useQuery<
    typeof playerService.initializePlayerData extends (...args: any[]) => Promise<infer R> ? R : never,
    Error
  >({
    queryKey: ['playerData', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }
      return await playerService.initializePlayerData(String(user.id));
    },
    enabled: !!user?.id, // Só executa a query se o usuário estiver autenticado
  });
  
  // Efeito para atualizar o estado quando os dados do jogador forem carregados
  useEffect(() => {
    if (playerDataQuery) {
      setPlayerData({
        profile: playerDataQuery.profile,
        progress: playerDataQuery.progress,
        settings: playerDataQuery.settings,
        character: playerDataQuery.character,
        loaded: true
      });
    }
  }, [playerDataQuery]);
  
  // Efeito para lidar com erros na query de dados do jogador
  useEffect(() => {
    if (playerDataError) {
      console.error("Erro ao carregar dados do jogador:", playerDataError);
      setAuthState(prev => ({
        ...prev,
        error: "Falha ao carregar dados do jogador. Por favor, tente novamente."
      }));
    }
  }, [playerDataError]);
  
  // Escutar eventos de autenticação e token expirado
  useEffect(() => {
    const handleAuthEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      
      if (customEvent.type === AUTH_EVENTS.UNAUTHORIZED || 
          customEvent.type === AUTH_EVENTS.TOKEN_EXPIRED) {
        // Limpar estado e redirecionar para login apenas se não estivermos já na página de autenticação
        // Isso previne loops de redirecionamento
        if (window.location.pathname !== '/auth') {
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            error: customEvent.type === AUTH_EVENTS.TOKEN_EXPIRED 
              ? "Sua sessão expirou. Por favor, faça login novamente."
              : null
          });
          
          setPlayerData({
            profile: null,
            progress: null,
            settings: null,
            character: null,
            loaded: false
          });
          
          router.push('/auth?redirected=true&reason=session_expired');
        }
      }
    };
    
    // Adicionar event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener(AUTH_EVENTS.UNAUTHORIZED, handleAuthEvent);
      window.addEventListener(AUTH_EVENTS.TOKEN_EXPIRED, handleAuthEvent);
    }
    
    return () => {
      // Remover event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener(AUTH_EVENTS.UNAUTHORIZED, handleAuthEvent);
        window.removeEventListener(AUTH_EVENTS.TOKEN_EXPIRED, handleAuthEvent);
      }
    };
  }, [router]);

  // Mutação para login
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: (data: LoginData) => authService.login(data.email, data.password),
    onSuccess: (userData: User) => {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: userData,
        error: null
      });
      
      // Invalidar queries para forçar o recarregamento dos dados do jogador
      queryClient.invalidateQueries({ queryKey: ['playerData'] });
      
      // Redirecionar para o dashboard após login bem-sucedido
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Falha ao fazer login. Verifique suas credenciais."
      }));
    }
  });
  
  // Mutação para registro
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: (data: RegisterData) => authService.register(data.email, data.password),
    onSuccess: (userData: User) => {
      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: userData,
        error: null
      });
      
      // Redirecionar para o dashboard após registro bem-sucedido
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Falha ao criar conta. Tente usar outro email."
      }));
    }
  });
  
  // Função para fazer login
  const login = useCallback(async (data: LoginData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    return loginMutation.mutateAsync(data);
  }, [loginMutation]);
  
  // Função para fazer registro
  const register = useCallback(async (data: RegisterData) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    return registerMutation.mutateAsync(data);
  }, [registerMutation]);
  
  // Função para fazer logout
  const signOut = useCallback(() => {
    // Chamar o serviço de autenticação para limpar dados
    authService.logout();
    
    // Atualizar estado local
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null
    });
    
    setPlayerData({
      profile: null,
      progress: null,
      settings: null,
      character: null,
      loaded: false
    });
    
    // Limpar o cache do React Query
    queryClient.clear();
  }, [queryClient]);
  
  // Função para atualizar o estado do usuário atual
  const refreshUser = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (authService.isAuthenticated()) {
        const currentUser = await authService.getCurrentUser();
        
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: currentUser,
          error: null
        });
        
        // Invalidar queries para forçar o recarregamento dos dados do jogador
        queryClient.invalidateQueries({ queryKey: ['playerData', currentUser.id] });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: null
        });
        
        setPlayerData({
          profile: null,
          progress: null,
          settings: null,
          character: null,
          loaded: false
        });
      }
    } catch (error: any) {
      console.error("Erro ao verificar usuário:", error);
      
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: error.message || "Falha ao verificar usuário. Por favor, tente novamente."
      });
    }
  }, [queryClient]);
  
  // Mutação para atualizar perfil
  const updateProfileMutation = useMutation<UserProfile, Error, UserProfile>({
    mutationFn: playerService.updateProfile,
    onSuccess: (updatedProfile: UserProfile) => {
      setPlayerData(prev => ({ ...prev, profile: updatedProfile }));
      queryClient.invalidateQueries({ queryKey: ['playerData'] });
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar perfil:", error);
      setAuthState(prev => ({
        ...prev,
        error: "Falha ao atualizar perfil. Por favor, tente novamente."
      }));
    }
  });
  
  // Mutação para atualizar progresso
  const updateProgressMutation = useMutation<GameProgress, Error, GameProgress>({
    mutationFn: playerService.updateProgress,
    onSuccess: (updatedProgress: GameProgress) => {
      setPlayerData(prev => ({ ...prev, progress: updatedProgress }));
      queryClient.invalidateQueries({ queryKey: ['playerData'] });
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar progresso:", error);
      setAuthState(prev => ({
        ...prev,
        error: "Falha ao atualizar progresso. Por favor, tente novamente."
      }));
    }
  });
  
  // Mutação para atualizar configurações
  const updateSettingsMutation = useMutation<UserSettings, Error, UserSettings>({
    mutationFn: playerService.updateSettings,
    onSuccess: (updatedSettings: UserSettings) => {
      setPlayerData(prev => ({ ...prev, settings: updatedSettings }));
      queryClient.invalidateQueries({ queryKey: ['playerData'] });
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar configurações:", error);
      setAuthState(prev => ({
        ...prev,
        error: "Falha ao atualizar configurações. Por favor, tente novamente."
      }));
    }
  });
  
  // Mutação para atualizar personagem
  const updateCharacterMutation = useMutation<CharacterCustomization, Error, CharacterCustomization>({
    mutationFn: playerService.updateCharacter,
    onSuccess: (updatedCharacter: CharacterCustomization) => {
      setPlayerData(prev => ({ ...prev, character: updatedCharacter }));
      queryClient.invalidateQueries({ queryKey: ['playerData'] });
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar personagem:", error);
      setAuthState(prev => ({
        ...prev,
        error: "Falha ao atualizar personagem. Por favor, tente novamente."
      }));
    }
  });
  
  // Funções wrapper para mutações
  const updateProfile = useCallback(async (profile: UserProfile) => {
    return updateProfileMutation.mutateAsync(profile);
  }, [updateProfileMutation]);
  
  const updateProgress = useCallback(async (progress: GameProgress) => {
    return updateProgressMutation.mutateAsync(progress);
  }, [updateProgressMutation]);
  
  const updateSettings = useCallback(async (settings: UserSettings) => {
    return updateSettingsMutation.mutateAsync(settings);
  }, [updateSettingsMutation]);
  
  const updateCharacter = useCallback(async (character: CharacterCustomization) => {
    return updateCharacterMutation.mutateAsync(character);
  }, [updateCharacterMutation]);
  
  // Retornar o provider com o contexto
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        playerData,
        loading,
        error,
        
        login,
        register,
        signOut,
        refreshUser,
        setUser: (newUser) => setAuthState(prev => ({
          ...prev,
          user: typeof newUser === 'function' ? newUser(prev.user) : newUser,
          isAuthenticated: !!newUser
        })),
        
        updateProfile,
        updateProgress,
        updateSettings,
        updateCharacter
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
