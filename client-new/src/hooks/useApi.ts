import { useQuery } from '@tanstack/react-query'
import type { Trend, PaginatedResponse, DashboardStats } from '@/types'
import { getTrends, getTrend, getDashboardStats } from '@/api'

// Trends
export function useTrends(params?: { page?: number; limit?: number; sort?: string }) {
  console.log('🔍 useTrends hook called with params:', params)
  
  return useQuery({
    queryKey: ['trends', params],
    queryFn: async () => {
      console.log('📡 useTrends queryFn called')
      try {
        const result = await getTrends(params)
        console.log('✅ useTrends queryFn result:', result)
        return result
      } catch (error) {
        console.error('❌ useTrends queryFn error:', error)
        throw error
      }
    },
    staleTime: 60000, // 1 minute
  })
}

export function useTrend(id: string) {
  console.log('🔍 useTrend hook called with id:', id)
  
  return useQuery({
    queryKey: ['trend', id],
    queryFn: async () => {
      console.log('📡 useTrend queryFn called')
      try {
        const result = await getTrend(id)
        console.log('✅ useTrend queryFn result:', result)
        return result
      } catch (error) {
        console.error('❌ useTrend queryFn error:', error)
        throw error
      }
    },
    enabled: !!id,
  })
}

// Dashboard
export function useDashboardStats() {
  console.log('🔍 useDashboardStats hook called')
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      console.log('📡 useDashboardStats queryFn called')
      try {
        const result = await getDashboardStats()
        console.log('✅ useDashboardStats queryFn result:', result)
        return result
      } catch (error) {
        console.error('❌ useDashboardStats queryFn error:', error)
        throw error
      }
    },
    staleTime: 30000, // 30 seconds
  })
}

