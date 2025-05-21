import { authService } from '@/services/auth';
import { dispatchAuthEvent, AUTH_EVENTS, AUTH_STORAGE_KEYS } from '@/services/api';

import '@testing-library/jest-dom';

// Mock da função dispatchAuthEvent do serviço de API
jest.mock('@/services/api', () => {
  const original = jest.requireActual('@/services/api');
  return {
    ...original,
    dispatchAuthEvent: jest.fn(),
  };
});

// Mock da resposta de API para login bem-sucedido
const mockLoginSuccess = {
  token: 'mock-jwt-token',
  user: {
    id: '123',
    email: 'teste@exemplo.com',
    name: 'Usuário Teste',
    role: 'user',
  },
};

describe('AuthService', () => {
  // Limpar mocks e localStorage antes de cada teste
  beforeEach(() => {
    window.localStorage.clear();
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com sucesso e armazenar dados', async () => {
      // Configurar o mock para retornar sucesso
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockLoginSuccess,
      });

      // Executar a função de login
      const result = await authService.login('teste@exemplo.com', 'senha123');

      // Verificar se fetch foi chamado com os parâmetros corretos
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('/auth/login');
      expect(fetchCall[1].method).toBe('POST');

      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLoginSuccess.user);

      // Verificar se os dados foram armazenados corretamente
      expect(localStorage.getItem('authToken')).toBe(mockLoginSuccess.token);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockLoginSuccess.user));

      // Verificar se o evento de login foi disparado
      expect(dispatchAuthEvent).toHaveBeenCalled();
      const authEventCall = (dispatchAuthEvent as jest.Mock).mock.calls[0];
      expect(authEventCall[0]).toBe('auth:login');
    });

    it('deve tratar erro de login corretamente', async () => {
      // Configurar o mock para retornar erro
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Credenciais inválidas' }),
      });

      // Executar a função de login e esperar por erro
      await expect(authService.login('invalido@exemplo.com', 'senha_errada'))
        .rejects.toThrow('Credenciais inválidas');

      // Verificar que fetch foi chamado
      expect(global.fetch).toHaveBeenCalled();
      
      // Verificar que não foram armazenados dados no localStorage
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      
      // Verificar que não foi disparado evento de login
      expect(dispatchAuthEvent).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('deve registrar com sucesso e armazenar dados', async () => {
      // Configurar o mock para retornar sucesso
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockLoginSuccess,
      });

      // Executar a função de registro
      const result = await authService.register('novo@exemplo.com', 'senha123');

      // Verificar se fetch foi chamado com os parâmetros corretos
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('/auth/register');
      expect(fetchCall[1].method).toBe('POST');

      // Verificar se o resultado é o esperado
      expect(result).toEqual(mockLoginSuccess.user);

      // Verificar se os dados foram armazenados corretamente
      expect(localStorage.getItem('authToken')).toBe(mockLoginSuccess.token);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockLoginSuccess.user));

      // Verificar se o evento de login foi disparado após registro
      expect(dispatchAuthEvent).toHaveBeenCalled();
      const authEventCall = (dispatchAuthEvent as jest.Mock).mock.calls[0];
      expect(authEventCall[0]).toBe('auth:login');
    });
  });

  describe('logout', () => {
    it('deve fazer logout corretamente e limpar dados', () => {
      // Configurar localStorage com dados de autenticação
      localStorage.setItem('authToken', 'token-falso');
      localStorage.setItem('user', JSON.stringify({ id: '123', email: 'teste@exemplo.com' }));

      // Executar a função de logout
      authService.logout();

      // Verificar se os dados foram removidos corretamente
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();

      // Verificar se o evento de logout foi disparado
      expect(dispatchAuthEvent).toHaveBeenCalled();
      const authEventCall = (dispatchAuthEvent as jest.Mock).mock.calls[0];
      expect(authEventCall[0]).toBe('auth:logout');
      expect(authEventCall[1]).toBeNull();
    });
  });

  // Teste do método decodeToken foi removido porque é um método privado
});
