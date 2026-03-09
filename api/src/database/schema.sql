-- Database schema for TREND platform
-- PostgreSQL with pgvector extension

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    reputation_score INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    TREND_balance DECIMAL(18, 8) DEFAULT 0,
    level INTEGER DEFAULT 1,
    badges TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coins table
CREATE TABLE coins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    mint_address VARCHAR(44),
    coingecko_id VARCHAR(50),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trends table
CREATE TABLE trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme_id VARCHAR(50) NOT NULL,
    performance DECIMAL(10, 4) DEFAULT 0,
    confidence INTEGER DEFAULT 0,
    prediction VARCHAR(20) DEFAULT 'neutral' CHECK (prediction IN ('bullish', 'bearish', 'neutral')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'disputed')),
    signals_count INTEGER DEFAULT 0,
    coins_count INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trend-Coins mapping table
CREATE TABLE trend_coins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
    coin_id UUID REFERENCES coins(id) ON DELETE CASCADE,
    weight DECIMAL(5, 4) DEFAULT 1.0,
    UNIQUE(trend_id, coin_id)
);

-- Signals table
CREATE TABLE signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    coins TEXT[] DEFAULT '{}',
    result VARCHAR(20) CHECK (result IN ('green', 'red', 'neutral')),
    accuracy_score DECIMAL(5, 4),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bets table
CREATE TABLE bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_id UUID REFERENCES trends(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    side VARCHAR(10) NOT NULL CHECK (side IN ('for', 'against')),
    stake_amount DECIMAL(18, 8) NOT NULL,
    stake_currency VARCHAR(10) DEFAULT 'TREND',
    implied_odds DECIMAL(5, 4),
    payout_if_win DECIMAL(18, 8),
    fees DECIMAL(18, 8),
    settlement_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'settled', 'cancelled')),
    result VARCHAR(20) CHECK (result IN ('win', 'loss', 'draw')),
    actual_payout DECIMAL(18, 8),
    tx_hash VARCHAR(88),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rewards table
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('signal_accuracy', 'bet_win', 'referral')),
    amount DECIMAL(18, 8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'TREND',
    description TEXT NOT NULL,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Embeddings table for AI similarity
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('trend', 'signal')),
    entity_id UUID NOT NULL,
    vector vector(1536) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- Market snapshots for price tracking
CREATE TABLE market_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coin_id UUID REFERENCES coins(id) ON DELETE CASCADE,
    price_usd DECIMAL(20, 8) NOT NULL,
    market_cap DECIMAL(20, 2),
    volume_24h DECIMAL(20, 2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_trends_created_at ON trends(created_at);
CREATE INDEX idx_trends_theme_id ON trends(theme_id);
CREATE INDEX idx_trends_performance ON trends(performance);
CREATE INDEX idx_signals_user_trend ON signals(user_id, trend_id);
CREATE INDEX idx_bets_settlement ON bets(settlement_date) WHERE status = 'active';
CREATE INDEX idx_bets_user_status ON bets(user_id, status);
CREATE INDEX idx_rewards_user_type ON rewards(user_id, type);
CREATE INDEX idx_embeddings_vector ON embeddings USING hnsw (vector vector_cosine_ops);
CREATE INDEX idx_market_snapshots_coin_timestamp ON market_snapshots(coin_id, timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trends_updated_at BEFORE UPDATE ON trends FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample coins
INSERT INTO coins (symbol, name, mint_address, coingecko_id) VALUES
('SOL', 'Solana', 'So11111111111111111111111111111111111111112', 'solana'),
('TREND', 'Trend TREND', 'YourTRENDTokenMintAddress', 'trend-TREND'),
('USDC', 'USD Coin', 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'usd-coin'),
('RNDR', 'Render Token', 'rndrizKT3GT1fu8e6aW64gNyd4nSAVxw7ArB3YQ6u', 'render-token'),
('FET', 'Fetch.ai', 'FetchTokenMintAddress', 'fetch-ai'),
('AGIX', 'SingularityNET', 'AGIXTokenMintAddress', 'singularitynet');

-- Insert sample users
INSERT INTO users (wallet_address, reputation_score, xp, TREND_balance, level, badges) VALUES
('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', 85, 1250, 100.50, 7, ARRAY['early_adopter', 'top_signaler']),
('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 78, 980, 75.25, 6, ARRAY['bet_master']),
('5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', 92, 1580, 200.75, 8, ARRAY['early_adopter', 'top_signaler', 'bet_master']);

-- Insert sample trends
INSERT INTO trends (title, description, creator_id, theme_id, performance, confidence, prediction, signals_count, coins_count, upvotes, downvotes) VALUES
('AI & Machine Learning Tokens', 'Emerging AI tokens showing strong momentum with institutional adoption', (SELECT id FROM users WHERE wallet_address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'), 'ai-ml', 24.5, 87, 'bullish', 1247, 4, 892, 45),
('DeFi Yield Farming', 'High-yield DeFi protocols gaining traction in the current market', (SELECT id FROM users WHERE wallet_address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'), 'defi', 18.2, 78, 'bullish', 892, 4, 654, 23),
('Gaming & Metaverse', 'Gaming tokens and metaverse projects showing renewed interest', (SELECT id FROM users WHERE wallet_address = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'), 'gaming', -5.3, 65, 'bearish', 567, 4, 423, 67);

-- Insert trend-coin mappings
INSERT INTO trend_coins (trend_id, coin_id, weight) VALUES
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM coins WHERE symbol = 'SOL'), 1.0),
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM coins WHERE symbol = 'RNDR'), 1.0),
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM coins WHERE symbol = 'FET'), 1.0),
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM coins WHERE symbol = 'AGIX'), 1.0),
((SELECT id FROM trends WHERE title = 'DeFi Yield Farming'), (SELECT id FROM coins WHERE symbol = 'SOL'), 1.0),
((SELECT id FROM trends WHERE title = 'DeFi Yield Farming'), (SELECT id FROM coins WHERE symbol = 'USDC'), 1.0),
((SELECT id FROM trends WHERE title = 'Gaming & Metaverse'), (SELECT id FROM coins WHERE symbol = 'SOL'), 1.0);

-- Insert sample signals
INSERT INTO signals (trend_id, user_id, claim, coins, result, accuracy_score, upvotes, downvotes) VALUES
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM users WHERE wallet_address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'), 'SOL will reach $120 by end of month', ARRAY['SOL'], 'green', 0.85, 45, 3),
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM users WHERE wallet_address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'), 'RNDR will outperform SOL in AI sector', ARRAY['RNDR'], 'green', 0.78, 32, 5),
((SELECT id FROM trends WHERE title = 'DeFi Yield Farming'), (SELECT id FROM users WHERE wallet_address = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'), 'DeFi yields will normalize below 10%', ARRAY['USDC'], 'red', 0.65, 12, 8);

-- Insert sample bets
INSERT INTO bets (trend_id, user_id, side, stake_amount, stake_currency, implied_odds, payout_if_win, fees, settlement_date, status, result, actual_payout, tx_hash) VALUES
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM users WHERE wallet_address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'), 'for', 100.0, 'TREND', 1.5, 150.0, 5.0, NOW() + INTERVAL '3 days', 'active', NULL, NULL, 'SampleTxHash1'),
((SELECT id FROM trends WHERE title = 'DeFi Yield Farming'), (SELECT id FROM users WHERE wallet_address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'), 'against', 50.0, 'USDC', 2.0, 100.0, 2.5, NOW() + INTERVAL '10 days', 'active', NULL, NULL, 'SampleTxHash2'),
((SELECT id FROM trends WHERE title = 'AI & Machine Learning Tokens'), (SELECT id FROM users WHERE wallet_address = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'), 'for', 200.0, 'TREND', 1.3, 260.0, 10.0, NOW() - INTERVAL '5 days', 'settled', 'win', 250.0, 'SampleTxHash3');

-- Insert sample rewards
INSERT INTO rewards (user_id, type, amount, currency, description) VALUES
((SELECT id FROM users WHERE wallet_address = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'), 'signal_accuracy', 100.0, 'TREND', 'Top 10% accuracy on AI & ML trend signal'),
((SELECT id FROM users WHERE wallet_address = '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1'), 'bet_win', 250.0, 'TREND', 'Won bet on AI & Machine Learning Tokens trend'),
((SELECT id FROM users WHERE wallet_address = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'), 'referral', 50.0, 'TREND', 'Referral bonus for new user signup');

-- Insert sample market snapshots
INSERT INTO market_snapshots (coin_id, price_usd, market_cap, volume_24h) VALUES
((SELECT id FROM coins WHERE symbol = 'SOL'), 98.45, 45000000000, 2500000000),
((SELECT id FROM coins WHERE symbol = 'TREND'), 0.12, 12000000, 500000),
((SELECT id FROM coins WHERE symbol = 'USDC'), 1.00, 32000000000, 8000000000),
((SELECT id FROM coins WHERE symbol = 'RNDR'), 4.25, 1600000000, 45000000),
((SELECT id FROM coins WHERE symbol = 'FET'), 0.85, 700000000, 25000000),
((SELECT id FROM coins WHERE symbol = 'AGIX'), 0.35, 450000000, 15000000);
