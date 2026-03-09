'use client'

import { useEffect, useState } from 'react'

/**
 * Returns the JWT auth token stored in localStorage (if any).
 * The hook listens to storage changes so other tabs stay in sync.
 */
export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const readToken = () => {
      const stored = window.localStorage.getItem('trend-auth-token')
      setToken(stored)
    }

    readToken()
    window.addEventListener('storage', readToken)
    return () => window.removeEventListener('storage', readToken)
  }, [])

  return token
}



