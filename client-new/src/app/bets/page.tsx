'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Target, Clock, TrendingUp, Plus, ExternalLink, DollarSign, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWalletConnection } from '@/hooks/solanaHooks'
import { useAuthToken } from '@/hooks/useAuthToken'
import { getBets, getBetStats } from '@/api'
import type { Bet } from '@/types'

export default function BetsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  const { isConnected } = useWalletConnection()
  const authToken = useAuthToken()
  const isAuthenticated = isConnected && !!authToken

  const { data: betStats } = useQuery({
    queryKey: ['bet-stats'],
    queryFn: getBetStats,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  const { data: betsResponse, isLoading, isError, error } = useQuery({
    queryKey: ['bets', activeTab],
    queryFn: () => getBets({ status: activeTab === 'active' ? 'active' : 'settled', limit: 20 }),
    enabled: isAuthenticated,
  })

  const bets: Bet[] = betsResponse?.data ?? []

  const formatValue = (value = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const formatTimeRemaining = (settlementDate?: string | null) => {
    if (!settlementDate) return '—'
    const now = new Date()
    const settlement = new Date(settlementDate)
    const remaining = settlement.getTime() - now.getTime()
    if (remaining <= 0) return 'Settling...'
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    return `${days}d ${hours}h`
  }

  const handlePlaceBet = () => {
    console.log('Open place bet modal')
  }

  const handleViewTrend = (trendId: string) => {
    console.log('Navigate to trend', trendId)
  }

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 space-y-4">
          <Target className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Connect your wallet to see your betting performance.</p>
        </div>
      </div>
    )
  }


  if (!authToken) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 space-y-4">
          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <p className="text-muted-foreground">
            Sign the authentication message to load your live betting history.
          </p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message || 'Unable to load bets right now.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Betting Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card className="card-matte">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Bets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{betStats?.activeBets ?? 0}</div>
            <div className="text-sm text-muted-foreground">
              {formatValue(betStats?.totalStaked ?? 0)} at risk
            </div>
          </CardContent>
        </Card>

        <Card className="card-matte">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatValue(betStats?.totalPayouts ?? 0)}</div>
            <div className="text-sm text-muted-foreground">
              From settled bets
            </div>
          </CardContent>
        </Card>

        <Card className="card-matte">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(betStats?.winRate ?? 0).toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">
              {betStats?.settledBets ?? 0} settled bets
            </div>
          </CardContent>
        </Card>

        <Card className="card-matte">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net P&amp;L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (betStats?.netProfit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatValue(betStats?.netProfit ?? 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              Overall return
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('active')}
          >
            Active Bets ({activeTab === 'active' ? bets.length : betStats?.activeBets ?? 0})
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('history')}
          >
            History ({activeTab === 'history' ? bets.length : betStats?.settledBets ?? 0})
          </Button>
        </div>
        <Button onClick={handlePlaceBet} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Place Bet</span>
        </Button>
      </div>

      {/* Active Bets */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card className="card-matte">
              <CardContent className="p-6 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ) : bets.length === 0 ? (
            <Card className="card-matte">
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Bets</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active bets. Place your first bet to get started.
                </p>
                <Button onClick={handlePlaceBet}>
                  <Plus className="h-4 w-4 mr-2" />
                  Place First Bet
                </Button>
              </CardContent>
            </Card>
          ) : (
            bets.map((bet) => (
              <Card key={bet.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold">{bet.trend.title}</h3>
                        <Badge variant={bet.side === 'for' ? 'default' : 'destructive'}>
                          {bet.side === 'for' ? 'For' : 'Against'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Timeframe {bet.timeframe}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{bet.stakeAmount} {bet.stakeCurrency}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>{bet.impliedOdds ? `${bet.impliedOdds.toFixed(2)}x odds` : 'Odds pending'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeRemaining(bet.settlementDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {formatValue(bet.payoutIfWin ?? bet.stakeAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Potential payout
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => handleViewTrend(bet.trend.id)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Bet History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card className="card-matte">
              <CardContent className="p-6 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ) : bets.length === 0 ? (
            <Card className="card-matte">
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bet History</h3>
                <p className="text-muted-foreground">
                  Your settled bets will appear here once they're resolved.
                </p>
              </CardContent>
            </Card>
          ) : (
            bets.map((bet) => {
              const net = (bet.actualPayout ?? 0) - bet.stakeAmount
              return (
                <Card key={bet.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{bet.trend.title}</h3>
                          <Badge variant={bet.side === 'for' ? 'default' : 'destructive'}>
                            {bet.side === 'for' ? 'For' : 'Against'}
                          </Badge>
                          <Badge variant={net >= 0 ? 'default' : 'secondary'}>
                            {bet.result ? bet.result.toUpperCase() : net >= 0 ? 'WON' : 'LOST'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          Settled {bet.settlementDate ? new Date(bet.settlementDate).toLocaleDateString() : '—'}
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{bet.stakeAmount} {bet.stakeCurrency}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{bet.impliedOdds ? `${bet.impliedOdds.toFixed(2)}x odds` : 'n/a'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`text-lg font-semibold ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {net >= 0 ? '+' : ''}{formatValue(net)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {net >= 0 ? 'Profit' : 'Loss'}
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => handleViewTrend(bet.trend.id)}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Betting Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Betting Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Risk Management</h4>
              <div className="text-sm text-muted-foreground">
                Never bet more than 5% of your portfolio on a single trend. 
                Diversify your bets across different timeframes and themes.
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Research First</h4>
              <div className="text-sm text-muted-foreground">
                Study trend performance, community signals, 
                and token fundamentals before placing bets.
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Time Your Bets</h4>
              <div className="text-sm text-muted-foreground">
                Consider market cycles and catalysts that might affect 
                trend performance during your chosen timeframe.
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Track Performance</h4>
              <div className="text-sm text-muted-foreground">
                Monitor your win rate and adjust your strategy based on 
                what's working and what isn't.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}