"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowRightLeft, Copy, LogOut } from "lucide-react"
import { WalletIcon } from "@/components/features/wallet/wallet-icon"
import { useWalletModal } from "@/providers"

interface WalletMultiButtonProps {
  labels?: {
    "copy-address": string
    copied: string
    "change-wallet": string
    disconnect: string
    connecting: string
    connected: string
    "has-wallet": string
    "no-wallet": string
  }
}

export function WalletMultiButton({
  labels = {
    "copy-address": "Copy address",
    copied: "Copied",
    "change-wallet": "Change wallet",
    disconnect: "Disconnect",
    connecting: "Connecting...",
    connected: "Connected",
    "has-wallet": "Connect",
    "no-wallet": "Connect Wallet",
  },
}: WalletMultiButtonProps) {
  const wallet = useWallet()
  const {
    publicKey,
    connected,
    disconnect,
    connecting,
    disconnecting,
    wallet: selectedWallet
  } = wallet
  const { setVisible } = useWalletModal()
  const [copied, setCopied] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Fix hydration and handle connection state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle wallet connection state changes
  useEffect(() => {
    if (!connected && dropdownOpen) {
      setDropdownOpen(false)
    }
  }, [connected, dropdownOpen])

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current

      if (!node || node.contains(event.target as Node)) return

      setDropdownOpen(false)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [])

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])
  const content = useMemo(() => {
    if (connecting) return labels["connecting"]
    if (disconnecting) return "Disconnecting..."
    if (connected && base58)
      return `${base58.slice(0, 4)}...${base58.slice(-4)}`
    return labels["no-wallet"]
  }, [connecting, disconnecting, connected, base58, labels])

  const copyAddress = async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58)
      setCopied(true)
      setTimeout(() => setCopied(false), 400)
    }
  }

  const openModal = () => {
    setVisible(true)
  }

  const disconnectWallet = async () => {
    try {
      console.log('🔌 Disconnect menu item clicked!')
      console.log('🔌 Starting wallet disconnect process...')

      // Close dropdown immediately
      setDropdownOpen(false)

      // Clear auth token first
      localStorage.removeItem('trend-auth-token')
      console.log('🗑️ Auth token cleared')

      // Try to disconnect the specific wallet adapter first
      if (selectedWallet?.adapter) {
        try {
          console.log('🔌 Disconnecting adapter:', selectedWallet.adapter.name)
          await selectedWallet.adapter.disconnect()
          console.log('✅ Adapter disconnect successful')
        } catch (adapterError) {
          console.warn('⚠️ Adapter disconnect failed, trying general disconnect:', adapterError)
        }
      }

      // Try the general disconnect method
      try {
        console.log('🔌 Attempting general disconnect...')
        await disconnect()
        console.log('✅ General disconnect successful')
      } catch (disconnectError) {
        console.warn('⚠️ General disconnect failed:', disconnectError)
      }

      // Force reload after a short delay to ensure clean state
      console.log('🔄 Scheduling page reload to ensure clean wallet state...')
      setTimeout(() => {
        console.log('🔄 Reloading page...')
        window.location.reload()
      }, 500)

    } catch (error) {
      console.error('❌ Error during wallet disconnect:', error)
      // Clear auth token even on error
      localStorage.removeItem('trend-auth-token')
      setDropdownOpen(false)

      // Still reload to reset state
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }

  // During SSR and initial render, show a simple button to avoid hydration mismatch
  if (!mounted) {
    return <Button>{labels["no-wallet"]}</Button>
  }

  // After mount, render based on actual wallet connection state
  if (!connected || !base58 || disconnecting) {
    return <Button onClick={openModal} disabled={connecting}>{content}</Button>
  }

  return (
    <div ref={ref}>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2 min-w-[140px] justify-start" disabled={disconnecting}>
            {wallet?.wallet?.adapter && (
              <WalletIcon
                wallet={{
                  icon: wallet.wallet.adapter.icon || '',
                  name: wallet.wallet.adapter.name || 'Unknown Wallet',
                }}
              />
            )}
            <span className="truncate">{content}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          {base58 && (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                copyAddress()
                setDropdownOpen(false)
              }}
              className="gap-2 py-2 px-3 cursor-pointer"
            >
              <Copy className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900">
                {copied ? labels["copied"] : labels["copy-address"]}
              </span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault()
              setDropdownOpen(false)
              // Small delay to ensure dropdown closes before modal opens
              setTimeout(() => {
                openModal()
              }, 100)
            }}
            className="gap-2 py-2 px-3 cursor-pointer"
          >
            <ArrowRightLeft className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">{labels["change-wallet"]}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault()
              // Close dropdown and disconnect wallet
              setDropdownOpen(false)
              disconnectWallet()
            }}
            className="gap-2 py-2 px-3 cursor-pointer"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">{labels["disconnect"]}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
