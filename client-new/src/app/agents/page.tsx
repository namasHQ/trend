'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bot, Plus, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWalletConnection } from '@/hooks/solanaHooks'
import { useAuthToken } from '@/hooks/useAuthToken'
import { getAgents, getAgentStats, deleteAgent } from '@/api/agents'
import { DeployAgentModal } from '@/components/modals/deploy-agent-modal'
import { 
  AgentCard, 
  AgentStats, 
  AgentFilters, 
  AgentDetailModal,
  AgentEmptyState,
  type AgentSortOption,
  type AgentStatusFilter 
} from '@/components/agents'
import type { Agent } from '@/types/agents'

export default function AgentsPage() {
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<AgentSortOption>('newest')
  const [statusFilter, setStatusFilter] = useState<AgentStatusFilter>('all')

  const { isConnected, publicKey } = useWalletConnection()
  const authToken = useAuthToken()
  const isAuthenticated = isConnected && !!authToken
  const queryClient = useQueryClient()


  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', publicKey?.toBase58()],
    queryFn: getAgents,
    enabled: isAuthenticated || true, // Always enabled for demo
    staleTime: 30_000,
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['agent-stats'],
    queryFn: getAgentStats,
    enabled: isAuthenticated || true, // Always enabled for demo
    staleTime: 60_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (agentId: string) => deleteAgent(agentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['agent-stats'] })
      setIsDetailModalOpen(false)
      setSelectedAgent(null)
    },
  })

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    if (!agents) return []

    let result = [...agents]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (agent) =>
          agent.name.toLowerCase().includes(query) ||
          agent.description?.toLowerCase().includes(query)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((agent) => agent.status === statusFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'accuracy':
          return (b.accuracy ?? 0) - (a.accuracy ?? 0)
        case 'predictions':
          return b.total_predictions - a.total_predictions
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  }, [agents, searchQuery, statusFilter, sortBy])

  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsDetailModalOpen(true)
  }

  const handleManageAgent = (agent: Agent) => {
    // TODO: Open manage agent modal
    console.log('Manage agent:', agent.id)
  }

  const handleDeleteAgent = (agent: Agent) => {
    if (confirm(`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(agent.id)
    }
  }

  const handleViewPredictions = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsDetailModalOpen(true)
  }

  const handleDeployClick = () => {
    setIsDeployModalOpen(true)
  }


  // Show demo data even without authentication for demo purposes
  const showDemoData = true

  if (!isAuthenticated && !showDemoData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Wallet & Authentication Required</h3>
          <p className="text-muted-foreground mb-8">
            Connect your Solana wallet and log in to deploy and manage AI agents.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            AI Agents
          </h1>
          <p className="text-muted-foreground mt-1">
            Deploy AI agents to make automated predictions on trends
          </p>
        </div>
        <Button onClick={handleDeployClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Deploy Agent
        </Button>
      </div>

      {/* Stats */}
      <AgentStats stats={stats} isLoading={statsLoading} />

      {/* Show empty state if no agents exist */}
      {!agentsLoading && (!agents || agents.length === 0) ? (
        <AgentEmptyState onDeploy={handleDeployClick} />
      ) : (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <AgentFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
              />
            </CardContent>
          </Card>

          {/* Agents List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Your Agents {filteredAgents.length > 0 && `(${filteredAgents.length})`}
              </h2>
            </div>

            {agentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAgents.length === 0 ? (
              <Card>
                <CardContent className="p-12">
                  <div className="text-center">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Agents Match Your Filters</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filter criteria.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAgents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onView={handleViewAgent}
                    onManage={handleManageAgent}
                    onDelete={handleDeleteAgent}
                    onViewPredictions={handleViewPredictions}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Info Card */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            About AI Agents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            AI Agents are automated prediction systems powered by ElizaOS. Each agent costs 0.1 SOL to deploy 
            and will continuously analyze market trends and make predictions.
          </p>
          <p>
            Agents make predictions on trends, prices, and signals. Their accuracy is tracked and displayed 
            in your agent dashboard.
          </p>
          <p>
            <strong className="text-foreground">Note:</strong> Agent deployment and management features 
            are currently being developed. The backend infrastructure will be added soon.
          </p>
        </CardContent>
      </Card>

      {/* Deploy Agent Modal */}
      <DeployAgentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onSuccess={() => {
          setIsDeployModalOpen(false)
          queryClient.invalidateQueries({ queryKey: ['agents'] })
          queryClient.invalidateQueries({ queryKey: ['agent-stats'] })
        }}
      />

      {/* Agent Detail Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedAgent(null)
        }}
        onManage={handleManageAgent}
        onDelete={handleDeleteAgent}
      />
    </div>
  )
}



