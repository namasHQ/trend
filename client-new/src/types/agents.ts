// Agent types for TREND platform
export interface Agent {
  id: string
  name: string
  description?: string
  owner_wallet: string
  status: 'active' | 'inactive' | 'deploying' | 'error'
  deployment_tx?: string
  created_at: string
  updated_at: string
  total_predictions: number
  successful_predictions: number
  accuracy?: number
  last_prediction_at?: string
}

export interface AgentPrediction {
  id: string
  agent_id: string
  trend_id?: string
  prediction_type: 'trend' | 'price' | 'signal'
  prediction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  target_price?: number
  timeframe: number // days
  created_at: string
  status: 'pending' | 'active' | 'settled'
  result?: 'correct' | 'incorrect' | 'partial'
  accuracy_score?: number
}

export interface AgentDeploymentParams {
  name: string
  description?: string
  config?: Record<string, any>
}

export interface AgentStats {
  totalAgents: number
  activeAgents: number
  totalPredictions: number
  averageAccuracy: number
  totalDeployed: number
}



