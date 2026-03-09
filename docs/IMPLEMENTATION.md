# TREND Platform - Technical Implementation Guide

## Overview

This document provides detailed technical implementation guidance for building the TREND platform based on the functional architecture. It covers specific technologies, code patterns, and implementation strategies for each system component.

---

## 🛠️ 1. Technology Stack

### Frontend Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **State Management**: Zustand + React Query
- **Wallet Integration**: Solana Wallet Adapter
- **UI Components**: shadcn/ui + Radix UI
- **Charts**: Recharts or Chart.js

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+ with pgvector extension
- **Cache**: Redis 7+
- **Queue**: BullMQ (Redis-based)
- **ORM**: Prisma or TypeORM
- **Validation**: Zod schemas

### Blockchain Integration
- **Solana SDK**: @solana/web3.js + @coral-xyz/anchor
- **Wallet Adapter**: @solana/wallet-adapter-react
- **RPC Providers**: Helius, QuickNode, or Alchemy

### AI & ML Services
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Database**: pgvector (PostgreSQL extension)
- **Clustering**: HDBSCAN or K-means
- **Similarity Search**: Cosine similarity with HNSW index

### External APIs
- **Price Data**: CoinGecko Pro API
- **Solana Data**: Helius API
- **Token Metadata**: Jupiter API
- **NFT Data**: TensorHub API

---

## 🏗️ 2. Project Structure

```
trend-platform/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # Reusable components
│   │   │   ├── lib/           # Utilities and configs
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── store/         # Zustand stores
│   │   │   └── types/         # TypeScript types
│   │   ├── public/            # Static assets
│   │   └── package.json
│   │
│   ├── api/                   # Express.js backend
│   │   ├── src/
│   │   │   ├── routes/        # API route handlers
│   │   │   ├── services/      # Business logic
│   │   │   ├── middleware/    # Express middleware
│   │   │   ├── models/        # Database models
│   │   │   ├── utils/         # Utilities
│   │   │   └── workers/      # Background workers
│   │   └── package.json
│   │
│   └── mobile/                # React Native app
│       ├── src/
│       ├── android/
│       ├── ios/
│       └── package.json
│
├── packages/
│   ├── shared/                # Shared types and utilities
│   ├── database/              # Database schema and migrations
│   ├── contracts/             # Solana smart contracts
│   └── ai/                    # AI service utilities
│
├── infrastructure/
│   ├── docker/                # Docker configurations
│   ├── k8s/                   # Kubernetes manifests
│   └── terraform/             # Infrastructure as code
│
└── docs/                      # Documentation
```

---

## 🗄️ 3. Database Schema Implementation

### Core Tables with Prisma

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  reputationScore Int    @default(0)
  xp            Int      @default(0)
  TRENDBalance   Decimal  @default(0) @db.Decimal(18, 8)
  level         Int      @default(1)
  badges        String[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  trends        Trend[]
  signals       Signal[]
  bets          Bet[]
  rewards       Reward[]

  @@map("users")
}

model Trend {
  id          String   @id @default(cuid())
  title       String
  description String?
  creatorId   String
  themeId     String
  performance Decimal  @default(0) @db.Decimal(10, 4)
  confidence  Int      @default(0)
  prediction  String   @default("neutral") // bullish, bearish, neutral
  status      String   @default("active") // active, archived, disputed
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  creator     User      @relation(fields: [creatorId], references: [id])
  signals     Signal[]
  bets        Bet[]
  trendCoins  TrendCoin[]
  embedding   Embedding?

  @@map("trends")
}

model Signal {
  id          String   @id @default(cuid())
  trendId     String
  userId      String
  claim       String
  coins       String[]
  result      String?  // green, red, neutral
  accuracyScore Decimal? @db.Decimal(5, 4)
  upvotes     Int      @default(0)
  downvotes   Int      @default(0)
  createdAt   DateTime @default(now())

  // Relations
  trend       Trend    @relation(fields: [trendId], references: [id])
  user        User     @relation(fields: [userId], references: [id])

  @@map("signals")
}

model Coin {
  id          String   @id @default(cuid())
  symbol      String   @unique
  name        String
  mintAddress String?  // Solana mint address
  coingeckoId String?
  imageUrl    String?
  createdAt   DateTime @default(now())

  // Relations
  trendCoins  TrendCoin[]
  snapshots   MarketSnapshot[]

  @@map("coins")
}

model TrendCoin {
  id      String @id @default(cuid())
  trendId String
  coinId  String
  weight  Decimal @default(1) @db.Decimal(5, 4)

  // Relations
  trend    Trend @relation(fields: [trendId], references: [id])
  coin     Coin  @relation(fields: [coinId], references: [id])

  @@unique([trendId, coinId])
  @@map("trend_coins")
}

model Bet {
  id            String   @id @default(cuid())
  trendId       String
  userId        String
  side          String   // for, against
  stakeAmount   Decimal  @db.Decimal(18, 8)
  stakeCurrency String   @default("TREND")
  impliedOdds   Decimal  @db.Decimal(5, 4)
  payoutIfWin   Decimal  @db.Decimal(18, 8)
  fees          Decimal  @db.Decimal(18, 8)
  settlementDate DateTime
  status        String   @default("active") // active, settled, cancelled
  result        String?  // win, loss, draw
  actualPayout  Decimal? @db.Decimal(18, 8)
  txHash        String?
  createdAt     DateTime @default(now())

  // Relations
  trend         Trend    @relation(fields: [trendId], references: [id])
  user          User     @relation(fields: [userId], references: [id])

  @@map("bets")
}

model Reward {
  id          String   @id @default(cuid())
  userId      String
  type        String   // signal_accuracy, bet_win, referral
  amount      Decimal  @db.Decimal(18, 8)
  currency    String   @default("TREND")
  description String
  earnedAt    DateTime @default(now())

  // Relations
  user        User     @relation(fields: [userId], references: [id])

  @@map("rewards")
}

model Embedding {
  id         String @id @default(cuid())
  entityType String // trend, signal
  entityId   String
  vector     Unsupported("vector(1536)") // pgvector type
  createdAt  DateTime @default(now())

  @@unique([entityType, entityId])
  @@map("embeddings")
}

model MarketSnapshot {
  id        String   @id @default(cuid())
  coinId    String
  priceUsd  Decimal  @db.Decimal(20, 8)
  marketCap Decimal? @db.Decimal(20, 2)
  volume24h Decimal? @db.Decimal(20, 2)
  timestamp DateTime @default(now())

  // Relations
  coin      Coin     @relation(fields: [coinId], references: [id])

  @@index([coinId, timestamp])
  @@map("market_snapshots")
}
```

### Database Migrations

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_trends_created_at ON trends(created_at);
CREATE INDEX CONCURRENTLY idx_signals_user_trend ON signals(user_id, trend_id);
CREATE INDEX CONCURRENTLY idx_bets_settlement ON bets(settlement_date) WHERE status = 'active';
CREATE INDEX CONCURRENTLY idx_embeddings_vector ON embeddings USING hnsw (vector vector_cosine_ops);

-- Partition market snapshots by month
CREATE TABLE market_snapshots_2024 PARTITION OF market_snapshots
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

---

## 🔧 4. Backend Service Implementation

### API Gateway Setup

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  store: new RedisStore({
    client: redis,
    prefix: 'rate_limit:'
  })
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/bets', betsRoutes);
app.use('/api/rewards', rewardsRoutes);

export default app;
```

### Trend Service Implementation

```typescript
// src/services/trend-service.ts
import { PrismaClient } from '@prisma/client';
import { AIService } from './ai-service';
import { RedisService } from './redis-service';

export class TrendService {
  constructor(
    private prisma: PrismaClient,
    private aiService: AIService,
    private redis: RedisService
  ) {}

  async createTrend(data: CreateTrendRequest): Promise<TrendResponse> {
    // 1. Generate embedding
    const embedding = await this.aiService.generateEmbedding(
      `${data.title} ${data.description}`
    );

    // 2. Check for duplicates
    const similarTrends = await this.findSimilarTrends(embedding, 0.85);
    
    if (similarTrends.length > 0) {
      return {
        status: 'duplicate_found',
        suggestions: similarTrends.map(t => ({
          id: t.id,
          title: t.title,
          similarity: t.similarity,
          signalsCount: t.signalsCount
        }))
      };
    }

    // 3. Create trend
    const trend = await this.prisma.trend.create({
      data: {
        ...data,
        embedding: {
          create: {
            entityType: 'trend',
            entityId: '', // Will be updated after creation
            vector: embedding
          }
        }
      },
      include: {
        creator: true,
        trendCoins: {
          include: { coin: true }
        }
      }
    });

    // 4. Update embedding entity ID
    await this.prisma.embedding.update({
      where: { entityId: trend.id },
      data: { entityId: trend.id }
    });

    // 5. Queue clustering update
    await this.queueClusteringUpdate(trend.id);

    return { status: 'created', trend };
  }

  async findSimilarTrends(embedding: number[], threshold: number = 0.8) {
    const query = `
      SELECT t.*, 1 - (e.vector <=> $1) as similarity
      FROM trends t
      JOIN embeddings e ON e.entity_id = t.id
      WHERE e.entity_type = 'trend'
        AND 1 - (e.vector <=> $1) > $2
      ORDER BY e.vector <=> $1
      LIMIT 10
    `;
    
    return await this.prisma.$queryRaw(query, [embedding, threshold]);
  }

  private async queueClusteringUpdate(trendId: string) {
    await this.redis.queue.add('update-clustering', { trendId });
  }
}
```

### AI Service Implementation

```typescript
// src/services/ai-service.ts
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

export class AIService {
  private openai: OpenAI;

  constructor(private prisma: PrismaClient) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });

    return response.data[0].embedding;
  }

  async clusterTrends() {
    const trends = await this.prisma.trend.findMany({
      include: { embedding: true }
    });

    const embeddings = trends.map(t => ({
      id: t.id,
      vector: t.embedding?.vector
    })).filter(e => e.vector);

    // Use HDBSCAN clustering
    const clusters = await this.performClustering(embeddings);

    // Update trend cluster assignments
    for (const [trendId, clusterId] of clusters) {
      await this.prisma.trend.update({
        where: { id: trendId },
        data: { clusterId }
      });
    }
  }

  private async performClustering(embeddings: any[]) {
    // Implementation would use a clustering library like HDBSCAN
    // This is a simplified example
    return new Map(); // clusterId -> trendId[]
  }
}
```

### Portfolio Service Implementation

```typescript
// src/services/portfolio-service.ts
import { SolanaService } from './solana-service';
import { MarketDataService } from './market-data-service';

export class PortfolioService {
  constructor(
    private solana: SolanaService,
    private marketData: MarketDataService,
    private redis: RedisService
  ) {}

  async syncPortfolio(walletAddress: string): Promise<PortfolioData> {
    // Check cache first
    const cached = await this.redis.get(`portfolio:${walletAddress}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // 1. Fetch token balances
    const balances = await this.solana.getTokenBalances(walletAddress);
    
    // 2. Get USD prices
    const mintAddresses = balances.map(b => b.mint);
    const prices = await this.marketData.getPrices(mintAddresses);
    
    // 3. Calculate USD values
    const holdings = balances.map(balance => ({
      ...balance,
      usdValue: balance.amount * (prices[balance.mint]?.usd || 0)
    }));

    // 4. Calculate trend exposures
    const exposures = await this.calculateTrendExposures(holdings);

    const portfolio = {
      totalValue: holdings.reduce((sum, h) => sum + h.usdValue, 0),
      holdings,
      exposures,
      lastSynced: new Date().toISOString()
    };

    // Cache for 10 minutes
    await this.redis.setex(
      `portfolio:${walletAddress}`,
      600,
      JSON.stringify(portfolio)
    );

    return portfolio;
  }

  private async calculateTrendExposures(holdings: TokenHolding[]) {
    // Match user holdings to trend coin mappings
    const trendExposures = await this.prisma.trendCoin.findMany({
      where: {
        coin: {
          mintAddress: {
            in: holdings.map(h => h.mint)
          }
        }
      },
      include: {
        trend: true,
        coin: true
      }
    });

    return trendExposures.map(exposure => ({
      trendId: exposure.trend.id,
      trendTitle: exposure.trend.title,
      portfolioPercentage: this.calculateExposurePercentage(
        holdings,
        exposure.coin.mintAddress,
        exposure.weight
      ),
      trendReturn: exposure.trend.performance
    }));
  }
}
```

---

## 🔗 5. Solana Integration

### Smart Contract Setup

```rust
// programs/bet-pool/src/lib.rs
use anchor_lang::prelude::*;

declare_id!("YourProgramIdHere");

#[program]
pub mod bet_pool {
    use super::*;

    pub fn create_bet(
        ctx: Context<CreateBet>,
        trend_id: String,
        side: BetSide,
        stake_amount: u64,
        timeframe: u64,
    ) -> Result<()> {
        let bet_account = &mut ctx.accounts.bet_account;
        let escrow = &mut ctx.accounts.escrow;
        
        // Transfer tokens to escrow
        let transfer_instruction = spl_token::instruction::transfer(
            &spl_token::id(),
            &ctx.accounts.user_token_account.key(),
            &escrow.key(),
            &ctx.accounts.user.key(),
            &[],
            stake_amount,
        )?;
        
        // Initialize bet account
        bet_account.trend_id = trend_id;
        bet_account.side = side;
        bet_account.stake_amount = stake_amount;
        bet_account.settlement_date = Clock::get()?.unix_timestamp + timeframe;
        bet_account.status = BetStatus::Active;
        
        Ok(())
    }

    pub fn settle_bet(ctx: Context<SettleBet>) -> Result<()> {
        let bet_account = &mut ctx.accounts.bet_account;
        
        // Check if settlement time reached
        require!(
            Clock::get()?.unix_timestamp >= bet_account.settlement_date,
            ErrorCode::SettlementTimeNotReached
        );
        
        // Fetch trend performance from oracle
        let performance = ctx.accounts.oracle.get_performance(&bet_account.trend_id)?;
        
        // Determine outcome
        let won = match bet_account.side {
            BetSide::Up => performance > 0,
            BetSide::Down => performance < 0,
        };
        
        // Distribute payouts
        if won {
            // Transfer winnings to user
            // Implementation details...
        }
        
        bet_account.status = BetStatus::Settled;
        bet_account.result = if won { BetResult::Win } else { BetResult::Loss };
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init,
        payer = user,
        space = 8 + BetAccount::INIT_SPACE
    )]
    pub bet_account: Account<'info, BetAccount>,
    
    #[account(mut)]
    pub escrow: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub token_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct BetAccount {
    pub trend_id: String,
    pub side: BetSide,
    pub stake_amount: u64,
    pub settlement_date: i64,
    pub status: BetStatus,
    pub result: Option<BetResult>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetSide {
    Up,
    Down,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetStatus {
    Active,
    Settled,
    Cancelled,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum BetResult {
    Win,
    Loss,
    Draw,
}
```

### Frontend Integration

```typescript
// src/lib/solana.ts
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { BetPoolProgram } from './programs/bet-pool';

export class SolanaService {
  private connection: Connection;
  private program: Program<BetPoolProgram>;

  constructor() {
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL!,
      'confirmed'
    );
    
    this.program = new Program(
      BetPoolProgram,
      new AnchorProvider(
        this.connection,
        wallet,
        { commitment: 'confirmed' }
      )
    );
  }

  async createBet(
    trendId: string,
    side: 'up' | 'down',
    amount: number
  ): Promise<string> {
    const [betAccountPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('bet'), Buffer.from(trendId), wallet.publicKey.toBuffer()],
      this.program.programId
    );

    const instruction = await this.program.methods
      .createBet(trendId, side === 'up' ? { up: {} } : { down: {} }, new BN(amount), 7 * 24 * 60 * 60) // 7 days
      .accounts({
        betAccount: betAccountPDA,
        user: wallet.publicKey,
        escrow: ESCROW_ACCOUNT,
        userTokenAccount: userTokenAccount,
        tokenMint: TREND_MINT,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const transaction = new Transaction().add(instruction);
    const signature = await wallet.sendTransaction(transaction, this.connection);
    
    await this.connection.confirmTransaction(signature);
    return signature;
  }

  async getTokenBalances(walletAddress: string): Promise<TokenBalance[]> {
    const publicKey = new PublicKey(walletAddress);
    const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    return tokenAccounts.value.map(account => ({
      mint: account.account.data.parsed.info.mint,
      amount: account.account.data.parsed.info.tokenAmount.uiAmount,
      decimals: account.account.data.parsed.info.tokenAmount.decimals
    }));
  }
}
```

---

## ⚡ 6. Worker Queue Implementation

### BullMQ Setup

```typescript
// src/workers/index.ts
import { Worker, Queue } from 'bullmq';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

// Define queues
export const priceUpdateQueue = new Queue('price-updates', { connection: redis });
export const aiProcessingQueue = new Queue('ai-processing', { connection: redis });
export const betSettlementQueue = new Queue('bet-settlements', { connection: redis });

// Price update worker
const priceUpdateWorker = new Worker(
  'price-updates',
  async (job) => {
    const { coinIds } = job.data;
    await updateMarketPrices(coinIds);
  },
  { connection: redis }
);

// AI processing worker
const aiProcessingWorker = new Worker(
  'ai-processing',
  async (job) => {
    const { type, data } = job.data;
    
    switch (type) {
      case 'generate-embedding':
        await generateEmbedding(data);
        break;
      case 'update-clustering':
        await updateTrendClustering(data);
        break;
    }
  },
  { connection: redis }
);

// Bet settlement worker
const betSettlementWorker = new Worker(
  'bet-settlements',
  async (job) => {
    const { betId } = job.data;
    await settleBet(betId);
  },
  { connection: redis }
);
```

### Scheduled Jobs

```typescript
// src/workers/scheduled-jobs.ts
import { CronJob } from 'cron';

// Update prices every minute
new CronJob('0 * * * * *', async () => {
  const activeCoins = await getActiveCoins();
  await priceUpdateQueue.add('update-prices', { coinIds: activeCoins });
}, null, true);

// Update trend performance every 5 minutes
new CronJob('0 */5 * * * *', async () => {
  const activeTrends = await getActiveTrends();
  for (const trend of activeTrends) {
    await priceUpdateQueue.add('update-trend-performance', { trendId: trend.id });
  }
}, null, true);

// Check for bet settlements every minute
new CronJob('0 * * * * *', async () => {
  const pendingSettlements = await getPendingSettlements();
  for (const bet of pendingSettlements) {
    await betSettlementQueue.add('settle-bet', { betId: bet.id });
  }
}, null, true);
```

---

## 📊 7. Frontend Implementation

### State Management with Zustand

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  user: User | null;
  wallet: Wallet | null;
  isConnected: boolean;
  portfolio: Portfolio | null;
  trends: Trend[];
  
  // Actions
  connectWallet: (wallet: Wallet) => void;
  disconnectWallet: () => void;
  updatePortfolio: (portfolio: Portfolio) => void;
  addTrend: (trend: Trend) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      wallet: null,
      isConnected: false,
      portfolio: null,
      trends: [],

      connectWallet: (wallet) => {
        set({ wallet, isConnected: true });
        // Sync portfolio
        syncPortfolio(wallet.publicKey.toString());
      },

      disconnectWallet: () => {
        set({ wallet: null, isConnected: false, user: null, portfolio: null });
      },

      updatePortfolio: (portfolio) => {
        set({ portfolio });
      },

      addTrend: (trend) => {
        set((state) => ({ trends: [trend, ...state.trends] }));
      },
    }),
    {
      name: 'trend-app-storage',
      partialize: (state) => ({ 
        user: state.user, 
        wallet: state.wallet,
        isConnected: state.isConnected 
      }),
    }
  )
);
```

### React Query Integration

```typescript
// src/hooks/useTrends.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useTrends(params?: TrendQueryParams) {
  return useQuery({
    queryKey: ['trends', params],
    queryFn: () => api.getTrends(params),
    staleTime: 60000, // 1 minute
  });
}

export function useCreateTrend() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTrendRequest) => api.createTrend(data),
    onSuccess: (newTrend) => {
      queryClient.invalidateQueries({ queryKey: ['trends'] });
      queryClient.setQueryData(['trend', newTrend.id], newTrend);
    },
  });
}

export function usePortfolio(walletAddress?: string) {
  return useQuery({
    queryKey: ['portfolio', walletAddress],
    queryFn: () => api.getPortfolio(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 300000, // 5 minutes
  });
}
```

### Wallet Integration

```typescript
// src/components/WalletProvider.tsx
import { WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <SolanaWalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </SolanaWalletProvider>
  );
}
```

---

## 🚀 8. Deployment Configuration

### Docker Setup

```dockerfile
# Dockerfile.api
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

```dockerfile
# Dockerfile.web
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg15
    environment:
      POSTGRES_DB: trend_platform
      POSTGRES_USER: trend_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  api:
    build: ./apps/api
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: redis://redis:6379
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SOLANA_RPC_URL: ${SOLANA_RPC_URL}
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  web:
    build: ./apps/web
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: trend-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: trend-api
  template:
    metadata:
      labels:
        app: trend-api
    spec:
      containers:
      - name: api
        image: trend-platform/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: trend-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: trend-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## 📈 9. Monitoring & Observability

### Application Metrics

```typescript
// src/utils/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const metrics = {
  apiRequests: new Counter({
    name: 'api_requests_total',
    help: 'Total number of API requests',
    labelNames: ['method', 'route', 'status']
  }),
  
  apiResponseTime: new Histogram({
    name: 'api_response_time_seconds',
    help: 'API response time in seconds',
    labelNames: ['method', 'route']
  }),
  
  activeUsers: new Gauge({
    name: 'active_users_total',
    help: 'Number of active users'
  }),
  
  trendPerformance: new Histogram({
    name: 'trend_performance_percentage',
    help: 'Trend performance distribution',
    buckets: [-50, -25, -10, -5, 0, 5, 10, 25, 50, 100]
  })
};

// Middleware to collect metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    metrics.apiRequests.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    });
    
    metrics.apiResponseTime.observe(
      { method: req.method, route: req.route?.path || req.path },
      duration
    );
  });
  
  next();
}
```

### Health Checks

```typescript
// src/routes/health.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

const router = Router();
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

router.get('/health', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    external_apis: false
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Check Redis
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  try {
    // Check external APIs
    const response = await fetch('https://api.coingecko.com/api/v3/ping');
    checks.external_apis = response.ok;
  } catch (error) {
    console.error('External API health check failed:', error);
  }

  const allHealthy = Object.values(checks).every(Boolean);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});

export default router;
```

---

## 🔐 10. Security Implementation

### Input Validation

```typescript
// src/schemas/trend-schemas.ts
import { z } from 'zod';

export const CreateTrendSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-&]+$/, 'Title contains invalid characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  coins: z.array(z.string())
    .min(1, 'At least one coin is required')
    .max(10, 'Maximum 10 coins allowed'),
  
  theme_id: z.string()
    .min(1, 'Theme ID is required')
    .regex(/^[a-z0-9\-]+$/, 'Invalid theme ID format')
});

export const PlaceBetSchema = z.object({
  trend_id: z.string().uuid(),
  side: z.enum(['up', 'down']),
  stake_amount: z.number()
    .min(1, 'Minimum stake is 1 TREND')
    .max(10000, 'Maximum stake is 10,000 TREND'),
  timeframe: z.enum(['7d', '14d', '30d'])
});
```

### Rate Limiting

```typescript
// src/middleware/rate-limiting.ts
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

const rateLimiters = {
  general: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'rate_limit',
    points: 100, // requests
    duration: 60, // per 60 seconds
  }),
  
  trendCreation: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'trend_creation',
    points: 5, // trends
    duration: 3600, // per hour
  }),
  
  betting: new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: 'betting',
    points: 20, // bets
    duration: 3600, // per hour
  })
};

export async function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const identifier = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const limiter = rateLimiters[req.route?.path] || rateLimiters.general;
  
  try {
    await limiter.consume(identifier);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
}
```

### Wallet Authentication

```typescript
// src/middleware/auth.ts
import { verifyMessage } from '@solana/web3.js';

export async function authenticateWallet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { signature, message, publicKey } = req.body;
  
  try {
    const isValid = verifyMessage(
      new PublicKey(publicKey),
      Buffer.from(message, 'base64'),
      Buffer.from(signature, 'base64')
    );
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { walletAddress: publicKey }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { walletAddress: publicKey }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
}
```

This technical implementation guide provides the concrete foundation for building the TREND platform. Each component is designed to work together seamlessly, following the functional architecture outlined in the main documentation.
