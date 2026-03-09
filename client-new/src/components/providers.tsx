'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { WalletContextProvider } from '@/providers'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors
          if (error instanceof Error && error.message.includes('4')) {
            return false
          }
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }))

  console.log('🔧 Providers: QueryClient created')

  return (
    <WalletContextProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WalletContextProvider>
  )
}
