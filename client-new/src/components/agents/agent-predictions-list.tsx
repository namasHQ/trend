'use client'

import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AgentPrediction } from '@/types/agents'

interface AgentPredictionsListProps {
  predictions: AgentPrediction[]
  isLoading?: boolean
  className?: string
}

export function AgentPredictionsList({ predictions, isLoading, className }: AgentPredictionsListProps) {
  const getPredictionIcon = (prediction: AgentPrediction['prediction']) => {
    switch (prediction) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: AgentPrediction['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'active':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'settled':
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Settled
          </Badge>
        )
    }
  }

  const getResultBadge = (result?: AgentPrediction['result']) => {
    if (!result) return null
    
    switch (result) {
      case 'correct':
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Correct
          </Badge>
        )
      case 'incorrect':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Incorrect
          </Badge>
        )
      case 'partial':
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <AlertCircle className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <Card className={cn('card-enhanced', className)}>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!predictions || predictions.length === 0) {
    return (
      <Card className={cn('card-enhanced', className)}>
        <CardHeader>
          <CardTitle>Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Predictions Yet</h3>
            <p className="text-muted-foreground">
              This agent hasn't made any predictions yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('card-enhanced', className)}>
      <CardHeader>
        <CardTitle>Recent Predictions ({predictions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predictions.map((prediction) => (
            <div
              key={prediction.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Prediction Direction */}
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  prediction.prediction === 'bullish' ? 'bg-green-500/10' :
                  prediction.prediction === 'bearish' ? 'bg-red-500/10' : 'bg-gray-500/10'
                )}>
                  {getPredictionIcon(prediction.prediction)}
                </div>

                {/* Prediction Details */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold capitalize">{prediction.prediction}</span>
                    <Badge variant="secondary" className="text-xs">
                      {prediction.prediction_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>Confidence: {prediction.confidence}%</span>
                    <span>•</span>
                    <span>Timeframe: {prediction.timeframe}d</span>
                    {prediction.target_price && (
                      <>
                        <span>•</span>
                        <span>Target: ${prediction.target_price.toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status & Result */}
              <div className="flex items-center gap-3">
                {getStatusBadge(prediction.status)}
                {getResultBadge(prediction.result)}
                <span className="text-xs text-muted-foreground">
                  {formatDate(prediction.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
