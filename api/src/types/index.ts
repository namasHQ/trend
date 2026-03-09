// Core types following the technical specification
import { Request } from 'express';

export interface User {
  id: string;
  display_name?: string;
  email?: string;
  avatar_uri?: string;
  created_at: Date;
  reputation: number;
  onchain_pubkey?: string;
  custodial_wallet_id?: string;
  is_banned: boolean;
}

// Authentication types
export interface AuthUser {
  id: string;
  wallet_address: string;
  reputation_score: number;
  level: number;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface Theme {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: Date;
}

export interface TrendContainer {
  id: string;
  canonical_title: string;
  canonical_description?: string;
  theme_id?: string;
  creator_user_id?: string;
  created_at: Date;
  canonical_hash: string;
  status: number; // 0:active,1:archived,2:merged
  theme?: Theme;
  creator?: User;
  signals_count?: number;
  coins_count?: number;
  upvotes?: number;
}

export interface TrendSignal {
  id: string;
  container_id?: string;
  user_id: string;
  source_type?: string; // tiktok, x, reddit, telegram, youtube, manual
  source_id?: string;
  title?: string;
  body?: string;
  metadata?: Record<string, any>;
  created_at: Date;
  is_confirmed: boolean;
  container?: TrendContainer;
  user?: User;
  votes?: Vote[];
}

export interface Coin {
  id: string;
  mint_address: string;
  symbol?: string;
  name?: string;
  added_by?: string;
  container_id?: string;
  created_at: Date;
  first_seen_at?: Date;
  risk_level: number; // 0:low,1:medium,2:high
  added_by_user?: User;
  container?: TrendContainer;
  metrics?: CoinMetrics[];
  performance_score?: number;
}

export interface CoinMetrics {
  coin_id: string;
  ts: Date;
  price?: number;
  volume_24h?: number;
  liquidity_usd?: number;
  holders?: number;
  unique_traders_24h?: number;
  extra?: Record<string, any>;
}

export interface TrendMetrics {
  container_id: string;
  ts: Date;
  signals_count?: number;
  upvotes?: number;
  mentions_total?: number;
  velocity?: number;
  platforms?: Record<string, any>;
}

export interface Vote {
  id: string;
  signal_id: string;
  user_id: string;
  vote: number; // +1 or -1
  created_at: Date;
  signal?: TrendSignal;
  user?: User;
}

export interface PendingReward {
  id: string;
  user_id: string;
  container_id?: string;
  coin_id?: string;
  amount: number; // $TREND smallest unit
  status: string; // pending/withdrawn/failed
  reason?: string;
  created_at: Date;
  onchain_tx?: string;
  user?: User;
  container?: TrendContainer;
  coin?: Coin;
}

export interface RewardDistributionEvent {
  id: string;
  container_id?: string;
  coin_id?: string;
  distribution_json: Record<string, any>;
  created_at: Date;
  container?: TrendContainer;
  coin?: Coin;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  details?: Record<string, any>;
  created_at: Date;
  user?: User;
}

// API Request/Response types
export interface CreateContainerRequest {
  canonical_title: string;
  canonical_description?: string;
  theme_id?: string;
  creator_user_id?: string;
}

export interface CreateSignalRequest {
  container_id?: string;
  source_type?: string;
  source_id?: string;
  title?: string;
  body?: string;
  metadata?: Record<string, any>;
}

export interface CreateCoinRequest {
  mint_address: string;
  symbol?: string;
  name?: string;
  container_id?: string;
}

export interface VoteRequest {
  vote: number; // +1 or -1
}

export interface LinkWalletRequest {
  pubkey: string;
  signature: string;
  nonce_id: string;
}

export interface LinkWalletResponse {
  nonce_id: string;
  message_template: string;
  expires_at: Date;
}

// Performance scoring types
export interface PerformanceScore {
  coin_id: string;
  score: number;
  price_change_24h: number;
  volume_score: number;
  holder_growth_score: number;
  liquidity_score: number;
  calculated_at: Date;
}

// Canonicalization types
export interface ContainerSuggestion {
  container_id: string;
  similarity_score: number;
  match_type: 'exact' | 'fuzzy' | 'embedding';
  matching_phrases: string[];
}

export interface CanonicalizationResult {
  suggestions: ContainerSuggestion[];
  should_auto_attach: boolean;
  normalized_title: string;
  canonical_hash: string;
}

// Worker job types
export interface NormalizeSignalJob {
  signal_id: string;
  title: string;
  body?: string;
}

export interface IndexCoinJob {
  coin_id: string;
  mint_address: string;
}

export interface CalculateScoreJob {
  coin_id: string;
  window_hours: number;
}

export interface DistributeRewardsJob {
  distribution_event_id: string;
}

// Configuration types
export interface ScoringWeights {
  w1: number; // price increase weight
  w2: number; // volume weight
  w3: number; // holder growth weight
  w4: number; // liquidity weight
}

export interface RewardThresholds {
  S_no_reward: number;
  S_small: number;
  S_medium: number;
  S_big: number;
}

export interface PlatformConfig {
  scoring_weights: ScoringWeights;
  reward_thresholds: RewardThresholds;
  early_supporter_window_hours: number;
  oracle_pubkey?: string;
  reward_mint?: string;
}





