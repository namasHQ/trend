import type { 
  Trend, 
  PaginatedResponse, 
  DashboardStats, 
  Portfolio, 
  Bet, 
  BetStats, 
  RewardsResponse, 
  UserProfile 
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const AUTH_STORAGE_KEY = 'trend-auth-token'

function getStoredToken() {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_STORAGE_KEY)
}

interface ApiFetchOptions extends RequestInit {
  requiresAuth?: boolean
}

async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { requiresAuth = false, headers, ...rest } = options
  const url = `${API_BASE_URL}${endpoint}`
  const finalHeaders = new Headers(headers || {})

  if (options.body) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (requiresAuth) {
    const token = getStoredToken()
    if (!token) {
      throw new Error('Authentication required. Please connect your wallet.')
    }
    finalHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
  })

  if (!response.ok) {
    const errorText = await response.text()
    const errorObject = new Error(errorText || `HTTP error! status: ${response.status}`)
    ;(errorObject as any).status = response.status
    throw errorObject
  }

  if (response.status === 204) {
    // No content
    return {} as T
  }

  return response.json()
}

export async function getTrends(params?: { page?: number; limit?: number; sort?: string }): Promise<PaginatedResponse<Trend>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())
  if (params?.sort) searchParams.set('sort', params.sort)

  return apiFetch(`/trends?${searchParams.toString()}`)
}

export async function getTrend(id: string): Promise<Trend | null> {
  try {
    return await apiFetch(`/trends/${id}`)
  } catch (error: any) {
    if (error?.status === 404) {
      return null
    }
    throw error
  }
}

export interface CreateTrendRequest {
  title: string
  description?: string
  coinList?: string[]
  source?: string
  containerId?: string
}

export interface CreateTrendResponse {
  duplicate?: boolean
  created?: boolean
  trend?: Trend
  matchedTrend?: Trend
  suggestions?: Trend[]
  message?: string
}

export async function createTrend(data: CreateTrendRequest): Promise<CreateTrendResponse> {
  return apiFetch('/trends/check-and-create', {
    method: 'POST',
    requiresAuth: true,
    body: JSON.stringify(data),
  })
}

export function getDashboardStats(): Promise<DashboardStats> {
  return apiFetch('/dashboard/stats')
}

export function getPortfolioSummary(): Promise<Portfolio> {
  return apiFetch('/portfolio', { requiresAuth: true })
}

export function syncPortfolio(): Promise<{ success: boolean; message: string; lastSynced: string }> {
  return apiFetch('/portfolio/sync', { method: 'POST', requiresAuth: true })
}

export function getBets(params: { status?: 'active' | 'settled'; page?: number; limit?: number } = {}): Promise<PaginatedResponse<Bet>> {
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set('status', params.status)
  if (params.page) searchParams.set('page', params.page.toString())
  if (params.limit) searchParams.set('limit', params.limit.toString())

  return apiFetch(`/bets?${searchParams.toString()}`, { requiresAuth: true })
}

export function getBetStats(): Promise<BetStats> {
  return apiFetch('/bets/stats', { requiresAuth: true })
}

export function getCurrentUser(): Promise<UserProfile> {
  return apiFetch('/auth/me', { requiresAuth: true })
}

export function getRewardsSummary(): Promise<RewardsResponse> {
  return apiFetch('/rewards', { requiresAuth: true })
}
