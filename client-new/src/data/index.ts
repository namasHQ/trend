
import type { Trend, DashboardStats, Agent, AgentStats } from '@/types'

export const trends: Trend[] = [
  {
    id: '1',
    title: 'AI & Machine Learning Tokens',
    description: 'Emerging AI tokens showing strong momentum with institutional adoption',
    creator_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    theme_id: 'ai-ml',
    coin_list: ['SOL', 'RNDR', 'FET', 'AGIX'],
    signals_count: 1247,
    coins_count: 4,
    upvotes: 892,
    downvotes: 45,
    performance: 24.5,
    confidence: 87,
    prediction: 'bullish',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'DeFi Yield Farming',
    description: 'High-yield DeFi protocols gaining traction in the current market',
    creator_wallet: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
    theme_id: 'defi',
    coin_list: ['JUP', 'RAY', 'ORCA', 'MNDE'],
    signals_count: 892,
    coins_count: 4,
    upvotes: 654,
    downvotes: 23,
    performance: 18.2,
    confidence: 78,
    prediction: 'bullish',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Gaming & Metaverse',
    description: 'Gaming tokens and metaverse projects showing renewed interest',
    creator_wallet: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
    theme_id: 'gaming',
    coin_list: ['ATLAS', 'POLIS', 'GST', 'GMT'],
    signals_count: 567,
    coins_count: 4,
    upvotes: 423,
    downvotes: 67,
    performance: -5.3,
    confidence: 65,
    prediction: 'bearish',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const dashboardStats: DashboardStats = {
  total_trends: 156,
  active_signals: 2341,
  total_users: 12500,
  total_volume: 45000000,
  market_mood: 'bull',
  top_trends: trends.slice(0, 3),

  recent_activity: [
    {
      type: 'signal',
      description: 'Created signal for AI tokens trend',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'bet',
      description: 'Placed bet on DeFi yield farming',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },

  ],
}

// Mock agent data
export const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'AI Trend Analyzer',
    description: 'Specializes in analyzing AI and machine learning token trends with high accuracy',
    owner_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    status: 'active',
    deployment_tx: '5A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    total_predictions: 47,
    successful_predictions: 38,
    accuracy: 80.9,
    last_prediction_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'agent-2',
    name: 'DeFi Oracle',
    description: 'Expert in DeFi protocol analysis and yield farming predictions',
    owner_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    status: 'active',
    deployment_tx: '6B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    total_predictions: 23,
    successful_predictions: 19,
    accuracy: 82.6,
    last_prediction_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'agent-3',
    name: 'Crypto Momentum Hunter',
    description: 'Focuses on momentum-based trading signals and trend reversals',
    owner_wallet: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    status: 'deploying',
    deployment_tx: '7C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    total_predictions: 0,
    successful_predictions: 0,
    accuracy: undefined,
    last_prediction_at: undefined,
  },
]

export const mockAgentStats: AgentStats = {
  totalAgents: 3,
  activeAgents: 2,
  totalPredictions: 70,
  averageAccuracy: 81.8,
  totalDeployed: 3,
}
