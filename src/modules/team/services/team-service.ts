import { apiClient } from '@/core/api/api-client'
import type { Agent, CreateAgentDto, UpdateAgentDto, Inbox } from '../types/team-types'

export const teamService = {
  /**
   * List all agents (users with role='agent')
   */
  async listAgents(): Promise<Agent[]> {
    return apiClient.get<Agent[]>('/users?role=agent')
  },

  /**
   * List all users (any role)
   */
  async listUsers(role?: string): Promise<Agent[]> {
    const queryParam = role ? `?role=${role}` : ''
    return apiClient.get<Agent[]>(`/users${queryParam}`)
  },

  /**
   * Create a new agent/user
   */
  async createAgent(data: CreateAgentDto): Promise<Agent> {
    return apiClient.post<Agent>('/users', data)
  },

  /**
   * Update an agent/user
   */
  async updateAgent(userId: string, data: UpdateAgentDto): Promise<Agent> {
    return apiClient.patch<Agent>(`/users/${userId}`, data)
  },

  /**
   * Delete an agent/user
   */
  async deleteAgent(userId: string): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}`)
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
