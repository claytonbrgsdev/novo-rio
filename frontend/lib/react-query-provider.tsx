'use client'

import { QueryClient, QueryClientProvider as ReactQueryProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryClientProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Cria uma nova instância do QueryClient para cada sessão do usuário
  // para evitar compartilhamento de dados entre usuários diferentes
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Configurações padrão para todas as queries
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        retry: 2,
        staleTime: 1000 * 60 * 5, // 5 minutos
      },
    },
  }))

  return (
    <ReactQueryProvider client={queryClient}>
      {children}
    </ReactQueryProvider>
  )
}
