'use client'

import { Bot, TrendingUp, TrendingDown, Target, Activity, Clock, MoreVertical, Trash2, Settings, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Agent } from '@/types/agents'

interface AgentCardProps {
  agent: Agent
  onView?: (agent: Agent) => void
  onManage?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  onViewPredictions?: (agent: Agent) => void
  className?: string
}

export function AgentCard({
  agent,
  onView,
  onManage,
  onDelete,
  onViewPredictions,
  className,
}: AgentCardProps) {
  const accuracy = agent.accuracy ?? 0
  const isHighAccuracy = accuracy >= 70
  const isMediumAccuracy = accuracy >= 50 && accuracy < 70

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

  const getAccuracyColor = () => {
    if (isHighAccuracy) return 'text-green-600'
    if (isMediumAccuracy) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <Card className={cn('card-enhanced hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Agent Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Agent Icon */}
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
              agent.status === 'active' ? 'bg-primary/10' : 'bg-muted'
            )}>
              <Bot className={cn(
                'h-6 w-6',
                agent.status === 'active' ? 'text-primary' : 'text-muted-foreground'
              )} />
            </div>

            {/* Agent Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg truncate">{agent.name}</h3>
                <Badge variant="outline" className={cn('text-xs', getStatusColor(agent.status))}>
                  {agent.status}
                </Badge>
              </div>

              {agent.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {agent.description}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Predictions */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    <span>Predictions</span>
                  </div>
                  <div className="font-semibold">{agent.total_predictions}</div>
                </div>

                {/* Accuracy */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>Accuracy</span>
                  </div>
                  <div className={cn('font-semibold', getAccuracyColor())}>
                    {accuracy > 0 ? `${accuracy.toFixed(1)}%` : '—'}
                  </div>
                </div>

                {/* Success Rate */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>Successful</span>
                  </div>
                  <div className="font-semibold text-green-600">
                    {agent.successful_predictions}
                  </div>
                </div>

                {/* Last Activity */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Last Active</span>
                  </div>
                  <div className="font-semibold text-sm">
                    {getTimeAgo(agent.last_prediction_at)}
                  </div>
                </div>
              </div>

              {/* Accuracy Progress Bar */}
              {agent.total_predictions > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className={getAccuracyColor()}>
                      {agent.successful_predictions}/{agent.total_predictions}
                    </span>
                  </div>
                  <Progress 
                    value={accuracy} 
                    className="h-1.5"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-start gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewPredictions?.(agent)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Predictions
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(agent)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManage?.(agent)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Agent
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete?.(agent)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Footer: Deployment Info */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Deployed {formatDate(agent.created_at)}</span>
          {agent.deployment_tx && (
            <a
              href={`https://solscan.io/tx/${agent.deployment_tx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              View Transaction →
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
