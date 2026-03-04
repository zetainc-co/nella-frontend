import { apiClient } from '@/core/api/api-client'
import type { Agent, CreateAgentDto, UpdateAgentDto, Inbox } from '../types/team-types'

export const teamService = {
  /**
   * List all agents
   */
  async listAgents(): Promise<Agent[]> {
    return apiClient.get<Agent[]>('/api/chatwoot-agents')
  },

  /**
   * Create a new agent
   */
  async createAgent(data: CreateAgentDto): Promise<Agent> {
    return apiClient.post<Agent>('/api/chatwoot-agents', data)
  },

  /**
   * Update an agent
   */
  async updateAgent(agentId: number, data: UpdateAgentDto): Promise<Agent> {
    return apiClient.patch<Agent>(`/api/chatwoot-agents?id=${agentId}`, data)
  },

  /**
   * Delete an agent
   */
  async deleteAgent(agentId: number): Promise<void> {
    return apiClient.delete<void>(`/api/chatwoot-agents?id=${agentId}`)
  },

  /**
   * List all inboxes
   */
  async listInboxes(): Promise<Inbox[]> {
    return apiClient.get<Inbox[]>('/api/chatwoot-agents/inboxes')
  },

  /**
   * List agents assigned to an inbox
   */
  async listInboxMembers(inboxId: number): Promise<Agent[]> {
    return apiClient.get<Agent[]>(`/api/chatwoot-agents/inboxes/${inboxId}/members`)
  },

  /**
   * Add agents to an inbox (additive)
   */
  async addInboxMembers(inboxId: number, userIds: number[]): Promise<Agent[]> {
    const data = await apiClient.post<{ payload?: Agent[] } | Agent[]>(
      `/api/chatwoot-agents/inboxes/${inboxId}/members`,
      { user_ids: userIds },
    )
    // Backend returns { payload: [...] } or [...] directly
    return (data as { payload?: Agent[] }).payload || (data as Agent[])
  },

  /**
   * Update inbox members (replace all)
   */
  async updateInboxMembers(inboxId: number, userIds: number[]): Promise<Agent[]> {
    return apiClient.patch<Agent[]>(
      `/api/chatwoot-agents/inboxes/${inboxId}/members`,
      { user_ids: userIds },
    )
  },
}
