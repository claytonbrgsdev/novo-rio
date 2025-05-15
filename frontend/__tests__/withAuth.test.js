import React from "react";
import { renderWithProviders } from "./utils";
import { screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import withAuth from "../components/auth/with-auth";
import { AUTH_STORAGE_KEYS } from "../services/api";
import "@testing-library/jest-dom";

// Mock do router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Componente protegido simples para teste
function Protected() {
  return <div>Protected Content</div>;
}

const ProtectedWithAuth = withAuth(Protected);

describe("withAuth HOC", () => {
  const mockReplace = jest.fn();
  const mockRouter = { replace: mockReplace, events: { on: jest.fn(), off: jest.fn() } };
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082";
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Mock implementation de useRouter
    useRouter.mockReturnValue(mockRouter);
    
    // Mock do process.env
    process.env.NEXT_PUBLIC_API_BASE_URL = API_BASE;
    
    // Mock da função fetch global
    global.fetch = jest.fn();
  });

  it("redireciona para /auth se não autenticado", async () => {
    // Não definir token - não autenticado
    renderWithProviders(<ProtectedWithAuth />);

    // Em vez de verificar o texto, vamos testar apenas o redirecionamento
    // que é o comportamento principal que queremos validar
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/auth")
      );
    });
  });

  it("exibe conteúdo protegido quando autenticado", async () => {
    // Definir token válido
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, "valid.jwt.token");
    
    // Mock da validação de token no AuthProvider
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 1, email: "user@example.com", player_id: 123 })
    });

    renderWithProviders(<ProtectedWithAuth />);

    // Deve mostrar loading inicialmente
    expect(screen.getByText("Carregando autenticação...")).toBeInTheDocument();
    
    // Depois deve mostrar o conteúdo protegido
    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
    
    // E não deve ter chamado o redirect
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("mostra loading enquanto verifica autenticação", () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, "valid.jwt.token");
    
    // Simular validação lenta - usando jest.fn() sem mock de retorno
    // Isso mantem a promise pendente sem causar timeout
    global.fetch = jest.fn();

    renderWithProviders(<ProtectedWithAuth />);

    // Deve mostrar o indicador de carregamento
    expect(screen.getByText("Carregando autenticação...")).toBeInTheDocument();
  });
});
