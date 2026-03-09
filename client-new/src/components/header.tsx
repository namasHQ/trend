'use client'

import { useState } from 'react'
import { TrendingUp, Search, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WalletMultiButton } from '@/components/features/wallet/wallet-multi-button'

interface HeaderProps {
  onWalletConnect?: () => void
}

export function Header({ onWalletConnect }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4 px-4">
        {/* Logo */}
        <div className="flex items-center">
          <a className="flex items-center space-x-2" href="/">
            <TrendingUp className="h-7 w-7" />
            <span className="hidden font-bold text-xl sm:inline-block">TREND</span>
          </a>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search and Wallet - Right aligned */}
        <div className="flex items-center gap-4">
          <div className="w-full max-w-md">
            {isSearchOpen ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search trends, coins, signalers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full border-2 border-gray-300 focus:border-primary"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="h-9 w-9 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="h-9 w-full justify-start text-muted-foreground border border-gray-300 hover:border-gray-400"
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden md:inline text-sm font-medium">Search trends, coins...</span>
                <span className="md:hidden text-sm font-medium">Search</span>
              </Button>
            )}
          </div>

          {/* Wallet Button */}
          <div className="flex items-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  )
}
