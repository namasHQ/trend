'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useWallet } from '@solana/wallet-adapter-react'
import { useMutation } from '@tanstack/react-query'
import { Connection, PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { Bot, Loader2, AlertCircle, Wallet } from 'lucide-react'
import { deployAgent } from '@/api/agents'
import { useWalletConnection } from '@/hooks/solanaHooks'

interface DeployAgentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const DEPLOYMENT_COST = 0.1 // SOL
const DEPLOYMENT_ADDRESS = process.env.NEXT_PUBLIC_AGENT_DEPLOYMENT_ADDRESS || '11111111111111111111111111111111' // Placeholder

export function DeployAgentModal({ isOpen, onClose, onSuccess }: DeployAgentModalProps) {
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const { isConnected } = useWalletConnection()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const { mutate: deployAgentMutation, isPending: isDeploying } = useMutation({
    mutationFn: async ({ name, description, signature, transactionHash }: {
      name: string
      description?: string
      signature: string
      transactionHash: string
    }) => {
      return deployAgent({ name, description }, signature, transactionHash)
    },
    onSuccess: () => {
      setIsProcessing(false)
      setError(null)
      setName('')
      setDescription('')
      onSuccess()
      onClose()
    },
    onError: (err: Error) => {
      setIsProcessing(false)
      setError(err.message || 'Failed to deploy agent. Please try again.')
    },
  })

  const handleDeploy = async () => {
    if (!publicKey || !signTransaction || !sendTransaction) {
      setError('Wallet not connected')
      return
    }

    if (!name.trim()) {
      setError('Agent name is required')
      return
    }

    if (name.length < 3) {
      setError('Agent name must be at least 3 characters')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Create transaction to send 0.1 SOL
      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
        'confirmed'
      )

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(DEPLOYMENT_ADDRESS),
          lamports: DEPLOYMENT_COST * LAMPORTS_PER_SOL,
        })
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Sign transaction
      const signedTransaction = await signTransaction(transaction)

      // Send transaction
      const signature = await sendTransaction(signedTransaction, connection)

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')

      // Deploy agent via API
      deployAgentMutation({
        name: name.trim(),
        description: description.trim() || undefined,
        signature,
        transactionHash: signature,
      })
    } catch (err: any) {
      setIsProcessing(false)
      setError(err.message || 'Failed to deploy agent. Please try again.')
    }
  }

  if (!isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Required
            </DialogTitle>
            <DialogDescription>
              Please connect your Solana wallet to deploy an agent.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Deploy AI Agent
          </DialogTitle>
          <DialogDescription>
            Deploy an AI agent for {DEPLOYMENT_COST} SOL. The agent will make automated predictions on trends.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="agent-name">Agent Name *</Label>
            <Input
              id="agent-name"
              placeholder="My Trading Agent"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isProcessing && name.trim()) {
                  handleDeploy()
                }
              }}
              disabled={isProcessing || isDeploying}
              className={error ? 'border-red-500' : ''}
            />
            <p className="text-xs text-muted-foreground">
              3-50 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description">Description (Optional)</Label>
            <Textarea
              id="agent-description"
              placeholder="Describe what this agent will focus on..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setError(null)
              }}
              disabled={isProcessing || isDeploying}
              rows={3}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deployment Cost</span>
              <span className="font-semibold">{DEPLOYMENT_COST} SOL</span>
            </div>
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
              disabled={isProcessing || isDeploying}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeploy}
              disabled={isProcessing || isDeploying || !name.trim()}
              className="flex-1"
            >
              {isProcessing || isDeploying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isProcessing ? 'Processing...' : 'Deploying...'}
                </>
              ) : (
                <>
                  <Bot className="h-4 w-4 mr-2" />
                  Deploy Agent
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



