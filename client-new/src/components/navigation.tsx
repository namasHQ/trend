'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  TrendingUp, 
  Wallet, 
  Target, 
  User,
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [

  { name: 'Home', href: '/trends', icon: TrendingUp },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Bets', href: '/bets', icon: Target },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Profile', href: '/profile', icon: User },
]

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <nav className={cn(
      "flex flex-col h-full border-r bg-background transition-all duration-300",
      isCollapsed ? "w-20" : "w-56",
      className
    )}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 rounded-full border border-gray-300"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 px-2 pb-2 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12",
                    isCollapsed ? "px-2" : "px-4"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5",
                    isCollapsed ? "mx-auto" : "mr-2"
                  )} />
                  {!isCollapsed && (
                    <span className="truncate text-base font-medium">{item.name}</span>
                  )}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Stats (when expanded) */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-enhanced">Active Bets</span>
              <span className="text-sm font-semibold text-primary-enhanced">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-enhanced">Signals</span>
              <span className="text-sm font-semibold text-primary-enhanced">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-enhanced">Rewards</span>
              <span className="text-sm font-semibold text-success-enhanced">2.4 TREND</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}