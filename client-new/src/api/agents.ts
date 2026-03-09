
import type { Agent, AgentPrediction, AgentStats, AgentDeploymentParams } from '@/types/agents'
import { mockAgents, mockAgentStats } from '@/data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'


async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = localStorage.getItem('trend-auth-token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, { ...options, headers })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
  }

  return response.json()
}


export async function getAgents(): Promise<Agent[]> {
  console.log('📡 API: getAgents called')
  // Return mock data for demo purposes
  return mockAgents
}

export async function getAgent(id: string): Promise<Agent> {
  console.log('📡 API: getAgent called with id:', id)
  const url = `${API_BASE_URL}/agents/${id}`
  return fetchWithAuth(url)
}

export async function getAgentPredictions(agentId: string): Promise<AgentPrediction[]> {
  console.log('📡 API: getAgentPredictions called for agent:', agentId)
  const url = `${API_BASE_URL}/agents/${agentId}/predictions`
  const response = await fetchWithAuth(url)
  return response.data || response || []
}


export async function getAgentStats(): Promise<AgentStats> {
  console.log('📡 API: getAgentStats called')
  // Return mock data for demo purposes
  return mockAgentStats
}

export async function deployAgent(params: AgentDeploymentParams, signature: string, transactionHash: string): Promise<Agent> {
  console.log('📡 API: deployAgent called with params:', params)
  const url = `${API_BASE_URL}/agents/deploy`
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({
      ...params,
      signature,
      transactionHash,
    }),
  })
}

export async function updateAgent(agentId: string, params: Partial<AgentDeploymentParams>): Promise<Agent> {
  console.log('📡 API: updateAgent called for agent:', agentId)
  const url = `${API_BASE_URL}/agents/${agentId}`
  return fetchWithAuth(url, {
    method: 'PATCH',
    body: JSON.stringify(params),
  })
}

export async function deleteAgent(agentId: string): Promise<{ success: boolean }> {
  console.log('📡 API: deleteAgent called for agent:', agentId)
  const url = `${API_BASE_URL}/agents/${agentId}`
  return fetchWithAuth(url, {
    method: 'DELETE',
  })
}
