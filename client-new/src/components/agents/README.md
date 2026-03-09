# Agents Page Components

This directory contains all the components for the AI Agents feature of the TREND platform.

## Overview

The Agents page allows users to deploy and manage AI-powered agents that make automated predictions on crypto trends. Agents are powered by ElizaOS and cost 0.1 SOL to deploy.

## Components

### 1. **AgentCard** (`agent-card.tsx`)
Displays individual agent information in a card format.

**Features:**
- Agent status indicator (active, deploying, inactive, error)
- Performance metrics (predictions, accuracy, success rate)
- Last activity timestamp
- Accuracy progress bar
- Action menu (view details, manage, delete)
- Transaction link to Solscan

**Props:**
```typescript
{
  agent: Agent
  onView?: (agent: Agent) => void
  onManage?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  onViewPredictions?: (agent: Agent) => void
  className?: string
}
```

### 2. **AgentStats** (`agent-stats.tsx`)
Overview statistics for all agents.

**Features:**
- Total agents count with active agents
- Total predictions made
- Average accuracy across all agents
- Deployment cost information
- Loading state with skeleton cards

**Props:**
```typescript
{
  stats?: AgentStats
  isLoading?: boolean
  className?: string
}
```

### 3. **AgentPredictionsList** (`agent-predictions-list.tsx`)
Displays a list of predictions made by an agent.

**Features:**
- Prediction direction (bullish, bearish, neutral)
- Confidence level and timeframe
- Status badges (pending, active, settled)
- Result indicators (correct, incorrect, partial)
- Target price display
- Empty state for no predictions

**Props:**
```typescript
{
  predictions: AgentPrediction[]
  isLoading?: boolean
  className?: string
}
```

### 4. **AgentDetailModal** (`agent-detail-modal.tsx`)
Modal dialog showing detailed agent information.

**Features:**
- Tabbed interface (Overview, Predictions)
- Comprehensive stats grid
- Deployment information
- Owner wallet address
- Transaction link
- Manage and delete actions
- Integrated predictions list

**Props:**
```typescript
{
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onManage?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
}
```

### 5. **AgentFilters** (`agent-filters.tsx`)
Search, sort, and filter controls for the agents list.

**Features:**
- Search by agent name or description
- Sort options (newest, oldest, accuracy, predictions, name)
- Status filter (all, active, inactive, deploying, error)
- Active filter count badge
- Responsive layout

**Props:**
```typescript
{
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: AgentSortOption
  onSortChange: (sort: AgentSortOption) => void
  statusFilter: AgentStatusFilter
  onStatusFilterChange: (status: AgentStatusFilter) => void
  className?: string
}
```

### 6. **AgentEmptyState** (`agent-empty-state.tsx`)
Beautiful empty state when no agents are deployed.

**Features:**
- Feature highlights (Automated Predictions, Real-time Analysis, ElizaOS)
- Call-to-action button
- Deployment cost display
- Engaging visual design

**Props:**
```typescript
{
  onDeploy: () => void
}
```

### 7. **AgentPerformanceChart** (`agent-performance-chart.tsx`)
Visualizes agent performance over time.

**Features:**
- Bar chart visualization
- Average and peak accuracy metrics
- Performance trend indicator
- Color-coded accuracy levels (green ≥70%, yellow ≥50%, red <50%)
- Empty state for no data

**Props:**
```typescript
{
  data: PerformanceData[]
  className?: string
}
```

## Page Implementation

The main Agents page (`/app/agents/page.tsx`) integrates all components:

### Features:
- ✅ Wallet authentication check
- ✅ Agent deployment modal
- ✅ Real-time stats overview
- ✅ Search and filtering
- ✅ Sorting (newest, oldest, accuracy, predictions, name)
- ✅ Agent detail modal with predictions
- ✅ Delete agent with confirmation
- ✅ Empty state for first-time users
- ✅ Loading states
- ✅ Responsive design

### State Management:
- Uses React Query for data fetching and caching
- Optimistic updates on mutations
- Auto-refetch on success
- 30s stale time for agents
- 60s stale time for stats

## UI Components Added

Three new shadcn/ui components were created:

### 1. **Progress** (`/components/ui/progress.tsx`)
- Radix UI Progress component
- Smooth transitions
- Customizable styling

### 2. **Tabs** (`/components/ui/tabs.tsx`)
- Radix UI Tabs component
- Keyboard navigation
- Accessible design

### 3. **Select** (`/components/ui/select.tsx`)
- Radix UI Select component
- Searchable dropdown
- Keyboard navigation
- Custom styling

## Dependencies Installed

```bash
npm install @radix-ui/react-progress @radix-ui/react-tabs @radix-ui/react-select
```

## Usage Example

```tsx
import { 
  AgentCard, 
  AgentStats, 
  AgentFilters,
  AgentDetailModal,
  AgentEmptyState 
} from '@/components/agents'

// In your component
<AgentStats stats={stats} isLoading={loading} />

<AgentFilters
  searchQuery={search}
  onSearchChange={setSearch}
  sortBy={sort}
  onSortChange={setSort}
  statusFilter={filter}
  onStatusFilterChange={setFilter}
/>

{agents.map(agent => (
  <AgentCard
    key={agent.id}
    agent={agent}
    onView={handleView}
    onDelete={handleDelete}
  />
))}
```

## API Integration

Components integrate with the following API endpoints:

- `GET /api/agents` - Fetch all user agents
- `GET /api/agents/:id` - Fetch single agent
- `GET /api/agents/:id/predictions` - Fetch agent predictions
- `GET /api/agents/stats` - Fetch agent statistics
- `POST /api/agents/deploy` - Deploy new agent
- `PATCH /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

## Types

All TypeScript types are defined in `/types/agents.ts`:

```typescript
interface Agent {
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

interface AgentPrediction {
  id: string
  agent_id: string
  trend_id?: string
  prediction_type: 'trend' | 'price' | 'signal'
  prediction: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  target_price?: number
  timeframe: number
  created_at: string
  status: 'pending' | 'active' | 'settled'
  result?: 'correct' | 'incorrect' | 'partial'
  accuracy_score?: number
}

interface AgentStats {
  totalAgents: number
  activeAgents: number
  totalPredictions: number
  averageAccuracy: number
  totalDeployed: number
}
```

## Styling

Components use Tailwind CSS with custom classes:
- `card-enhanced` - Enhanced card styling
- `card-glass` - Glass morphism effect
- `card-matte` - Matte finish card

Color coding:
- **Green** - High accuracy (≥70%), success, bullish
- **Yellow** - Medium accuracy (50-70%), pending, neutral
- **Red** - Low accuracy (<50%), error, bearish
- **Blue** - Active status, information

## Future Enhancements

Potential improvements:
- [ ] Agent configuration editor
- [ ] Performance analytics dashboard
- [ ] Prediction history charts
- [ ] Agent marketplace
- [ ] Batch operations
- [ ] Export agent data
- [ ] Agent templates
- [ ] Real-time prediction updates via WebSocket
- [ ] Agent collaboration features
- [ ] Advanced filtering (date range, accuracy threshold)

## Notes

- Agent deployment requires 0.1 SOL
- Backend infrastructure is in development
- Agents are powered by ElizaOS framework
- All transactions are recorded on Solana blockchain
- Predictions are tracked and accuracy is calculated automatically
