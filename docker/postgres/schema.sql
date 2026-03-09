-- TREND Platform - Complete Database Schema
-- This script creates the complete database schema for the TREND alpha hunting platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table with reputation system
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    display_name TEXT,
    password_hash TEXT,
    onchain_pubkey TEXT,
    wallet_address TEXT,
    reputation INTEGER DEFAULT 0,
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Themes/categories for trends
CREATE TABLE themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canonical trend containers (grouped similar trends) with vector embeddings
CREATE TABLE trend_containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    canonical_title TEXT NOT NULL,
    canonical_description TEXT,
    theme_id UUID REFERENCES themes(id),
    creator_user_id UUID REFERENCES users(id),
    creator_wallet TEXT NOT NULL,
    canonical_hash TEXT UNIQUE,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
    embedding_model TEXT DEFAULT 'text-embedding-3-small',
    status SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector similarity index for trend containers
CREATE INDEX IF NOT EXISTS trend_containers_embedding_idx ON trend_containers USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- User-submitted trend signals
CREATE TABLE trend_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES trend_containers(id),
    user_id UUID REFERENCES users(id),
    source_type TEXT,
    source_id TEXT,
    title TEXT,
    body TEXT,
    metadata JSONB,
    is_confirmed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coins linked to trend containers
CREATE TABLE coins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES trend_containers(id),
    mint_address TEXT UNIQUE NOT NULL,
    symbol TEXT,
    name TEXT,
    added_by UUID REFERENCES users(id),
    initial_price DECIMAL(20, 8),
    initial_holders INTEGER,
    risk_score DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time-series coin metrics
CREATE TABLE coin_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coin_id UUID REFERENCES coins(id),
    ts TIMESTAMPTZ NOT NULL,
    price DECIMAL(20, 8),
    volume_24h DECIMAL(20, 2),
    holders INTEGER,
    liquidity_usd DECIMAL(20, 2),
    extra JSONB,
    UNIQUE(coin_id, ts)
);

-- Voting system for signals
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_id UUID REFERENCES trend_signals(id),
    user_id UUID REFERENCES users(id),
    vote SMALLINT CHECK (vote IN (-1, 0, 1)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(signal_id, user_id)
);

-- ============================================================================
-- REWARD SYSTEM
-- ============================================================================

-- Pending rewards for users
CREATE TABLE pending_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    container_id UUID REFERENCES trend_containers(id),
    coin_id UUID REFERENCES coins(id),
    amount DECIMAL(20, 8),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'withdrawn', 'failed')),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward distribution events for audit
CREATE TABLE reward_distribution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id UUID REFERENCES trend_containers(id),
    coin_id UUID REFERENCES coins(id),
    distribution_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SOCIAL & NOTIFICATIONS
-- ============================================================================

-- User notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Activity logging for audit and compliance
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLATFORM MANAGEMENT
-- ============================================================================

-- Platform configuration
CREATE TABLE platform_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merge suggestions for similar containers
CREATE TABLE merge_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_id_1 UUID REFERENCES trend_containers(id),
    container_id_2 UUID REFERENCES trend_containers(id),
    similarity_score DECIMAL(5, 4),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(container_id_1, container_id_2)
);

-- Bets table for trend betting system
CREATE TABLE IF NOT EXISTS bets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    container_id UUID REFERENCES trend_containers(id),
    stake_amount DECIMAL(20, 8) NOT NULL,
    stake_token TEXT DEFAULT 'USDC', -- $TREND or USDC
    side TEXT NOT NULL CHECK (side IN ('for', 'against')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled BOOLEAN DEFAULT false,
    settlement_amount DECIMAL(20, 8),
    settlement_at TIMESTAMPTZ
);

-- Onchain events table for Solana indexing
CREATE TABLE IF NOT EXISTS onchain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    block_number BIGINT,
    wallet_address TEXT,
    token_mint TEXT,
    amount DECIMAL(20, 8),
    metadata JSONB DEFAULT '{}',
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_onchain_pubkey ON users(onchain_pubkey);
CREATE INDEX idx_users_reputation ON users(reputation);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Themes indexes
CREATE INDEX idx_themes_name ON themes(name);
CREATE INDEX idx_themes_slug ON themes(slug);

-- Trend containers indexes
CREATE INDEX idx_trend_containers_theme_id ON trend_containers(theme_id);
CREATE INDEX idx_trend_containers_creator ON trend_containers(creator_user_id);
CREATE INDEX idx_trend_containers_hash ON trend_containers(canonical_hash);
CREATE INDEX idx_trend_containers_status ON trend_containers(status);
CREATE INDEX idx_trend_containers_created_at ON trend_containers(created_at);

-- Trend signals indexes
CREATE INDEX idx_trend_signals_container_id ON trend_signals(container_id);
CREATE INDEX idx_trend_signals_user_id ON trend_signals(user_id);
CREATE INDEX idx_trend_signals_source_type ON trend_signals(source_type);
CREATE INDEX idx_trend_signals_created_at ON trend_signals(created_at);
CREATE INDEX idx_trend_signals_confirmed ON trend_signals(is_confirmed);

-- Coins indexes
CREATE INDEX idx_coins_container_id ON coins(container_id);
CREATE INDEX idx_coins_mint_address ON coins(mint_address);
CREATE INDEX idx_coins_added_by ON coins(added_by);
CREATE INDEX idx_coins_created_at ON coins(created_at);

-- Coin metrics indexes
CREATE INDEX idx_coin_metrics_coin_id ON coin_metrics(coin_id);
CREATE INDEX idx_coin_metrics_ts ON coin_metrics(ts);
CREATE INDEX idx_coin_metrics_coin_ts ON coin_metrics(coin_id, ts);

-- Votes indexes
CREATE INDEX idx_votes_signal_id ON votes(signal_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_created_at ON votes(created_at);

-- Pending rewards indexes
CREATE INDEX idx_pending_rewards_user_id ON pending_rewards(user_id);
CREATE INDEX idx_pending_rewards_status ON pending_rewards(status);
CREATE INDEX idx_pending_rewards_created_at ON pending_rewards(created_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Activity log indexes
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_resource ON activity_log(resource_type, resource_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- Merge suggestions indexes
CREATE INDEX idx_merge_suggestions_container_1 ON merge_suggestions(container_id_1);
CREATE INDEX idx_merge_suggestions_container_2 ON merge_suggestions(container_id_2);
CREATE INDEX idx_merge_suggestions_status ON merge_suggestions(status);

-- Bets indexes
CREATE INDEX idx_bets_user_id ON bets(user_id);
CREATE INDEX idx_bets_container_id ON bets(container_id);
CREATE INDEX idx_bets_created_at ON bets(created_at);
CREATE INDEX idx_bets_settled ON bets(settled);

-- Onchain events indexes
CREATE INDEX idx_onchain_events_wallet ON onchain_events(wallet_address);
CREATE INDEX idx_onchain_events_token_mint ON onchain_events(token_mint);
CREATE INDEX idx_onchain_events_processed ON onchain_events(processed);
CREATE INDEX idx_onchain_events_created_at ON onchain_events(created_at);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.vote = 1 THEN
            UPDATE trend_signals SET upvotes = COALESCE(upvotes, 0) + 1 WHERE id = NEW.signal_id;
        ELSIF NEW.vote = -1 THEN
            UPDATE trend_signals SET downvotes = COALESCE(downvotes, 0) + 1 WHERE id = NEW.signal_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle vote changes
        IF OLD.vote = 1 AND NEW.vote = -1 THEN
            UPDATE trend_signals SET upvotes = COALESCE(upvotes, 0) - 1, downvotes = COALESCE(downvotes, 0) + 1 WHERE id = NEW.signal_id;
        ELSIF OLD.vote = -1 AND NEW.vote = 1 THEN
            UPDATE trend_signals SET downvotes = COALESCE(downvotes, 0) - 1, upvotes = COALESCE(upvotes, 0) + 1 WHERE id = NEW.signal_id;
        ELSIF OLD.vote = 1 AND NEW.vote = 0 THEN
            UPDATE trend_signals SET upvotes = COALESCE(upvotes, 0) - 1 WHERE id = NEW.signal_id;
        ELSIF OLD.vote = -1 AND NEW.vote = 0 THEN
            UPDATE trend_signals SET downvotes = COALESCE(downvotes, 0) - 1 WHERE id = NEW.signal_id;
        ELSIF OLD.vote = 0 AND NEW.vote = 1 THEN
            UPDATE trend_signals SET upvotes = COALESCE(upvotes, 0) + 1 WHERE id = NEW.signal_id;
        ELSIF OLD.vote = 0 AND NEW.vote = -1 THEN
            UPDATE trend_signals SET downvotes = COALESCE(downvotes, 0) + 1 WHERE id = NEW.signal_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.vote = 1 THEN
            UPDATE trend_signals SET upvotes = COALESCE(upvotes, 0) - 1 WHERE id = OLD.signal_id;
        ELSIF OLD.vote = -1 THEN
            UPDATE trend_signals SET downvotes = COALESCE(downvotes, 0) - 1 WHERE id = OLD.signal_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Add upvotes/downvotes columns to trend_signals
ALTER TABLE trend_signals ADD COLUMN IF NOT EXISTS upvotes INTEGER DEFAULT 0;
ALTER TABLE trend_signals ADD COLUMN IF NOT EXISTS downvotes INTEGER DEFAULT 0;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trend_containers_updated_at BEFORE UPDATE ON trend_containers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_rewards_updated_at BEFORE UPDATE ON pending_rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merge_suggestions_updated_at BEFORE UPDATE ON merge_suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vote_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default themes
INSERT INTO themes (name, slug, description, color) VALUES
('AI', 'ai', 'Artificial Intelligence and Machine Learning trends', '#3B82F6'),
('Frog', 'frog', 'Frog meme and Pepe-related trends', '#10B981'),
('Gaming', 'gaming', 'Gaming and NFT gaming trends', '#8B5CF6'),
('Elon', 'elon', 'Elon Musk and Tesla-related trends', '#F59E0B'),
('Doge', 'doge', 'Dogecoin and dog meme trends', '#EF4444'),
('Pump', 'pump', 'Pump and dump related trends', '#EC4899'),
('Chad', 'chad', 'Chad and alpha male trends', '#06B6D4'),
('Wojak', 'wojak', 'Wojak and meme trends', '#84CC16')
ON CONFLICT (name) DO NOTHING;

-- Insert default platform configuration
INSERT INTO platform_config (key, value, description) VALUES
('scoring_weights', '{"w1": 0.4, "w2": 0.3, "w3": 0.2, "w4": 0.1}', 'Performance scoring weights'),
('reward_thresholds', '{"S_no_reward": 200, "S_small": 500, "S_medium": 750, "S_big": 900}', 'Reward tier thresholds'),
('early_supporter_window_hours', '72', 'Early supporter time window in hours'),
('oracle_pubkey', 'null', 'Oracle public key for reward distribution'),
('reward_mint', 'null', 'Reward token mint address'),
('escrow_account', 'null', 'Escrow account for reward distribution')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for container statistics
CREATE OR REPLACE VIEW container_stats AS
SELECT 
    tc.id,
    tc.canonical_title,
    tc.canonical_description,
    tc.theme_id,
    t.name as theme_name,
    t.color as theme_color,
    tc.creator_user_id,
    u.display_name as creator_name,
    COUNT(DISTINCT ts.id) as signals_count,
    COUNT(DISTINCT c.id) as coins_count,
    COALESCE(SUM(v.vote), 0) as total_votes,
    tc.created_at,
    tc.updated_at
FROM trend_containers tc
LEFT JOIN themes t ON tc.theme_id = t.id
LEFT JOIN users u ON tc.creator_user_id = u.id
LEFT JOIN trend_signals ts ON tc.id = ts.container_id
LEFT JOIN coins c ON tc.id = c.container_id
LEFT JOIN votes v ON ts.id = v.signal_id
WHERE tc.status = 0
GROUP BY tc.id, tc.canonical_title, tc.canonical_description, tc.theme_id, 
         t.name, t.color, tc.creator_user_id, u.display_name, tc.created_at, tc.updated_at;

-- View for user reputation
CREATE OR REPLACE VIEW user_reputation AS
SELECT 
    u.id,
    u.display_name,
    u.reputation,
    COUNT(DISTINCT ts.id) as signals_created,
    COUNT(DISTINCT c.id) as coins_spotted,
    COUNT(DISTINCT v.id) as votes_cast,
    COALESCE(SUM(pr.amount), 0) as total_rewards,
    u.created_at
FROM users u
LEFT JOIN trend_signals ts ON u.id = ts.user_id
LEFT JOIN coins c ON u.id = c.added_by
LEFT JOIN votes v ON u.id = v.user_id
LEFT JOIN pending_rewards pr ON u.id = pr.user_id AND pr.status = 'withdrawn'
WHERE u.is_banned = false
GROUP BY u.id, u.display_name, u.reputation, u.created_at;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- Create a completion log entry
INSERT INTO activity_log (user_id, action, resource_type, resource_id, metadata) 
VALUES (NULL, 'database_schema_created', 'system', 'schema', '{"version": "1.0", "timestamp": "' || NOW() || '"}');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'TREND Platform database schema created successfully!';
    RAISE NOTICE 'Tables created: users, themes, trend_containers, trend_signals, coins, coin_metrics, votes, pending_rewards, reward_distribution_events, notifications, activity_log, platform_config, merge_suggestions';
    RAISE NOTICE 'Views created: container_stats, user_reputation';
    RAISE NOTICE 'Default themes and configuration inserted';
END $$;
