# TREND Platform - API Documentation

## Overview

This document provides comprehensive API documentation for the TREND platform, covering all endpoints, request/response formats, authentication, and error handling.

---

## 🔐 Authentication

### Wallet-Based Authentication

The TREND platform uses Solana wallet signatures for authentication. Users sign a message with their private key, and the backend verifies the signature to authenticate the user.

#### Authentication Flow

1. **Frontend**: Generate a random message and request user to sign it
2. **User**: Signs the message with their Solana wallet
3. **Frontend**: Sends signature, message, and public key to backend
4. **Backend**: Verifies signature and creates/updates user session

#### Example Implementation

```typescript
// Frontend: Generate and sign message
const message = `Welcome to TREND!\n\nWallet: ${wallet.publicKey}\nTimestamp: ${Date.now()}`;
const encodedMessage = new TextEncoder().encode(message);
const signature = await wallet.signMessage(encodedMessage);

// Send to backend
const response = await fetch('/api/auth/wallet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    signature: Buffer.from(signature).toString('base64'),
    message: Buffer.from(encodedMessage).toString('base64'),
    publicKey: wallet.publicKey.toString()
  })
});
```

---

## 📊 API Endpoints

### Authentication Endpoints

#### POST `/api/auth/wallet`

Authenticate user with wallet signature.

**Request Body:**
```json
{
  "signature": "string (base64 encoded)",
  "message": "string (base64 encoded)",
  "publicKey": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "walletAddress": "string",
    "reputationScore": 85,
    "xp": 1250,
    "TRENDBalance": "100.50",
    "level": 7,
    "badges": ["early_adopter", "top_signaler"]
  },
  "token": "jwt_token_here"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid signature
- `400 Bad Request`: Missing required fields

---

### Trend Endpoints

#### GET `/api/trends`

Get paginated list of trends with optional filtering.

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)
- `sort` (string, optional): Sort order (`trending`, `newest`, `performance`, `signals`)
- `category` (string, optional): Filter by category (`defi`, `ai-ml`, `gaming`, etc.)
- `search` (string, optional): Search in title and description

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "title": "AI & Machine Learning Tokens",
      "description": "Emerging AI tokens showing strong momentum",
      "creator": {
        "id": "string",
        "walletAddress": "string",
        "reputationScore": 85
      },
      "themeId": "ai-ml",
      "coins": [
        {
          "symbol": "SOL",
          "name": "Solana",
          "mintAddress": "string",
          "weight": 1.0
        }
      ],
      "signalsCount": 1247,
      "coinsCount": 4,
      "upvotes": 892,
      "downvotes": 45,
      "performance": 24.5,
      "confidence": 87,
      "prediction": "bullish",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### POST `/api/trends`

Create a new trend.

**Request Body:**
```json
{
  "title": "AI & Machine Learning Tokens",
  "description": "Emerging AI tokens showing strong momentum with institutional adoption",
  "coins": ["SOL", "RNDR", "FET", "AGIX"],
  "themeId": "ai-ml"
}
```

**Response:**
```json
{
  "status": "created",
  "trend": {
    "id": "string",
    "title": "AI & Machine Learning Tokens",
    "description": "Emerging AI tokens showing strong momentum with institutional adoption",
    "creator": {
      "id": "string",
      "walletAddress": "string"
    },
    "themeId": "ai-ml",
    "coins": [
      {
        "symbol": "SOL",
        "name": "Solana",
        "weight": 1.0
      }
    ],
    "signalsCount": 0,
    "coinsCount": 4,
    "upvotes": 0,
    "downvotes": 0,
    "performance": 0,
    "confidence": 0,
    "prediction": "neutral",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Duplicate Detection Response:**
```json
{
  "status": "duplicate_found",
  "suggestions": [
    {
      "id": "string",
      "title": "AI Tokens & Machine Learning",
      "similarity": 0.92,
      "signalsCount": 567,
      "performance": 18.3
    }
  ]
}
```

#### GET `/api/trends/:id`

Get detailed information about a specific trend.

**Response:**
```json
{
  "id": "string",
  "title": "AI & Machine Learning Tokens",
  "description": "Emerging AI tokens showing strong momentum with institutional adoption",
  "creator": {
    "id": "string",
    "walletAddress": "string",
    "reputationScore": 85,
    "level": 7
  },
  "themeId": "ai-ml",
  "coins": [
    {
      "symbol": "SOL",
      "name": "Solana",
      "mintAddress": "string",
      "weight": 1.0,
      "currentPrice": 98.45,
      "priceChange24h": 2.3
    }
  ],
  "signals": [
    {
      "id": "string",
      "claim": "SOL will reach $120 by end of month",
      "user": {
        "walletAddress": "string",
        "reputationScore": 78
      },
      "coins": ["SOL"],
      "result": "green",
      "accuracyScore": 0.85,
      "upvotes": 45,
      "downvotes": 3,
      "createdAt": "2024-01-15T09:15:00Z"
    }
  ],
  "signalsCount": 1247,
  "coinsCount": 4,
  "upvotes": 892,
  "downvotes": 45,
  "performance": 24.5,
  "confidence": 87,
  "prediction": "bullish",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/trends/:id/signals`

Add a signal to an existing trend.

**Request Body:**
```json
{
  "claim": "SOL will reach $120 by end of month",
  "coins": ["SOL"]
}
```

**Response:**
```json
{
  "id": "string",
  "claim": "SOL will reach $120 by end of month",
  "user": {
    "id": "string",
    "walletAddress": "string"
  },
  "trendId": "string",
  "coins": ["SOL"],
  "result": null,
  "accuracyScore": null,
  "upvotes": 0,
  "downvotes": 0,
  "createdAt": "2024-01-15T11:00:00Z"
}
```

#### POST `/api/trends/:id/vote`

Vote on a trend (upvote/downvote).

**Request Body:**
```json
{
  "type": "upvote" // or "downvote"
}
```

**Response:**
```json
{
  "success": true,
  "trend": {
    "id": "string",
    "upvotes": 893,
    "downvotes": 45
  }
}
```

---

### Portfolio Endpoints

#### GET `/api/portfolio`

Get user's portfolio information.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "walletAddress": "string",
  "totalValue": 12345.67,
  "change24h": 123.45,
  "change24hPercent": 1.2,
  "lastSynced": "2024-01-15T10:30:00Z",
  "holdings": [
    {
      "token": "SOL",
      "amount": 50.0,
      "value": 5000.0,
      "change24h": 50.0,
      "change24hPercent": 1.0,
      "mintAddress": "string"
    }
  ],
  "trendExposure": [
    {
      "trendId": "string",
      "trendTitle": "AI & Machine Learning Tokens",
      "portfolioPercentage": 30.0,
      "trendReturn": 24.5
    }
  ]
}
```

#### POST `/api/portfolio/sync`

Manually sync portfolio data.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "success": true,
  "message": "Portfolio synced successfully",
  "lastSynced": "2024-01-15T10:30:00Z"
}
```

---

### Betting Endpoints

#### GET `/api/bets`

Get user's betting history.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `status` (string, optional): Filter by status (`active`, `settled`, `cancelled`)
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "trend": {
        "id": "string",
        "title": "AI & Machine Learning Tokens"
      },
      "side": "for",
      "timeframe": "7d",
      "stakeAmount": 100.0,
      "stakeCurrency": "TREND",
      "impliedOdds": 1.5,
      "payoutIfWin": 150.0,
      "fees": 5.0,
      "settlementDate": "2024-01-22T10:30:00Z",
      "status": "active",
      "result": null,
      "actualPayout": null,
      "txHash": "string",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### POST `/api/bets`

Place a new bet on a trend.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Request Body:**
```json
{
  "trendId": "string",
  "side": "for", // or "against"
  "stakeAmount": 100.0,
  "stakeCurrency": "TREND",
  "timeframe": "7d", // or "14d", "30d"
  "txHash": "string" // Solana transaction hash
}
```

**Response:**
```json
{
  "id": "string",
  "trend": {
    "id": "string",
    "title": "AI & Machine Learning Tokens"
  },
  "side": "for",
  "timeframe": "7d",
  "stakeAmount": 100.0,
  "stakeCurrency": "TREND",
  "impliedOdds": 1.5,
  "payoutIfWin": 150.0,
  "fees": 5.0,
  "settlementDate": "2024-01-22T10:30:00Z",
  "status": "active",
  "txHash": "string",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### GET `/api/bets/:id`

Get detailed information about a specific bet.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "id": "string",
  "trend": {
    "id": "string",
    "title": "AI & Machine Learning Tokens",
    "performance": 24.5
  },
  "side": "for",
  "timeframe": "7d",
  "stakeAmount": 100.0,
  "stakeCurrency": "TREND",
  "impliedOdds": 1.5,
  "payoutIfWin": 150.0,
  "fees": 5.0,
  "settlementDate": "2024-01-22T10:30:00Z",
  "status": "settled",
  "result": "win",
  "actualPayout": 145.0,
  "txHash": "string",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Rewards Endpoints

#### GET `/api/rewards`

Get user's reward history.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Query Parameters:**
- `type` (string, optional): Filter by type (`signal_accuracy`, `bet_win`, `referral`)
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "type": "signal_accuracy",
      "amount": 100.0,
      "currency": "TREND",
      "description": "Top 10% accuracy on AI & ML trend signal",
      "earnedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2
  }
}
```

#### GET `/api/rewards/summary`

Get user's reward summary and statistics.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "totalRewards": 1250.75,
  "rewardsByType": {
    "signal_accuracy": 800.0,
    "bet_win": 400.0,
    "referral": 50.75
  },
  "recentRewards": [
    {
      "id": "string",
      "type": "signal_accuracy",
      "amount": 100.0,
      "description": "Top 10% accuracy on AI & ML trend signal",
      "earnedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "monthlyEarnings": {
    "currentMonth": 250.0,
    "previousMonth": 180.0,
    "growth": 38.9
  }
}
```

---

### Dashboard Endpoints

#### GET `/api/dashboard/stats`

Get platform-wide statistics for the dashboard.

**Response:**
```json
{
  "totalTrends": 156,
  "activeSignals": 2341,
  "totalUsers": 12500,
  "totalVolume": 45000000,
  "marketMood": "bull", // or "bear", "neutral"
  "topTrends": [
    {
      "id": "string",
      "title": "AI & Machine Learning Tokens",
      "performance": 24.5,
      "signalsCount": 1247
    }
  ],
  "recentActivity": [
    {
      "type": "trend_created",
      "description": "New trend 'DeFi Yield Farming' created",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Search Endpoints

#### GET `/api/search`

Search across trends, signals, and users.

**Query Parameters:**
- `q` (string, required): Search query
- `type` (string, optional): Search type (`trends`, `signals`, `users`, `all`)
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "query": "AI tokens",
  "results": {
    "trends": [
      {
        "id": "string",
        "title": "AI & Machine Learning Tokens",
        "description": "Emerging AI tokens showing strong momentum",
        "signalsCount": 1247,
        "performance": 24.5
      }
    ],
    "signals": [
      {
        "id": "string",
        "claim": "SOL will reach $120 by end of month",
        "trend": {
          "id": "string",
          "title": "AI & Machine Learning Tokens"
        },
        "user": {
          "walletAddress": "string",
          "reputationScore": 78
        }
      }
    ],
    "users": [
      {
        "id": "string",
        "walletAddress": "string",
        "reputationScore": 85,
        "level": 7
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

## 🚨 Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/trends"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_SIGNATURE` | 401 | Wallet signature verification failed |
| `MISSING_AUTH` | 401 | Authentication token missing or invalid |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `DUPLICATE_TREND` | 409 | Trend already exists |
| `INSUFFICIENT_BALANCE` | 400 | Not enough tokens for bet |
| `TREND_NOT_FOUND` | 404 | Trend does not exist |
| `BET_NOT_FOUND` | 404 | Bet does not exist |
| `UNAUTHORIZED_ACTION` | 403 | User not authorized for action |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Trend creation**: 5 trends per hour per user
- **Betting**: 20 bets per hour per user
- **Signal creation**: 50 signals per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248600
```

---

## 📡 WebSocket Events

### Real-time Updates

The platform provides WebSocket connections for real-time updates:

#### Connection

```javascript
const ws = new WebSocket('wss://api.trend.com/ws');

ws.onopen = () => {
  // Send authentication
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'jwt_token_here'
  }));
};
```

#### Event Types

**Trend Updates:**
```json
{
  "type": "trend_update",
  "data": {
    "trendId": "string",
    "performance": 24.5,
    "signalsCount": 1248,
    "upvotes": 893
  }
}
```

**Bet Settlement:**
```json
{
  "type": "bet_settled",
  "data": {
    "betId": "string",
    "result": "win",
    "payout": 145.0
  }
}
```

**New Signal:**
```json
{
  "type": "signal_created",
  "data": {
    "signalId": "string",
    "trendId": "string",
    "claim": "SOL will reach $120 by end of month",
    "user": {
      "walletAddress": "string",
      "reputationScore": 78
    }
  }
}
```

**Portfolio Update:**
```json
{
  "type": "portfolio_update",
  "data": {
    "walletAddress": "string",
    "totalValue": 12345.67,
    "change24h": 123.45
  }
}
```

---

## 🔧 SDK Examples

### JavaScript/TypeScript SDK

```typescript
import { TrendClient } from '@trend/sdk';

const client = new TrendClient({
  apiUrl: 'https://api.trend.com',
  wallet: walletAdapter
});

// Connect wallet
await client.connect();

// Get trends
const trends = await client.trends.list({
  page: 1,
  limit: 20,
  sort: 'trending'
});

// Create trend
const trend = await client.trends.create({
  title: 'AI & Machine Learning Tokens',
  description: 'Emerging AI tokens showing strong momentum',
  coins: ['SOL', 'RNDR', 'FET'],
  themeId: 'ai-ml'
});

// Place bet
const bet = await client.bets.place({
  trendId: trend.id,
  side: 'for',
  stakeAmount: 100,
  timeframe: '7d'
});

// Get portfolio
const portfolio = await client.portfolio.get();
```

### React Hooks

```typescript
import { useTrends, useCreateTrend, usePortfolio } from '@trend/react-hooks';

function TrendsPage() {
  const { data: trends, isLoading } = useTrends({
    page: 1,
    limit: 20
  });
  
  const createTrend = useCreateTrend();
  
  const handleCreateTrend = async (data) => {
    await createTrend.mutateAsync(data);
  };
  
  return (
    <div>
      {trends?.data.map(trend => (
        <TrendCard key={trend.id} trend={trend} />
      ))}
    </div>
  );
}
```

---

## 📊 API Versioning

The API uses URL-based versioning:

- **Current Version**: `/api/v1/`
- **Future Versions**: `/api/v2/`, `/api/v3/`, etc.

Version headers are also supported:

```
Accept: application/vnd.trend.v1+json
```

---

## 🔒 Security Considerations

### CORS Configuration

The API is configured to accept requests from:
- `https://trend.com` (production)
- `http://localhost:3000` (development)
- `https://app.trend.com` (mobile app)

### Content Security Policy

All responses include security headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

### Input Sanitization

All user inputs are sanitized and validated:
- SQL injection prevention through parameterized queries
- XSS prevention through output encoding
- CSRF protection through token validation

This API documentation provides comprehensive coverage of all endpoints and integration patterns for the TREND platform.
