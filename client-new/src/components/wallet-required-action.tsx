'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Wallet, Lock } from 'lucide-react'
import { useWalletConnection } from '@/hooks/solanaHooks'
import { WalletMultiButton } from '@/components/features/wallet/wallet-multi-button'

interface WalletRequiredActionProps {
  children: ReactNode
  action: string
  description?: string
  onConnect?: () => void
}

export function WalletRequiredAction({ 
  children, 
  action, 
  description,
  onConnect 
}: WalletRequiredActionProps) {
  const { isConnected } = useWalletConnection()

  if (isConnected) {
    return <>{children}</>
  }

  return (
    <Card className="p-6 text-center border-dashed border-2 border-muted">
      <div className="flex flex-col items-center space-y-4">
        <div className="p-3 rounded-full bg-muted">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-primary-enhanced">
            Wallet Required
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {description || `You need to connect your wallet to ${action.toLowerCase()}.`}
          </p>
        </div>
        
        <WalletMultiButton />
      </div>
    </Card>
  )
}

// Specific components for common actions
export function CreateTrendButton({ children }: { children: ReactNode }) {
  return (
    <WalletRequiredAction 
      action="Create Trend"
      description="Connect your wallet to create new trends and signal early opportunities."
    >
      {children}
    </WalletRequiredAction>
  )
}

export function CreateMarketButton({ children }: { children: ReactNode }) {
  return (
    <WalletRequiredAction 
      action="Create Market"
      description="Connect your wallet to create prediction markets and bet on trend outcomes."
    >
      {children}
    </WalletRequiredAction>
  )
}

export function VoteButton({ children }: { children: ReactNode }) {
  return (
    <WalletRequiredAction 
      action="Vote"
      description="Connect your wallet to vote on trends and influence their ranking."
    >
      {children}
    </WalletRequiredAction>
  )
}
