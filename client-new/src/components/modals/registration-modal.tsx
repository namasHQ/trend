'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletAuth } from '@/hooks/useWalletAuth'
import { Wallet, Loader2, AlertCircle } from 'lucide-react'

interface RegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function RegistrationModal({ isOpen, onClose, onSuccess }: RegistrationModalProps) {
  const { publicKey, signMessage } = useWallet()
  const { authenticate, isAuthenticating, authError } = useWalletAuth()
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Handle authentication error
  useEffect(() => {
    if (authError) {
      setError((authError as Error)?.message || 'Registration failed. Please try again.')
    }
  }, [authError])

  // Handle authentication success
  useEffect(() => {
    if (!isAuthenticating && !authError) {
      // Check if we have a token (success)
      const token = localStorage.getItem('trend-auth-token')
      if (token) {
        setError(null)
        onSuccess()
        onClose()
      }
    }
  }, [isAuthenticating, authError, onSuccess, onClose])

  const handleRegister = async () => {
    if (!publicKey || !signMessage) {
      setError('Wallet not connected')
      return
    }

    if (!username.trim()) {
      setError('Username is required')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    setError(null)

    try {
      // Create authentication message
      const message = `Welcome to TREND!\n\nSign this message to authenticate with your wallet.\n\nWallet: ${publicKey.toBase58()}\nUsername: ${username}\n\nThis request will not trigger a blockchain transaction or cost any fees.`

      // Sign message
      const messageBytes = new TextEncoder().encode(message)
      const signature = await signMessage(messageBytes)

      // Register user with signature using the authenticate function
      authenticate({
        username: username.trim(),
        signature: Array.from(signature),
        message,
      })
    } catch (err: any) {
      setError(err.message || 'Failed to sign message. Please try again.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Complete Your Registration
          </DialogTitle>
          <DialogDescription>
            Choose a username to complete your account setup. This will be visible to other users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(null)
              }}

              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAuthenticating) {
                  handleRegister()
                }
              }}
              disabled={isAuthenticating}
              className={error ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              3-20 characters, letters, numbers, and underscores only
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isAuthenticating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegister}
              disabled={isAuthenticating || !username.trim()}
              className="flex-1"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

