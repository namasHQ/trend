'use client'

import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from 'lucide-react'

interface MoreWalletsButtonProps {
  expanded: boolean
  onClick: () => void
}

export function MoreWalletsButton({ expanded, onClick }: MoreWalletsButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full mt-2 border-gray-300 text-gray-900 bg-white"
      onClick={onClick}
    >
      <span className="font-medium">{expanded ? 'Less' : 'More'} options</span>
      {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
    </Button>
  )
}

