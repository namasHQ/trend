'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Wallet, Activity, Target, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendCard } from '@/components/trend-card'
import { CreateTrendModal } from '@/components/modals/create-trend-modal'
import { CreateTrendButton } from '@/components/wallet-required-action'
import { getDashboardStats, getTrends } from '@/api'
import type { Trend, DashboardStats } from '@/types'

export default function HomePage() {
  const [isCreateTrendOpen, setIsCreateTrendOpen] = useState(false)
  
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['trends', { page: 1, limit: 6 }],
    queryFn: () => getTrends({ page: 1, limit: 6 }),
  })

  const handleTrendView = (trend: Trend) => {
    console.log('View trend:', trend.id)
    // TODO: Navigate to trend detail
  }

  const handleTrendBet = (trend: Trend) => {
    console.log('Bet on trend:', trend.id)
    // TODO: Open bet modal
  }

  const handleTrendSignal = (trend: Trend) => {
    console.log('Signal trend:', trend.id)
    // TODO: Open signal modal
  }

  const handleTrendFollow = (trend: Trend) => {
    console.log('Follow trend:', trend.id)
    // TODO: Follow/unfollow trend
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-primary-enhanced">Total Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : dashboardStats?.total_trends || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active trend signals
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-primary-enhanced">Active Signals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : dashboardStats?.active_signals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Community signals today
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-primary-enhanced">Total Users</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : dashboardStats?.total_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered signalers
            </p>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold text-primary-enhanced">Volume</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : `$${(dashboardStats?.total_volume || 0).toLocaleString()}`}
            </div>
            <p className="text-xs text-muted-foreground">
              Total bet volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Market Mood */}
      <Card className="card-matte">
        <CardHeader>
          <CardTitle className="text-lg text-primary-enhanced">Market Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="text-2xl">
              {dashboardStats?.market_mood === 'bull' ? '🐂' : 
               dashboardStats?.market_mood === 'bear' ? '🐻' : '😐'}
            </div>
            <div>
              <div className="text-lg font-semibold capitalize">
                {dashboardStats?.market_mood || 'neutral'} market
              </div>
              <div className="text-sm text-muted-foreground">
                Based on recent trend performance and community sentiment
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Trends */}
      <div>
        <div className="flex flex-col gap-4">
          {trendsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse h-32">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-20 w-20 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </CardContent>
              </Card>
            ))
          ) : trends?.data.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-enhanced">No trends available at the moment.</p>
            </div>
          ) : (
            trends?.data.map((trend) => (
              <TrendCard
                key={trend.id}
                trend={trend}
                onView={handleTrendView}
                onBet={handleTrendBet}
                onSignal={handleTrendSignal}
                onFollow={handleTrendFollow}
              />
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CreateTrendButton>
              <button 
                className="p-4 border rounded-lg text-left w-full"
                onClick={() => setIsCreateTrendOpen(true)}
              >
                <div className="font-medium mb-1 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Trend
                </div>
                <div className="text-sm text-muted-foreground">
                  Signal a new crypto trend
                </div>
              </button>
            </CreateTrendButton>
            
            <button className="p-4 border rounded-lg hover:bg-muted transition-colors text-left">
              <div className="font-medium mb-1 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Sync Portfolio
              </div>
              <div className="text-sm text-muted-foreground">
                Update your wallet holdings
              </div>
            </button>
            
            <button className="p-4 border rounded-lg hover:bg-muted transition-colors text-left">
              <div className="font-medium mb-1 flex items-center gap-2">
                <Target className="h-4 w-4" />
                View Active Bets
              </div>
              <div className="text-sm text-muted-foreground">
                Check your betting positions
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Create Trend Modal */}
      <CreateTrendModal 
        isOpen={isCreateTrendOpen}
        onClose={() => setIsCreateTrendOpen(false)}
      />
    </div>
  )
}