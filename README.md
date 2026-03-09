# TREND Platform

> **Spot trends, signal early, get rewarded**

A decentralized crypto analytics and prediction platform that combines real-time market data, community intelligence, and AI-powered trend analysis. Users can discover emerging crypto trends, share insights, place bets, and earn rewards based on their accuracy.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Docker** and Docker Compose
- **PostgreSQL** 15+ with pgvector extension
- **Redis** 7+
- **Solana CLI** (for local development)
- **OpenAI API Key** (for AI features)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/trend-platform.git
   cd trend-platform
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd apps/web && npm install
   
   # Install backend dependencies
   cd ../api && npm install
   ```

3. **Environment configuration**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp api/.env.example api/.env
   cp worker/.env.example worker/.env
   cp vector-service/.env.example vector-service/.env
   cp onchain-indexer/.env.example onchain-indexer/.env
   cp analytics/.env.example analytics/.env
   cp client-new/.env.example client-new/.env
   cp docker/env/development.env.example docker/env/development.env
   ```

4. **Configure environment variables**
   ```bash
   # .env (root)
   DATABASE_URL="postgresql://trend_user:CHANGE_ME_POSTGRES_PASSWORD@localhost:5432/trend2earn"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="CHANGE_ME_JWT_SECRET"
   OPENAI_API_KEY="CHANGE_ME_OPENAI_API_KEY"
   SOLANA_RPC_URL="https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY"
   HELIUS_API_KEY="YOUR_HELIUS_API_KEY"
   
   # client-new/.env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY"
   
   # api/.env
   JWT_SECRET="CHANGE_ME_JWT_SECRET"
   ORACLE_PRIVATE_KEY="CHANGE_ME_ORACLE_PRIVATE_KEY"
   REWARD_MINT_ADDRESS="CHANGE_ME_REWARD_MINT_ADDRESS"
   ESCROW_ACCOUNT="CHANGE_ME_ESCROW_ACCOUNT"
   ```

### Development Setup

1. **Start infrastructure services**
   ```bash
   # Start PostgreSQL and Redis
   docker-compose up -d postgres redis
   ```

2. **Database setup**
   ```bash
   # Run migrations
   cd apps/api
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run db:seed
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Start API server
   cd apps/api
   npm run dev
   
   # Terminal 2: Start frontend
   cd apps/web
   npm run dev
   
   # Terminal 3: Start workers (optional)
   cd apps/api
   npm run workers
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost:3001
   - **API Docs**: http://localhost:3001/docs

---

## 📋 Project Requirements

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8GB | 16GB+ |
| **Storage** | 50GB | 100GB+ SSD |
| **CPU** | 4 cores | 8+ cores |
| **Network** | 100 Mbps | 1 Gbps |

### Software Dependencies

- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 15.0 or higher with pgvector extension
- **Redis**: 7.0 or higher
- **Docker**: 20.10 or higher
- **Docker Compose**: 2.0 or higher

### External Services

- **OpenAI API**: For AI embeddings and similarity analysis
- **Solana RPC**: For blockchain interactions (Helius, QuickNode, or Alchemy)
- **Price APIs**: CoinGecko Pro, Jupiter API
- **Token Metadata**: Helius API, TensorHub API

---

## 🏗️ Project Structure

```
trend-platform/
├── apps/                          # Applications
│   ├── web/                       # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/               # App Router pages
│   │   │   ├── components/        # React components
│   │   │   ├── lib/               # Utilities and configs
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   ├── store/             # Zustand state management
│   │   │   └── types/             # TypeScript types
│   │   ├── public/                # Static assets
│   │   └── package.json
│   │
│   ├── api/                       # Express.js backend
│   │   ├── src/
│   │   │   ├── routes/            # API route handlers
│   │   │   ├── services/          # Business logic
│   │   │   ├── middleware/         # Express middleware
│   │   │   ├── models/            # Database models
│   │   │   ├── utils/             # Utilities
│   │   │   └── workers/           # Background workers
│   │   └── package.json
│   │
│   └── mobile/                    # React Native app (future)
│       ├── src/
│       ├── android/
│       ├── ios/
│       └── package.json
│
├── packages/                      # Shared packages
│   ├── shared/                    # Shared types and utilities
│   ├── database/                  # Database schema and migrations
│   ├── contracts/                 # Solana smart contracts
│   └── ai/                        # AI service utilities
│
├── infrastructure/                # Infrastructure as code
│   ├── docker/                    # Docker configurations
│   ├── k8s/                       # Kubernetes manifests
│   └── terraform/                 # Terraform configurations
│
├── docs/                          # Technical documentation
│   ├── ARCHITECTURE.md            # System architecture
│   ├── IMPLEMENTATION.md          # Technical implementation guide
│   ├── API.md                     # API documentation
│   └── DEPLOYMENT.md              # Deployment guide
│
├── scripts/                       # Build and deployment scripts
├── docker-compose.yml             # Development environment
├── docker-compose.prod.yml        # Production environment
└── README.md                      # This file
```

---

## 🎯 Core Features

### 🔍 Trend Discovery
- **AI-Powered Deduplication**: Prevents duplicate trends using semantic similarity
- **Real-time Performance Tracking**: Monitor trend performance with live market data
- **Community Signals**: Users can add insights and predictions to trends
- **Smart Clustering**: Automatically groups related trends

### 💰 Portfolio Integration
- **Wallet Connection**: Connect Solana wallets seamlessly
- **Real-time Sync**: Automatic portfolio updates every 5 minutes
- **Trend Exposure**: See how your holdings align with trending themes
- **Performance Analytics**: Track portfolio performance against trends

### 🎲 Prediction Markets
- **Betting System**: Place bets on trend performance using smart contracts
- **Multiple Timeframes**: 7-day, 14-day, and 30-day betting windows
- **Automated Settlement**: Smart contracts handle payouts automatically
- **Risk Management**: Built-in limits and safety mechanisms

### 🏆 Rewards & Reputation
- **Accuracy Rewards**: Earn tokens for accurate predictions
- **Reputation System**: Build reputation through consistent performance
- **Leaderboards**: Compete with other users
- **Achievement Badges**: Unlock badges for milestones

---

## 🛠️ Development Commands

### Frontend (Next.js)
```bash
cd apps/web

# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript checks

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Backend (Express.js)
```bash
cd apps/api

# Development
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript
npm run start            # Start production server

# Database
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database (development only)

# Workers
npm run workers          # Start background workers
npm run workers:dev      # Start workers in development mode

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run end-to-end tests
```

### Infrastructure
```bash
# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs      # View logs

# Database
docker-compose exec postgres psql -U trend_user -d trend_platform

# Redis
docker-compose exec redis redis-cli
```

---

## 🚀 Deployment

### Production Deployment

1. **Build applications**
   ```bash
   # Build frontend
   cd apps/web && npm run build
   
   # Build backend
   cd apps/api && npm run build
   ```

2. **Deploy with Docker**
   ```bash
   # Production deployment
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Kubernetes deployment**
   ```bash
   # Apply Kubernetes manifests
   kubectl apply -f infrastructure/k8s/
   ```

### Environment-Specific Configuration

- **Development**: Uses local services and mock data
- **Staging**: Uses staging APIs and testnet Solana
- **Production**: Uses production APIs and mainnet Solana

---

## 🔧 Configuration

### Database Configuration

The platform uses PostgreSQL with the pgvector extension for AI embeddings:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_embeddings_vector ON embeddings 
USING hnsw (vector vector_cosine_ops);
```

### Redis Configuration

Redis is used for caching, session storage, and queue management:

```bash
# Redis configuration
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Solana Configuration

Smart contracts handle betting and reward distribution:

```rust
// Key program addresses
pub const BET_POOL_PROGRAM_ID: Pubkey = "YourBetPoolProgramId";
pub const REWARD_VAULT_PROGRAM_ID: Pubkey = "YourRewardVaultProgramId";
pub const TREND_MINT: Pubkey = "YourTRENDTokenMint";
```

---

## 📊 Monitoring & Analytics

### Application Metrics
- **API Response Times**: Track endpoint performance
- **User Activity**: Monitor user engagement
- **Trend Performance**: Analyze prediction accuracy
- **System Health**: Database, Redis, and external API status

### Business Metrics
- **User Growth**: Daily/monthly active users
- **Trend Creation**: New trends per day
- **Betting Volume**: Total volume and frequency
- **Reward Distribution**: Token distribution patterns

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm run test
   ```
5. **Submit a pull request**

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format
- **Test Coverage**: Minimum 80% coverage

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add tests for new features
4. Follow the existing code style
5. Request review from maintainers

---

## 📚 Documentation

For detailed technical documentation, see the `/docs` folder:

- **[Architecture](docs/ARCHITECTURE.md)**: Complete system architecture and data flows
- **[Implementation](docs/IMPLEMENTATION.md)**: Technical implementation guide
- **[API Documentation](docs/API.md)**: Comprehensive API reference
- **[Deployment](docs/DEPLOYMENT.md)**: Production deployment guide

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues**
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Reset database
npm run db:reset
```

**Redis Connection Issues**
```bash
# Check Redis status
docker-compose exec redis redis-cli ping

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

**Solana RPC Issues**
```bash
# Test RPC connection
solana cluster-version --url $SOLANA_RPC_URL

# Switch to different RPC provider
export SOLANA_RPC_URL="https://devnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY"
```

**Frontend Build Issues**
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Reinstall dependencies
cd apps/web && rm -rf node_modules && npm install
```

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join our community for support
- **Documentation**: Check the `/docs` folder for detailed guides

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Solana Foundation**: For blockchain infrastructure
- **OpenAI**: For AI embeddings and similarity analysis
- **CoinGecko**: For cryptocurrency price data
- **Helius**: For Solana RPC services
- **Community**: For feedback and contributions

---

## 📞 Support

- **Email**: support@trend.com
- **Discord**: [Join our community](https://discord.gg/trend)
- **Twitter**: [@TrendPlatform](https://twitter.com/TrendPlatform)
- **Documentation**: [docs.trend.com](https://docs.trend.com)

---

**Built with ❤️ by the TREND team**
