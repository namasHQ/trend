'use client'

import { Bot, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface AgentEmptyStateProps {
  onDeploy: () => void
}

export function AgentEmptyState({ onDeploy }: AgentEmptyStateProps) {
  const features = [
    {
      icon: TrendingUp,
      title: 'Automated Predictions',
      description: 'AI agents analyze trends and make predictions 24/7',
    },
    {
      icon: Zap,
      title: 'Real-time Analysis',
      description: 'Continuous market monitoring and signal detection',
    },
    {
      icon: Sparkles,
      title: 'Powered by ElizaOS',
      description: 'Advanced AI framework for autonomous agents',
    },
  ]

  return (
    <Card className="card-glass">
      <CardContent className="p-12">
        <div className="text-center max-w-2xl mx-auto">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Bot className="h-10 w-10 text-primary" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold mb-3">Deploy Your First AI Agent</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Start making automated predictions on crypto trends with AI-powered agents
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Button onClick={onDeploy} size="lg" className="px-8">
              <Bot className="h-5 w-5 mr-2" />
              Deploy Your First Agent
            </Button>
            <p className="text-sm text-muted-foreground">
              Deployment cost: <span className="font-semibold text-foreground">0.1 SOL</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
