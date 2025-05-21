import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/components/auth/auth-context';
import { authService } from '@/services/auth';
import { AUTH_EVENTS } from '@/services/api';

// Mock do serviço de autenticação
jest.mock('@/services/auth', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getStoredUser: jest.fn(),
    getStoredToken: jest.fn(),
    refreshUserData: jest.fn(),
  }
}));

// Mock do serviço de jogador (usado pelo AuthContext)
jest.mock('@/services/player', () => ({
  playerService: {
    initializePlayerData: jest.fn(),
    updateProfile: jest.fn(),
    updateProgress: jest.fn(),
    updateSettings: jest.fn(),
    updateCharacter: jest.fn(),
  }
}));

// Wrapper que fornece o contexto de autenticação e React Query para os testes
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Limpar mocks e localStorage antes de cada teste
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('Deve inicializar com estado não autenticado', () => {
    // Configurar getStoredUser para retornar null
    (authService.getStoredUser as jest.Mock).mockReturnValue(null);
    (authService.getStoredToken as jest.Mock).mockReturnValue(null);

    // Renderizar o hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Verificar estado inicial
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('Deve inicializar com estado autenticado se houver usuário no localStorage', () => {
    // Mock de usuário armazenado
    const mockUser = { id: '123', email: 'teste@exemplo.com' };
    
    // Configurar getStoredUser para retornar usuário
    (authService.getStoredUser as jest.Mock).mockReturnValue(mockUser);
    (authService.getStoredToken as jest.Mock).mockReturnValue('mock-token');

    // Renderizar o hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Verificar estado inicial com usuário
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('Deve fazer login com sucesso', async () => {
    // Mock de resposta de login bem-sucedido
    const mockUser = { id: '123', email: 'teste@exemplo.com', name: 'Test User' };
    (authService.login as jest.Mock).mockResolvedValue(mockUser);

    // Renderizar o hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Executar a ação de login
    await act(async () => {
      await result.current.login({ email: 'teste@exemplo.com', password: 'senha123' });
    });

    // Verificar se o serviço foi chamado
    expect(authService.login).toHaveBeenCalledWith('teste@exemplo.com', 'senha123');

    // Verificar estado após login
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('Deve registrar novo usuário com sucesso', async () => {
    // Mock de resposta de registro bem-sucedido
    const mockUser = { id: '456', email: 'novo@exemplo.com', name: 'Novo Usuário' };
    (authService.register as jest.Mock).mockResolvedValue(mockUser);

    // Renderizar o hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Executar a ação de registro
    await act(async () => {
      await result.current.register({ email: 'novo@exemplo.com', password: 'senha123' });
    });

    // Verificar se o serviço foi chamado
    expect(authService.register).toHaveBeenCalledWith('novo@exemplo.com', 'senha123');

    // Verificar estado após registro
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('Deve fazer logout corretamente', async () => {
    // Configurar estado inicial como autenticado
    const mockUser = { id: '123', email: 'teste@exemplo.com' };
    (authService.getStoredUser as jest.Mock).mockReturnValue(mockUser);
    (authService.getStoredToken as jest.Mock).mockReturnValue('mock-token');

    // Renderizar o hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Verificar estado inicial
    expect(result.current.isAuthenticated).toBe(true);

    // Executar a ação de logout
    act(() => {
      result.current.signOut();
    });

    // Verificar se o serviço foi chamado
    expect(authService.logout).toHaveBeenCalled();

    // Verificar estado após logout
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  it('Deve lidar com eventos de autenticação', async () => {
    // Renderizar o hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Simular evento de login
    act(() => {
      const mockUser = { id: '789', email: 'evento@exemplo.com' };
      const event = new CustomEvent(AUTH_EVENTS.LOGIN, { detail: mockUser });
      window.dispatchEvent(event);
    });

    // Verificar estado após evento de login
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Simular evento de logout
    act(() => {
      const event = new CustomEvent(AUTH_EVENTS.LOGOUT);
      window.dispatchEvent(event);
    });

    // Verificar estado após evento de logout
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('Deve lidar com erros durante o login', async () => {
    // Mock de erro de login
    const mockError = new Error('Credenciais inválidas');
    (authService.login as jest.Mock).mockRejectedValue(mockError);

    // Renderizar o hook
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    // Executar a ação de login que irá falhar
    await act(async () => {
      try {
        await result.current.login({ email: 'invalido@exemplo.com', password: 'senha_errada' });
      } catch (error) {
        // Esperamos um erro aqui
      }
    });

    // Verificar estado após falha de login
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });
});
