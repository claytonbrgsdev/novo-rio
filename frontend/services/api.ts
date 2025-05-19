import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios"

// Eventos personalizados para autenticação
export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
  TOKEN_EXPIRED: 'auth:token_expired',
  LOGIN_REQUIRED: 'auth:login_required'
};

// Função para despachar eventos personalizados de autenticação
export const dispatchAuthEvent = (eventType: string, payload?: any) => {
  const event = new CustomEvent(eventType, { detail: payload });
  window.dispatchEvent(event);
};

// Token storage keys
export const AUTH_STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user'
};

// Função para obter o token atual do localStorage
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
};

// Criando a instância do axios com a URL base da API
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000 // 15 segundos timeout por padrão
})

// Interceptor para adicionar token de autenticação nas requisições
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // BYPASS AUTHENTICATION: Always use debug token
  const debugToken = 'debug_token_bypass_authentication';
  config.headers.Authorization = `Bearer ${debugToken}`;
  
  // Log detalhado de todas as requisições
  console.log(`→ API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
    headers: config.headers,
    params: config.params,
    data: config.data
  });
  
  return config;
});

// Interceptor para lidar com respostas e erros
api.interceptors.response.use(
  (response) => response, // Passa as respostas bem-sucedidas diretamente
  (error: AxiosError) => {
    // BYPASS AUTHENTICATION: Log errors but don't handle auth errors specially
    console.log('API Error Bypass:', error);
    
    // For debugging, if we get a 401 response, log it but don't trigger auth events
    if (error.response && error.response.status === 401) {
      console.warn('BYPASSED AUTH: 401 Unauthorized response would normally trigger auth events');
    }
    
    return Promise.reject(error);
  }
)

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
    const status = error.response.status;
    const data = error.response.data;
    console.error(`← API Error [${status}]:`, data);
    console.error(`Request URL: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    
    // Não estamos mais tratando o 401 aqui, pois isso é feito no interceptor de resposta
    
    // Mensagem de erro mais informativa
    throw new Error(`API Error ${status}: ${JSON.stringify(data)}`);
  } else if (error.request) {
    // A requisição foi feita mas nenhuma resposta foi recebida
    console.error('← API Error: No response received', error.request);
    throw new Error(`API Error: No response received - ${error.message}`);
  } else {
    // Algo aconteceu ao configurar a requisição que acionou um erro
    console.error('← API Error:', error.message);
    throw new Error(`API Error: ${error.message}`);
  }
}

export default api
