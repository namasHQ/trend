'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { User, Trophy, Star, Award, TrendingUp, Target, Wallet, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats } from '@/api'
import type { UserProfile, Badge as BadgeType } from '@/types'


// Mock user profile data
const mockProfile: UserProfile = {
  id: 'user-1',
  walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  reputationScore: 87,
  level: 12,
  xp: 2340,
  TRENDBalance: 45.7,
  badges: [
    {
      id: '1',
      name: 'Early Signaler',
      description: 'Created 10+ trending signals',
      icon: '🎯',
      earned_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      name: 'Consistent Winner',
      description: '70%+ win rate on bets',
      icon: '🏆',
      earned_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      name: 'Community Leader',
      description: 'Top 10% signaler this month',
      icon: '⭐',
      earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
}


export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards'>('overview')

  const { data: dashboardStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  })

  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`
  }

  // Calculate XP to next level (assuming level 13 requires more XP)
  const xpToNextLevel = (mockProfile.level + 1) * 500 - mockProfile.xp
  const xpProgress = (mockProfile.xp / (mockProfile.xp + xpToNextLevel)) * 100

  // Mock additional stats that aren't in UserProfile but used in UI
  const totalRewards = 45.7
  const signalsCount = 127
  const betsCount = 23
  const winRate = 73.9

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-4">

              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {mockProfile.walletAddress.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">

                <h2 className="text-xl font-bold">{formatWallet(mockProfile.walletAddress)}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary">Level {mockProfile.level}</Badge>
                  <Badge variant="outline">{mockProfile.reputationScore}/100 Rep</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* XP Progress */}
            <div className="mb-6">

            <div className="flex justify-between text-sm mb-2">
                <span>Experience Points</span>
                <span>{mockProfile.xp}/{mockProfile.xp + xpToNextLevel}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${xpProgress}%` }}
                ></div>
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                {xpToNextLevel} XP to next level
              </div>
            </div>


            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalRewards}</div>
                <div className="text-sm text-muted-foreground">TREND Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{signalsCount}</div>
                <div className="text-sm text-muted-foreground">Signals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{betsCount}</div>
                <div className="text-sm text-muted-foreground">Bets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{winRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <Wallet className="h-4 w-4 mr-2" />
              Withdraw Rewards
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Signals
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Target className="h-4 w-4 mr-2" />
              Bet History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'rewards' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('rewards')}
        >
          Rewards
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Badges */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {mockProfile.badges.map((badge) => (
                  <div key={badge.id || Math.random()} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <div className="text-2xl">{badge.icon || '🏆'}</div>
                    <div className="flex-1">
                      <div className="font-semibold">{badge.name || 'Achievement'}</div>
                      <div className="text-sm text-muted-foreground">{badge.description || 'No description'}</div>

                      <div className="text-xs text-muted-foreground">
                        Earned {badge.earned_at ? new Date(badge.earned_at).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Won bet on "AI Coins" trend</div>
                    <div className="text-sm text-muted-foreground">+2.5 TREND reward</div>
                  </div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Signal gained 15 upvotes</div>
                    <div className="text-sm text-muted-foreground">"DeFi Yield Farming" trend</div>
                  </div>
                  <div className="text-sm text-muted-foreground">1 day ago</div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Leveled up to Level 12</div>
                    <div className="text-sm text-muted-foreground">+50 XP bonus</div>
                  </div>
                  <div className="text-sm text-muted-foreground">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rewards Tab */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Winning Bet Reward</div>
                      <div className="text-sm text-muted-foreground">AI Coins trend</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+2.5 TREND</div>
                    <div className="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">Signal Performance Reward</div>
                      <div className="text-sm text-muted-foreground">DeFi Yield Farming</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+1.2 TREND</div>
                    <div className="text-sm text-muted-foreground">1 day ago</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Achievement Bonus</div>
                      <div className="text-sm text-muted-foreground">Level 12 milestone</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">+5.0 TREND</div>
                    <div className="text-sm text-muted-foreground">3 days ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader>
              <CardTitle>How Rewards Work</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Signal Rewards</h4>
                  <div className="text-sm text-muted-foreground">
                    Earn TREND tokens when your signals perform well. Rewards are calculated based on 
                    trend performance, community engagement, and accuracy over time.
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Betting Rewards</h4>
                  <div className="text-sm text-muted-foreground">
                    Win additional TREND tokens when your bets are successful. Higher stakes and 
                    longer timeframes offer better reward multipliers.
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Achievement Bonuses</h4>
                  <div className="text-sm text-muted-foreground">
                    Unlock bonus rewards for reaching milestones, maintaining streaks, 
                    and contributing to the community.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
