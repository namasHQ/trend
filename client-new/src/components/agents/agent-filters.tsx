'use client'

import { Search, Filter, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type AgentSortOption = 'newest' | 'oldest' | 'accuracy' | 'predictions' | 'name'
export type AgentStatusFilter = 'all' | 'active' | 'inactive' | 'deploying' | 'error'

interface AgentFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: AgentSortOption
  onSortChange: (sort: AgentSortOption) => void
  statusFilter: AgentStatusFilter
  onStatusFilterChange: (status: AgentStatusFilter) => void
  className?: string
}

export function AgentFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  statusFilter,
  onStatusFilterChange,
  className,
}: AgentFiltersProps) {
  const sortOptions: { value: AgentSortOption; label: string }[] = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'accuracy', label: 'Highest Accuracy' },
    { value: 'predictions', label: 'Most Predictions' },
    { value: 'name', label: 'Name (A-Z)' },
  ]

  const statusOptions: { value: AgentStatusFilter; label: string }[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'deploying', label: 'Deploying' },
    { value: 'error', label: 'Error' },
  ]

  const activeFiltersCount = (statusFilter !== 'all' ? 1 : 0)

  const handleSortChange = (value: string) => {
    onSortChange(value as AgentSortOption)
  }

  return (
    <div className={cn('flex flex-col sm:flex-row gap-3', className)}>
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents by name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <Select value={sortBy} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {statusOptions.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={statusFilter === option.value}
              onCheckedChange={() => onStatusFilterChange(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
