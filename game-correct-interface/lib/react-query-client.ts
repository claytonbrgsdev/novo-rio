import { QueryClient } from "react-query"

// Criar uma instância do QueryClient com configurações padrão
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
})
