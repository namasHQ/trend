'use client'

import { useState } from 'react'
import { TrendingUp, Wallet, Target, ArrowRight, ArrowLeft, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface OnboardingProps {
  onComplete: () => void
  onSkip: () => void
}

export function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Spot trends, signal early, get rewarded",
      subtitle: "Welcome to TREND",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <TrendingUp className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Discover Crypto Trends</h2>
            <p className="text-muted-foreground">
              Identify emerging patterns in crypto markets and share your insights with the community.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "How it works",
      subtitle: "Quick primer",
      content: (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Signal Trends</h3>
                  <p className="text-sm text-muted-foreground">
                    Create signals about crypto trends and earn rewards when they perform well.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Bet & Earn</h3>
                  <p className="text-sm text-muted-foreground">
                    Place bets on trend performance and win additional rewards when you're right.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      title: "Connect your wallet",
      subtitle: "Get started",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Connect your Solana wallet to start signaling trends, placing bets, and earning rewards.
            </p>
            <div className="space-y-3">
              <Button size="lg" className="w-full">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
              <Button variant="outline" size="lg" className="w-full">
                Explore trends (read-only)
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{steps[currentStep].title}</h1>
            <p className="text-muted-foreground">{steps[currentStep].subtitle}</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={nextStep}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
