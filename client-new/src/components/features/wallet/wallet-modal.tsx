"use client"

import { useState, useMemo } from "react"
import { WalletName, WalletReadyState } from "@solana/wallet-adapter-base"
import { useWallet } from "@solana/wallet-adapter-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWalletModal } from "@/providers"
import { WalletListItem } from "@/components/features/wallet/wallet-list-item"
import { MoreWalletsButton } from "@/components/features/wallet/more-wallets-button"
import { NoWalletsFound } from "@/components/features/wallet/no-wallets-found"
import { Wallet } from "lucide-react"

export function WalletModal() {
  const { wallets, select, connect, connecting } = useWallet()
  const { visible, setVisible } = useWalletModal()
  const [expanded, setExpanded] = useState(false)

  const [listedWallets, collapsedWallets] = useMemo(() => {
    const installed = wallets.filter(
      (wallet) => wallet.readyState === WalletReadyState.Installed
    )
    const notInstalled = wallets.filter(
      (wallet) => wallet.readyState !== WalletReadyState.Installed
    )
    return installed.length ? [installed, notInstalled] : [notInstalled, []]
  }, [wallets])

  const handleWalletClick = async (walletName: WalletName) => {
    try {
      // Find the selected wallet
      const selectedWallet = wallets.find(w => w.adapter.name === walletName)
      if (!selectedWallet) {
        console.error('Wallet not found:', walletName)
        return
      }

      // Select the wallet
      select(walletName)

      // Wait for the wallet to be ready
      let attempts = 0
      const maxAttempts = 20 // 1 second total (50ms * 20)
      
      while (attempts < maxAttempts) {
        if (selectedWallet.readyState === WalletReadyState.Installed) {
          try {
            await connect()
            setVisible(false)
            return
          } catch (error) {
            if (error instanceof Error && error.name === 'WalletNotSelectedError') {
              // Wait a bit and try again
              await new Promise(resolve => setTimeout(resolve, 50))
              attempts++
              continue
            }
            throw error
          }
        }
        await new Promise(resolve => setTimeout(resolve, 50))
        attempts++
      }

      throw new Error('Wallet selection timeout')
    } catch (error) {
      console.error('Error connecting wallet:', error)
      // Keep modal open on error so user can try again
    }
  }

  const handleExpandClick = () => setExpanded(!expanded)

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="sm:max-w-[425px] bg-white" aria-describedby="wallet-connect-description">
        <DialogHeader className="py-4">
          <div className="bg-primary text-white p-4 rounded-full w-fit mx-auto">
            <Wallet className="size-10" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-gray-900 mt-4">
            Connect a wallet on Solana to continue
          </DialogTitle>
          <DialogDescription id="wallet-connect-description" className="text-center text-gray-600 mt-2">
            Connect your Solana wallet to access the application and start trading
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px]">
          <div className="flex flex-col gap-2 p-1">
            {listedWallets.map((wallet) => (
              <WalletListItem
                key={wallet.adapter.name}
                wallet={wallet}
                handleClick={() => handleWalletClick(wallet.adapter.name)}
              />
            ))}
          </div>
          {collapsedWallets.length > 0 && (
            <>
              <MoreWalletsButton
                expanded={expanded}
                onClick={handleExpandClick}
              />
              {expanded &&
                collapsedWallets.map((wallet) => (
                  <WalletListItem
                    key={wallet.adapter.name}
                    wallet={wallet}
                    handleClick={() => handleWalletClick(wallet.adapter.name)}
                  />
                ))}
            </>
          )}
          {wallets.length === 0 && <NoWalletsFound />}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
