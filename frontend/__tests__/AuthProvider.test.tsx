import React from "react";
import { renderWithProviders } from "./utils";
import { screen, waitFor } from "@testing-library/react";
import { useAuth } from "../components/auth/auth-context";
import { AUTH_STORAGE_KEYS } from "../services/api";
import "@testing-library/jest-dom"; // Importado para toBeInTheDocument
import { jest } from "@jest/globals";

// Componente de teste que mostra email do user
function TestComponent() {
  const { user, loading } = useAuth(); // Usando 'loading' em vez de 'isLoading' conforme AuthContext
  if (loading) return <div>loading</div>;
  return <div>user: {user?.email || "not authenticated"}</div>;
}

describe("AuthProvider", () => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082";

  beforeEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
    // Restaura o mock da global fetch
    global.fetch = jest.fn();
  });

  it("valida token e define user em caso válido", async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, "valid.jwt.token");
    
    // Mock da resposta do fetch para simular uma requisição bem-sucedida
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ id: 123, email: "u@u.com", player_id: null })
    });

    renderWithProviders(<TestComponent />);

    // Inicialmente deve mostrar loading
    expect(screen.getByText("loading")).toBeInTheDocument();

    // Depois deve mostrar o usuário
    await waitFor(() => {
      expect(screen.getByText("user: u@u.com")).toBeInTheDocument();
    });

    // Verifica se o fetch foi chamado com URL correta
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/validate"),
      expect.any(Object)
    );
  });

  it("limpa o token em caso de inválido", async () => {
    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, "invalid.jwt");
    
    // Mock da resposta do fetch para simular uma requisição com erro de autenticação
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ detail: "Token inválido" })
    });

    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN)).toBeNull();
      // Componente deve mostrar não autenticado
      expect(screen.getByText("user: not authenticated")).toBeInTheDocument();
    });

    // Verifica se o fetch foi chamado
    expect(global.fetch).toHaveBeenCalled();
  });

  it("inicia como não autenticado quando não há token", async () => {
    // Não definir token no localStorage
    renderWithProviders(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("user: not authenticated")).toBeInTheDocument();
    });
    
    // Fetch não deve ser chamado sem token
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
