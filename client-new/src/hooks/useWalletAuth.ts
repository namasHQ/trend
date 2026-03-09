'use client'

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSignMessage } from './solanaHooks'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface UserCheckResponse {
  exists: boolean
  needsRegistration: boolean
  hasUsername?: boolean
  username?: string
}

// Hook to check if user needs registration
export function useWalletAuth() {
  const { publicKey, connected } = useWallet()
  const { mutate: signMessageMutation } = useSignMessage()
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Check if user exists and needs registration
  const { data: userCheck, refetch: checkUser } = useQuery<UserCheckResponse>({
    queryKey: ['user-check', publicKey?.toBase58()],
    queryFn: async () => {
      if (!publicKey) return null
      
      const response = await fetch(`${API_BASE_URL}/auth/check?walletAddress=${publicKey.toBase58()}`)
      if (!response.ok) {
        throw new Error('Failed to check user status')
      }
      return response.json()
    },
    enabled: !!publicKey && connected,
    staleTime: 0, // Always check fresh
  })

  // Authenticate user with wallet signature
  const { mutate: authenticate, isPending: isAuthenticating, error: authError } = useMutation({
    mutationFn: async ({ username, signature, message }: { username?: string; signature: any; message: string }) => {
      const response = await fetch(`${API_BASE_URL}/auth/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey: publicKey?.toBase58(),
          signature: Array.from(signature),  // Ensure signature is always an array
          message,
          username,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }))
        throw new Error(errorData.error || 'Authentication failed')
      }

      return response.json()
    },
    onSuccess: (data) => {
      // Store token
      if (data.token) {
        localStorage.setItem('trend-auth-token', data.token)
      }
      // Refetch user check to update status
      checkUser()
      setNeedsRegistration(false)
    },
    onError: (err: Error) => {
      console.error('Authentication error:', err)
    },
  })

  // Check registration status when wallet connects
  useEffect(() => {
    if (connected && publicKey && userCheck) {
      setNeedsRegistration(userCheck.needsRegistration || !userCheck.exists)
      setIsChecking(false)
    } else if (connected && publicKey && !userCheck) {
      setIsChecking(true)
    } else {
      setNeedsRegistration(false)
      setIsChecking(false)
    }
  }, [connected, publicKey, userCheck])

  return {
    needsRegistration,
    isChecking,
    userCheck,
    authenticate,
    isAuthenticating,
    authError,
    checkUser,
  }
}
