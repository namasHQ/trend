'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Header } from '@/components/header'
import { Navigation } from '@/components/navigation'
import { RightSidebar } from '@/components/right-sidebar'
import { Onboarding } from '@/components/onboarding'
import { RegistrationModal } from '@/components/modals/registration-modal'
import { useWalletAuth } from '@/hooks/useWalletAuth'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const pathname = usePathname()
  const { connected, publicKey } = useWallet()
  const { needsRegistration, checkUser } = useWalletAuth()
  const [showRegistration, setShowRegistration] = useState(false)
  
  // Get page name from pathname
  const getPageName = () => {
    if (pathname === '/') return 'dashboard'
    return pathname.slice(1) // Remove leading slash
  }

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('trend-onboarding-completed')
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  // Show registration modal when wallet connects and user needs registration
  useEffect(() => {
    if (connected && publicKey && needsRegistration) {
      setShowRegistration(true)
    } else {
      setShowRegistration(false)
    }
  }, [connected, publicKey, needsRegistration])

  const handleOnboardingComplete = () => {
    localStorage.setItem('trend-onboarding-completed', 'true')
    setShowOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    localStorage.setItem('trend-onboarding-completed', 'true')
    setShowOnboarding(false)
  }

  const handleRegistrationSuccess = () => {
    setShowRegistration(false)
    checkUser() // Refresh user check
  }

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    )
  }

  // Landing page should not have sidebar and toolbar
  if (pathname === '/landing') {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {children}
        </main>
      </div>
    )
  }

      return (
        <>
          <div className="h-screen bg-background flex flex-col" data-page={getPageName()}>
            <Header />
            
            <div className="flex flex-1 overflow-hidden">
              <Navigation />
              
              <main className="flex-1 overflow-y-auto mr-[50px]">
                <div className="page-content">
                  {children}
                </div>
              </main>
              
              <RightSidebar />
            </div>
          </div>
          
          {/* Registration Modal */}
          <RegistrationModal
            isOpen={showRegistration}
            onClose={() => setShowRegistration(false)}
            onSuccess={handleRegistrationSuccess}
          />
        </>
      )
}
