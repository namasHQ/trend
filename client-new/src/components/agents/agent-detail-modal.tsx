'use client'

import { useQuery } from '@tanstack/react-query'
import { Bot, Activity, Target, TrendingUp, Clock, ExternalLink, Loader2, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AgentPredictionsList } from './agent-predictions-list'
import { getAgentPredictions } from '@/api/agents'
import { cn } from '@/lib/utils'
import type { Agent } from '@/types/agents'

interface AgentDetailModalProps {
  agent: Agent | null
  isOpen: boolean
  onClose: () => void
  onManage?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
}

export function AgentDetailModal({
  agent,
  isOpen,
  onClose,
  onManage,
  onDelete,
}: AgentDetailModalProps) {
  const { data: predictions, isLoading: predictionsLoading } = useQuery({
    queryKey: ['agent-predictions', agent?.id],
    queryFn: () => getAgentPredictions(agent!.id),
    enabled: isOpen && !!agent?.id,
  })

  if (!agent) return null

  const accuracy = agent.accuracy ?? 0
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'deploying':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'error':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span>{agent.name}</span>
                <Badge variant="outline" className={cn('text-xs', getStatusColor(agent.status))}>
                  {agent.status}
                </Badge>
              </div>
              {agent.description && (
                <p className="text-sm font-normal text-muted-foreground mt-1">
                  {agent.description}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="h-4 w-4" />
                  <span>Total Predictions</span>
                </div>
                <p className="text-2xl font-bold">{agent.total_predictions}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Successful</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{agent.successful_predictions}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Activity className="h-4 w-4" />
                  <span>Accuracy</span>
                </div>
                <p className="text-2xl font-bold">
                  {accuracy > 0 ? `${accuracy.toFixed(1)}%` : '—'}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span>Last Active</span>
                </div>
                <p className="text-lg font-semibold">
                  {agent.last_prediction_at
                    ? new Date(agent.last_prediction_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>

            {/* Accuracy Progress */}
            {agent.total_predictions > 0 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {agent.successful_predictions} / {agent.total_predictions} predictions
                  </span>
                </div>
                <Progress value={accuracy} className="h-2" />
              </div>
            )}

            {/* Deployment Info */}
            <div className="p-4 rounded-lg border">
              <h4 className="font-semibold mb-3">Deployment Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deployed</span>
                  <span>{formatDate(agent.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span>{formatDate(agent.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-mono text-xs">
                    {agent.owner_wallet.slice(0, 8)}...{agent.owner_wallet.slice(-8)}
                  </span>
                </div>
                {agent.deployment_tx && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transaction</span>
                    <a
                      href={`https://solscan.io/tx/${agent.deployment_tx}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      View on Solscan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onManage?.(agent)}
              >
                Manage Agent
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete?.(agent)}
              >
                Delete
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="predictions" className="mt-4">
            {predictionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <AgentPredictionsList predictions={predictions || []} />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
