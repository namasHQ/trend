'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Plus, TrendingUp, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { TrendCard } from '@/components/trend-card'
import { CreateTrendModal } from '@/components/modals/create-trend-modal'
import { getTrends } from '@/api'
import type { Trend } from '@/types'

export default function TrendsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [sortBy, setSortBy] = useState('trending')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { data: trends, isLoading } = useQuery({
    queryKey: ['trends', { page: 1, limit: 20, sort: sortBy }],
    queryFn: () => getTrends({ page: 1, limit: 20, sort: sortBy }),
  })

  const filters = [
    { id: 'all', label: 'All Trends' },
    { id: 'defi', label: 'DeFi' },
    { id: 'ai-ml', label: 'AI & ML' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'nft', label: 'NFT' },
    { id: 'privacy', label: 'Privacy' },
  ]

  const sortOptions = [
    { id: 'trending', label: 'Trending' },
    { id: 'newest', label: 'Newest' },
    { id: 'performance', label: 'Performance' },
    { id: 'signals', label: 'Most Signals' },
  ]

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

  const handleCreateTrend = () => {
    setIsCreateModalOpen(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-6">
            {/* Search and Actions */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trends (e.g., 'ai coins', 'privacy tokens')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleCreateTrend} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>New Trend</span>
              </Button>
            </div>



            {/* Sort Options */}
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                {sortOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={sortBy === option.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy(option.id)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trends List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
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
          <div className="text-center py-12">
            <p className="text-muted-enhanced text-lg">No trends found matching your criteria.</p>
            <p className="text-muted-enhanced mt-2">Be the first to signal a new trend!</p>
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
                showVoting={true}
              />
            ))
        )}
      </div>

      {/* Load More */}
      {trends && trends.data.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button variant="outline">
            Load More Trends
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!trends || trends.data.length === 0) && (
        <Card className="card-glass">
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No trends found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 
                `No trends match "${searchQuery}". Try a different search term.` :
                'There are no trends in this category yet.'
              }
            </p>
            <Button onClick={handleCreateTrend}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Trend
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trend Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Active Trends</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">2,341</div>
                <div className="text-sm text-muted-foreground">Total Signals</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">12.5k</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Trend Modal */}
      <CreateTrendModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
