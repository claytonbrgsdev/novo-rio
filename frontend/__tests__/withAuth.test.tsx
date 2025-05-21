import React from "react";
import { renderWithProviders } from "./utils";
import { screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation"; // Usando next/navigation em vez de next/router
import withAuth from "../components/auth/with-auth";
import nock from "nock";
import { AUTH_STORAGE_KEYS } from "../services/api";
import "@testing-library/jest-dom"; // Importado para toBeInTheDocument
import { expect as jestExpect } from "@jest/globals"; // Importa o expect específico do jest para asserções especiais como stringContaining

// Defina tipos para resolver problemas de tipagem
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
  }
}


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
    nock.cleanAll();
    localStorage.clear();
    
    // Mock implementation de useRouter
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    
    // Mock do process.env
    process.env.NEXT_PUBLIC_API_BASE_URL = API_BASE;
  });

  it("redireciona para /auth se não autenticado", async () => {
    // Não definir token - não autenticado
    renderWithProviders(<ProtectedWithAuth />);

    // Deve mostrar loading inicialmente
    expect(screen.getByText("Carregando autenticação...")).toBeInTheDocument();

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
    nock(API_BASE)
      .get("/auth/validate")
      .reply(200, { id: 1, email: "user@example.com", player_id: 123 });

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
    
    // Simular validação lenta
    nock(API_BASE)
      .get("/auth/validate")
      .delay(500) // Atrasa a resposta
      .reply(200, { id: 1, email: "user@example.com", player_id: 123 });

    renderWithProviders(<ProtectedWithAuth />);

    // Deve mostrar o indicador de carregamento
    expect(screen.getByText("Carregando autenticação...")).toBeInTheDocument();
  });
});
