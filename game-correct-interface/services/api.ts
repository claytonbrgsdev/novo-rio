import axios, { type AxiosError, type AxiosResponse } from "axios"

// Criando a instância do axios com a URL base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar token de autenticação, se necessário
api.interceptors.request.use((config) => {
  // Se houver um token no localStorage, adiciona ao header
  const token = localStorage.getItem("authToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Funções wrapper para tratar erros e retornar apenas os dados
export const apiService = {
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.get(url, { params })
      return response.data
    } catch (error) {
      handleApiError(error as AxiosError)
      throw error
    }
  },

  async post<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.post(url, data)
      return response.data
    } catch (error) {
      handleApiError(error as AxiosError)
      throw error
    }
  },

  async put<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.put(url, data)
      return response.data
    } catch (error) {
      handleApiError(error as AxiosError)
      throw error
    }
  },

  async delete<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.delete(url)
      return response.data
    } catch (error) {
      handleApiError(error as AxiosError)
      throw error
    }
  },

  async patch<T>(url: string, data?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await api.patch(url, data)
      return response.data
    } catch (error) {
      handleApiError(error as AxiosError)
      throw error
    }
  },
}

// Função para tratar erros da API
function handleApiError(error: AxiosError): void {
  if (error.response) {
    // A requisição foi feita e o servidor respondeu com um status fora do intervalo 2xx
    console.error("API Error Response:", error.response.data)
    console.error("Status:", error.response.status)

    // Se o erro for 401 (não autorizado), podemos redirecionar para a página de login
    if (error.response.status === 401) {
      // Limpar token e redirecionar para login
      localStorage.removeItem("authToken")
      window.location.href = "/auth"
    }
  } else if (error.request) {
    // A requisição foi feita mas não houve resposta
    console.error("API Error Request:", error.request)
  } else {
    // Algo aconteceu na configuração da requisição que acionou um erro
    console.error("API Error Message:", error.message)
  }
}

export default api
