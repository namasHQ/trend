'use client'

import { TrendingUp, TrendingDown, Users, Target, Plus, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Trend } from '@/types'

interface TrendCardProps {
  trend: Trend
  onView?: (trend: Trend) => void
  onBet?: (trend: Trend) => void
  onSignal?: (trend: Trend) => void
  onFollow?: (trend: Trend) => void
  className?: string
  showVoting?: boolean
}

export function TrendCard({ 
  trend, 
  onView, 
  onBet, 
  onSignal, 
  onFollow,
  className,
  showVoting = false
}: TrendCardProps) {
  const isPositive = trend.performance > 0
  const isNegative = trend.performance < 0

  return (
    <Card className={cn("flex flex-row", className)}>
      <CardContent className="p-4 flex items-center gap-4 w-full">
        {/* Left: Performance Indicator */}
        <div className="flex-shrink-0">
          {isPositive ? (
            <TrendingUp className="h-8 w-8 text-success-enhanced" />
          ) : isNegative ? (
            <TrendingDown className="h-8 w-8 text-danger-enhanced" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-400" />
          )}
        </div>

        {/* Center: Main Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg leading-tight text-primary-enhanced">
                {trend.title}
              </h3>
              {trend.description && (
                <p className="text-sm text-secondary-enhanced line-clamp-1 leading-relaxed mt-1">
                  {trend.description}
                </p>
              )}
            </div>
            <Badge variant="outline" className="ml-2 shrink-0">
              {trend.theme_id}
            </Badge>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Performance */}
            <div className="flex items-center space-x-2">
              <span className={cn(
                "text-base font-semibold",
                isPositive ? "text-success-enhanced" : isNegative ? "text-danger-enhanced" : "text-secondary-enhanced"
              )}>
                {trend.performance > 0 ? '+' : ''}{trend.performance.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-enhanced">
                {trend.confidence}% confidence
              </span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Coins:</span>
              <div className="flex flex-wrap gap-1">
                {trend.coin_list.slice(0, 3).map((coin, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                    {coin}
                  </Badge>
                ))}
                {trend.coin_list.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{trend.coin_list.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Community Stats */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{trend.signals_count.toLocaleString()}</span>
                <span className="text-muted-foreground">signals</span>
              </div>
              {!showVoting && (
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{trend.upvotes.toLocaleString()}</span>
                  <span className="text-muted-foreground">upvotes</span>
                </div>
              )}
            </div>

            {/* Voting Stats */}
            {showVoting && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="h-4 w-4 text-success-enhanced" />
                  <span className="font-medium">{trend.upvotes.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsDown className="h-4 w-4 text-danger-enhanced" />
                  <span className="font-medium">{trend.downvotes.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex-shrink-0">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm"
              onClick={() => onView?.(trend)}
            >
              View
            </Button>
            <Button 
              size="sm" 
              className="text-sm"
              onClick={() => onBet?.(trend)}
            >
              Bet
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onSignal?.(trend)}
              className="px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
