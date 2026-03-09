'use client'

import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Wallet, RefreshCw, TrendingUp, TrendingDown, ExternalLink, PieChart, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWalletConnection } from '@/hooks/solanaHooks'
import { useAuthToken } from '@/hooks/useAuthToken'
import { getPortfolioSummary, syncPortfolio } from '@/api'
import type { Portfolio, PortfolioHolding, PortfolioTrendExposure } from '@/types'

export default function PortfolioPage() {
  const { isConnected } = useWalletConnection()
  const authToken = useAuthToken()
  const queryClient = useQueryClient()

  const isAuthenticated = isConnected && !!authToken

  const { data: portfolio, isLoading, isError, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolioSummary,
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  const syncMutation = useMutation({
    mutationFn: syncPortfolio,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })

  const formatValue = (value = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const formatPercentage = (value = 0) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  const holdings: PortfolioHolding[] = portfolio?.holdings ?? []
  const exposure: PortfolioTrendExposure[] = portfolio?.trendExposure ?? []

  const topHolding = useMemo(() => {
    if (!holdings.length) return null
    return [...holdings].sort((a, b) => b.value - a.value)[0]
  }, [holdings])

  const topTrend = useMemo(() => {
    if (!exposure.length) return null
    return [...exposure].sort((a, b) => b.portfolio_percentage - a.portfolio_percentage)[0]
  }, [exposure])

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 space-y-6">
          <Wallet className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">
            Connect your Solana wallet to view your live portfolio and trend exposure.
          </p>
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
            Authenticate your wallet to fetch real portfolio data. Sign in via the wallet modal to continue.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm text-muted-foreground">
              {(error as Error)?.message || 'Unable to load portfolio data right now.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const changeClass = portfolio && portfolio.change24hPercent >= 0 ? 'text-green-600' : 'text-red-600'
  const ChangeIcon = portfolio && portfolio.change24hPercent >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Last synced {portfolio?.lastSynced ? new Date(portfolio.lastSynced).toLocaleTimeString() : '—'}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                >
                  <RefreshCw className={`h-3 w-3 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold">{formatValue(portfolio?.totalValue)}</div>
            <div className={`text-sm flex items-center gap-1 ${changeClass}`}>
              <ChangeIcon className="h-3 w-3" />
              {formatPercentage(portfolio?.change24hPercent)} (24h)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">Holdings</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold">{holdings.length}</div>
            <p className="text-sm text-muted-foreground">Tracked assets in your wallet</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-medium">Trend Exposure</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-bold">{exposure.length}</div>
            <p className="text-sm text-muted-foreground">Active TREND narratives</p>
          </CardContent>
        </Card>
      </div>

      {/* Token Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Token Holdings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {holdings.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No on-chain holdings found for your connected wallet.
            </p>
          )}
          {holdings.map((token) => (
            <div
              key={`${token.mintAddress}-${token.token}`}
              className="flex flex-wrap items-center justify-between gap-4 p-4 border rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-[180px]">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold">
                  {token.token.slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold">{token.token}</div>
                  <div className="text-xs text-muted-foreground">{token.mintAddress.slice(0, 4)}...{token.mintAddress.slice(-4)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatValue(token.value)}</div>
                <div className="text-sm text-muted-foreground">
                  {token.amount.toFixed(4)} {token.token}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${token.change24hPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(token.change24hPercent)}
                </div>
                <div className="text-xs text-muted-foreground">24h change</div>
              </div>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trend Exposure */}
      <Card>
        <CardHeader>
          <CardTitle>Trend Exposure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {exposure.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              We couldn&apos;t map your holdings to existing TREND narratives yet.
            </p>
          )}
          {exposure.map((item) => (
            <div key={item.trend_id} className="space-y-2 border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.trend_title}</div>
                  <div className="text-xs text-muted-foreground">Exposure based on overlapping tokens</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.portfolio_percentage.toFixed(1)}%</div>
                  <div className={`text-sm ${item.trend_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(item.trend_return)}
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(item.portfolio_percentage, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Portfolio Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-xl">
            <div className="text-xs uppercase text-muted-foreground">Top Holding</div>
            <div className="text-lg font-semibold mt-1">
              {topHolding ? `${topHolding.token} • ${formatValue(topHolding.value)}` : 'No holdings'}
            </div>
          </div>
          <div className="p-4 border rounded-xl">
            <div className="text-xs uppercase text-muted-foreground">Largest Trend Exposure</div>
            <div className="text-lg font-semibold mt-1">
              {topTrend ? `${topTrend.trend_title} • ${topTrend.portfolio_percentage.toFixed(1)}%` : 'Not mapped yet'}
            </div>
          </div>
          <div className="p-4 border rounded-xl">
            <div className="text-xs uppercase text-muted-foreground">Wallet Address</div>
            <div className="text-sm font-mono mt-1">
              {portfolio?.walletAddress || 'Unknown'}
            </div>
          </div>
          <div className="p-4 border rounded-xl">
            <div className="text-xs uppercase text-muted-foreground">24h Performance</div>
            <div className={`text-lg font-semibold mt-1 ${changeClass}`}>
              {formatPercentage(portfolio?.change24hPercent)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
