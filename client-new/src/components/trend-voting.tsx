'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown } from 'lucide-react'
import { useVote } from '@/hooks/solanaHooks'
import { VoteButton } from './wallet-required-action'

interface TrendVotingProps {
  trendId: string
  trendTitle: string
  currentUpvotes: number
  currentDownvotes: number
  userVote?: 'up' | 'down' | null
}

export function TrendVoting({ 
  trendId, 
  trendTitle, 
  currentUpvotes, 
  currentDownvotes,
  userVote 
}: TrendVotingProps) {
  const [selectedVote, setSelectedVote] = useState<'up' | 'down' | null>(userVote || null)
  const [stakeAmount, setStakeAmount] = useState<number>(0)
  
  const voteMutation = useVote()

  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      await voteMutation.mutateAsync({
        trendId,
        voteType,
        stakeAmount: stakeAmount > 0 ? stakeAmount : undefined,
      })
      
      setSelectedVote(voteType)
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const totalVotes = currentUpvotes + currentDownvotes
  const upvotePercentage = totalVotes > 0 ? (currentUpvotes / totalVotes) * 100 : 0
  const downvotePercentage = totalVotes > 0 ? (currentDownvotes / totalVotes) * 100 : 0

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary-enhanced">Community Sentiment</h3>
          <div className="text-sm text-muted-foreground">
            {totalVotes} votes
          </div>
        </div>

        {/* Vote Progress Bars */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-success-enhanced">Bullish</span>
            </div>
            <span className="font-medium">{currentUpvotes}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all duration-300"
              style={{ width: `${upvotePercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-danger-enhanced">Bearish</span>
            </div>
            <span className="font-medium">{currentDownvotes}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-destructive h-2 rounded-full transition-all duration-300"
              style={{ width: `${downvotePercentage}%` }}
            />
          </div>
        </div>

        {/* Voting Actions */}
        <VoteButton>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                variant={selectedVote === 'up' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('up')}
                disabled={voteMutation.isPending}
                className={`flex-1 ${
                  selectedVote === 'up' 
                    ? 'bg-success' 
                    : ''
                }`}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Vote Bullish
              </Button>
              
              <Button
                variant={selectedVote === 'down' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleVote('down')}
                disabled={voteMutation.isPending}
                className={`flex-1 ${
                  selectedVote === 'down' 
                    ? 'bg-destructive' 
                    : ''
                }`}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Vote Bearish
              </Button>
            </div>

            {/* Stake Amount */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Stake SOL (Optional)
              </label>
              <input
                type="number"
                placeholder="0.1"
                value={stakeAmount || ''}
                onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="w-full p-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground">
                Staking SOL shows stronger conviction and may influence trend ranking.
              </p>
            </div>
          </div>
        </VoteButton>
      </div>
    </Card>
  )
}
