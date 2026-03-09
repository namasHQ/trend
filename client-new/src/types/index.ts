// Export agent types
export * from './agents'

// Core types for the TREND application
export interface Trend {
  id: string
  title: string
  description?: string
  creator_wallet: string
  creator_name?: string
  theme_id: string
  coin_list: string[]
  signals_count: number
  coins_count: number
  upvotes: number
  downvotes: number
  performance: number
  confidence: number
  prediction: 'bullish' | 'bearish' | 'neutral'
  created_at: string
  updated_at: string
  followers_count?: number
  community_score?: number
  is_following?: boolean
}

export interface Signal {
  id: string
  trend_id: string
  creator_wallet: string
  creator_name?: string
  content: string
  coins?: string[]
  result?: 'positive' | 'negative' | 'neutral'
  upvotes: number
  created_at: string
}

export interface Bet {
  id: string
  trend: {
    id: string
    title: string
  }
  side: 'for' | 'against'
  timeframe: string
  stakeAmount: number
  stakeCurrency: string
  impliedOdds?: number | null
  payoutIfWin?: number | null
  fees?: number | null
  settlementDate?: string | null
  status: 'active' | 'settled' | 'cancelled'
  result?: string | null
  actualPayout?: number | null
  txHash?: string | null
  createdAt: string
}

export interface BetStats {
  totalBets: number
  activeBets: number
  settledBets: number
  winningBets: number
  losingBets: number
  winRate: number
  totalStaked: number
  totalPayouts: number
  avgStake: number
  netProfit: number
}

export interface Portfolio {
  walletAddress: string
  totalValue: number
  change24h: number
  change24hPercent: number
  lastSynced: string
  holdings: PortfolioHolding[]
  trendExposure: PortfolioTrendExposure[]
}

export interface PortfolioHolding {
  token: string
  amount: number
  value: number
  change24h: number
  change24hPercent: number
  mintAddress: string
}

export interface PortfolioTrendExposure {
  trend_id: string
  trend_title: string
  portfolio_percentage: number
  trend_return: number
}

export interface UserProfile {
  id: string
  walletAddress: string
  reputationScore: number
  level: number
  xp: number
  TRENDBalance: number
  badges: Badge[]
  createdAt: string
  updatedAt: string
}

export interface Badge {
  id?: string
  name?: string
  description?: string
  icon?: string
  earned_at?: string
  [key: string]: any
}

export interface RewardEntry {
  id: string
  amount: number
  reward_type: string
  status: string
  created_at: string
  claimed_at?: string | null
  container?: any
  coin?: any
}

export interface RewardsResponse {
  rewards: RewardEntry[]
  summary: {
    totalEarned: number
    totalClaimed: number
    pending: number
    rewardsCount: number
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface DashboardStats {
  total_trends: number
  active_signals: number
  total_users: number
  total_volume: number
  market_mood: 'bull' | 'neutral' | 'bear'
  top_trends: Trend[]
  recent_activity: Activity[]
}

export interface Activity {
  type: string
  description: string
  timestamp: string
}

export interface WalletConnection {
  isConnected: boolean
  wallet?: string
  balance?: number
  network?: string
}

export interface NotificationSettings {
  bet_settlements: boolean
  rewards: boolean
  trend_updates: boolean
  portfolio_alerts: boolean
}