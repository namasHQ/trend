'use client'

import { Bot, Target, Activity, TrendingUp, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AgentStats as AgentStatsType } from '@/types/agents'

interface AgentStatsProps {
  stats?: AgentStatsType
  isLoading?: boolean
  className?: string
}

export function AgentStats({ stats, isLoading, className }: AgentStatsProps) {
  const statItems = [
    {
      title: 'Total Agents',
      value: stats?.totalAgents ?? 0,
      subtitle: `${stats?.activeAgents ?? 0} active`,
      icon: Bot,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Predictions',
      value: stats?.totalPredictions ?? 0,
      subtitle: 'All time',
      icon: Target,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Average Accuracy',
      value: stats?.averageAccuracy ? `${stats.averageAccuracy.toFixed(1)}%` : '—',
      subtitle: 'Across all agents',
      icon: Activity,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Deployment Cost',
      value: '0.1 SOL',
      subtitle: 'Per agent',
      icon: TrendingUp,
      iconColor: 'text-orange-600',
      bgColor: 'bg-orange-500/10',
    },
  ]

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="card-enhanced">
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {statItems.map((item) => (
        <Card key={item.title} className="card-enhanced">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {item.title}
                </p>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.subtitle}
                </p>
              </div>
              <div className={cn('p-2 rounded-lg', item.bgColor)}>
                <item.icon className={cn('h-5 w-5', item.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
