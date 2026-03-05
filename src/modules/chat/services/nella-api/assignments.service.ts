import { apiClient } from '@/core/api/api-client'
import type {
  Assignment,
  CreateAssignmentDto,
  AssignmentResponse,
  AssignmentListResponse,
} from '../../types/nella-api'

/**
 * Servicio para gestionar Assignments (asignaciones de agentes)
 */
export const assignmentsService = {
  /**
   * Asignar agente a conversación
   */
  create: (data: CreateAssignmentDto) =>
    apiClient.post<AssignmentResponse>('/assignments', data),

  /**
   * Asignar agente simple (helper)
   */
  assignAgent: (
    conversationId: string,
    agentId: string,
    assignedBy?: string
  ) =>
    apiClient.post<AssignmentResponse>('/assignments', {
      conversation_id: conversationId,
      agent_id: agentId,
      assigned_by: assignedBy,
    }),

  /**
   * Obtener asignaciones de una conversación
   */
  getByConversation: (conversationId: string) =>
    apiClient.get<AssignmentListResponse>(
      `/assignments?conversationId=${conversationId}`
    ),

  /**
   * Obtener asignaciones de un agente
   */
  getByAgent: (agentId: string) =>
    apiClient.get<AssignmentListResponse>(`/assignments?agentId=${agentId}`),

  /**
   * Eliminar asignación por ID
   */
  delete: (id: string) =>
    apiClient.delete<{ status: number; message: string }>(
      `/assignments/${id}`
    ),

  /**
   * Eliminar asignación específica (conversación + agente)
   */
  removeAgentFromConversation: (conversationId: string, agentId: string) =>
    apiClient.delete<{ status: number; message: string }>(
      `/assignments/conversation/${conversationId}/agent/${agentId}`
    ),
}
