'use client'

import { Button } from "@/components/ui/button"
import type { Wallet } from "@solana/wallet-adapter-react"
import { WalletReadyState } from "@solana/wallet-adapter-base"

interface WalletListItemProps {
  wallet: Wallet
  handleClick: () => void
}

export function WalletListItem({ wallet, handleClick }: WalletListItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-between gap-4 px-4 py-3 border border-gray-200 bg-white text-gray-900"
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        <img
          src={wallet.adapter.icon || "/placeholder.svg"}
          alt={`${wallet.adapter.name} icon`}
          width={32}
          height={32}
          className="rounded"
        />
        <span className="text-base font-semibold text-gray-900">{wallet.adapter.name}</span>
      </div>
      {wallet.readyState === WalletReadyState.Installed && (
        <span className="text-sm font-medium text-blue-600">Detected</span>
      )}
    </Button>
  )
}

