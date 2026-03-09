'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceData {
  date: string
  accuracy: number
  predictions: number
}

interface AgentPerformanceChartProps {
  data: PerformanceData[]
  className?: string
}

export function AgentPerformanceChart({ data, className }: AgentPerformanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={cn('card-enhanced', className)}>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No performance data available yet
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxAccuracy = Math.max(...data.map(d => d.accuracy))
  const avgAccuracy = data.reduce((sum, d) => sum + d.accuracy, 0) / data.length
  const trend = data[data.length - 1].accuracy - data[0].accuracy

  return (
    <Card className={cn('card-enhanced', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance History</CardTitle>
          <Badge variant={trend >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1">
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Simple bar chart visualization */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Average Accuracy</div>
              <div className="text-2xl font-bold">{avgAccuracy.toFixed(1)}%</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground mb-1">Peak Accuracy</div>
              <div className="text-2xl font-bold">{maxAccuracy.toFixed(1)}%</div>
            </div>
          </div>

          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-20">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all',
                          item.accuracy >= 70 ? 'bg-green-500' :
                          item.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                    <div className="text-sm font-semibold w-12 text-right">
                      {item.accuracy.toFixed(0)}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground w-16 text-right">
                  {item.predictions} pred
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
