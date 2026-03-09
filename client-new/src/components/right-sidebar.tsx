'use client'

import { useState } from 'react'
import { TrendingUp, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RightSidebarProps {
  className?: string
}

export function RightSidebar({ className }: RightSidebarProps) {
  const [isHovered, setIsHovered] = useState(false)

  const topSignalers = [
    { name: '@crypto_analyst', score: 94, signals: 127 },
    { name: '@defi_expert', score: 89, signals: 89 },
    { name: '@ai_trader', score: 87, signals: 156 },
  ]

  const recentBets = [
    { trend: 'AI Coins', amount: '50 TREND', side: 'for', time: '2m ago' },
    { trend: 'DeFi Yield', amount: '25 TREND', side: 'against', time: '5m ago' },
    { trend: 'Gaming Tokens', amount: '100 TREND', side: 'for', time: '8m ago' },
  ]

  const priceTickers = [
    { symbol: 'SOL', price: '$98.45', change: '+2.3%' },
    { symbol: 'TREND', price: '$0.12', change: '+5.7%' },
    { symbol: 'USDC', price: '$1.00', change: '0.0%' },
  ]

  return (
    <aside 
      className={cn(
        "border-l bg-white h-full flex flex-col absolute right-0 z-40",
        "transition-all duration-300 ease-in-out",
        isHovered ? "w-80" : "w-12",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Collapsed Labels/Tabs */}
      <div 
        className={cn(
          "flex-1 flex flex-col justify-center items-center space-y-8 py-4 w-12",
          "transition-opacity duration-300 ease-in-out",
          isHovered ? "opacity-0 absolute pointer-events-none" : "opacity-100"
        )}
      >
          <div className="flex flex-col items-center space-y-2">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <span 
              className="text-xs font-medium text-muted-foreground"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Prices
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span 
              className="text-xs font-medium text-muted-foreground"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Signalers
            </span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span 
              className="text-xs font-medium text-muted-foreground"
              style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
            >
              Bets
            </span>
          </div>
        </div>

      {/* Expanded Content */}
      <div 
        className={cn(
          "w-80 space-y-4 p-4 overflow-y-auto flex-1",
          "transition-opacity duration-300 ease-in-out",
          isHovered ? "opacity-100" : "opacity-0 absolute pointer-events-none"
        )}
      >
        {/* Price Tickers */}
        <Card className="card-matte w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary-enhanced">Live Prices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priceTickers.map((ticker) => (
              <div key={ticker.symbol} className="flex justify-between items-center w-full">
                <span className="font-semibold text-sm text-primary-enhanced">{ticker.symbol}</span>
                <div className="text-right">
                  <div className="font-mono text-sm font-medium text-secondary-enhanced">{ticker.price}</div>
                  <div className={cn(
                    "text-xs font-medium",
                    ticker.change.startsWith('+') ? "text-success-enhanced" : 
                    ticker.change.startsWith('-') ? "text-danger-enhanced" : "text-muted-enhanced"
                  )}>
                    {ticker.change}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Signalers */}
        <Card className="card-matte w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary-enhanced">Top Signalers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topSignalers.map((signaler, index) => (
              <div key={signaler.name} className="flex justify-between items-center w-full">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <span className="text-xs font-medium text-muted-enhanced flex-shrink-0">#{index + 1}</span>
                  <span className="font-semibold text-sm text-primary-enhanced truncate">{signaler.name}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm text-secondary-enhanced">{signaler.score}</div>
                  <div className="text-xs text-muted-enhanced">{signaler.signals} signals</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Bets */}
        <Card className="card-matte w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-primary-enhanced">Recent Bets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBets.map((bet, index) => (
              <div key={index} className="flex justify-between items-center w-full">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-primary-enhanced truncate">{bet.trend}</div>
                  <div className="text-xs text-muted-enhanced">{bet.time}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm text-secondary-enhanced">{bet.amount}</div>
                  <div className={cn(
                    "text-xs font-medium",
                    bet.side === 'for' ? "text-success-enhanced" : "text-danger-enhanced"
                  )}>
                    {bet.side}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
