'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Plus, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useCreateTrend } from '@/hooks/solanaHooks'
import { CreateTrendButton } from '../wallet-required-action'
import type { Trend } from '@/types'

interface CreateTrendModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateTrendModal({ isOpen, onClose }: CreateTrendModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coinInput, setCoinInput] = useState('')
  const [coinList, setCoinList] = useState<string[]>([])
  const [stakeAmount, setStakeAmount] = useState<number>(0)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'duplicate' | 'suggestions' | 'error'
    message: string
    matchedTrend?: Trend
    suggestions?: Trend[]
  } | null>(null)

  const createTrendMutation = useCreateTrend()

  const handleAddCoin = () => {
    if (coinInput.trim() && !coinList.includes(coinInput.trim().toUpperCase())) {
      setCoinList([...coinList, coinInput.trim().toUpperCase()])
      setCoinInput('')
    }
  }

  const handleRemoveCoin = (coin: string) => {
    setCoinList(coinList.filter(c => c !== coin))
  }

  const handleSubmit = async () => {
    if (!title.trim()) return

    setFeedback(null)

    try {
      const result = await createTrendMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        coinList,
        stakeAmount: stakeAmount > 0 ? stakeAmount : undefined,
      })

      const { apiResponse } = result

      if (apiResponse.duplicate && apiResponse.matchedTrend) {
        setFeedback({
          type: 'duplicate',
          message: apiResponse.message || 'Similar trend already exists',
          matchedTrend: apiResponse.matchedTrend,
        })
      } else if (apiResponse.suggestions && apiResponse.suggestions.length > 0) {
        setFeedback({
          type: 'suggestions',
          message: apiResponse.message || 'Similar trends found. Please review or create anyway.',
          suggestions: apiResponse.suggestions,
        })
      } else if (apiResponse.created && apiResponse.trend) {
        setFeedback({
          type: 'success',
          message: apiResponse.message || 'Trend created successfully!',
        })
        // Reset form and close after a delay
        setTimeout(() => {
          setTitle('')
          setDescription('')
          setCoinList([])
          setStakeAmount(0)
          setFeedback(null)
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Error creating trend:', error)
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create trend',
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-primary-enhanced">
                Create New Trend
              </h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <CreateTrendButton>
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary-enhanced">
                  Trend Title *
                </label>
                <Input
                  placeholder="e.g., AI & Machine Learning Tokens"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-base"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary-enhanced">
                  Description
                </label>
                <textarea
                  placeholder="Describe what makes this trend significant..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Coins */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary-enhanced">
                  Related Coins
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., SOL, RNDR, FET"
                    value={coinInput}
                    onChange={(e) => setCoinInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCoin()}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={handleAddCoin}
                    disabled={!coinInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {coinList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {coinList.map((coin) => (
                      <Badge 
                        key={coin} 
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {coin}
                        <button
                          onClick={() => handleRemoveCoin(coin)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Stake Amount (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-primary-enhanced">
                  Stake Amount (SOL) - Optional
                </label>
                <Input
                  type="number"
                  placeholder="0.1"
                  value={stakeAmount || ''}
                  onChange={(e) => setStakeAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Staking SOL shows confidence in your trend and may boost its visibility.
                </p>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className={`p-4 rounded-md border ${
                  feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  feedback.type === 'duplicate' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  feedback.type === 'suggestions' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                  'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5" /> :
                     feedback.type === 'error' ? <AlertCircle className="h-5 w-5 mt-0.5" /> :
                     <AlertCircle className="h-5 w-5 mt-0.5" />}
                    <div className="flex-1">
                      <p className="font-medium">{feedback.message}</p>
                      {feedback.matchedTrend && (
                        <div className="mt-2 p-3 bg-white rounded border">
                          <h4 className="font-semibold">{feedback.matchedTrend.title}</h4>
                          <p className="text-sm text-gray-600">{feedback.matchedTrend.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Created by: {feedback.matchedTrend.creator_wallet?.slice(0, 8)}...
                          </p>
                        </div>
                      )}
                      {feedback.suggestions && feedback.suggestions.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {feedback.suggestions.slice(0, 3).map((suggestion, index) => (
                            <div key={index} className="p-3 bg-white rounded border">
                              <h4 className="font-semibold">{suggestion.title}</h4>
                              <p className="text-sm text-gray-600">{suggestion.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Similarity: {Math.round(suggestion.similarity * 100)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!title.trim() || createTrendMutation.isPending}
                  className="flex-1"
                >
                  {createTrendMutation.isPending ? 'Creating...' : 'Create Trend'}
                </Button>
              </div>
            </div>
          </CreateTrendButton>
        </div>
      </Card>
    </div>
  )
}
