import { apiClient } from '@/core/api/api-client'
import type {
  Inbox,
  CreateInboxDto,
  InboxResponse,
  InboxListResponse,
} from '../../types/nella-api'

/**
 * Servicio para gestionar Inboxes (canales de comunicación)
 */
export const inboxesService = {
  /**
   * Listar todos los inboxes
   */
  getAll: () => apiClient.get<InboxListResponse>('/inboxes'),

  /**
   * Obtener un inbox por ID
   */
  getById: (id: string) => apiClient.get<InboxResponse>(`/inboxes/${id}`),

  /**
   * Crear un nuevo inbox
   */
  create: (data: CreateInboxDto) =>
    apiClient.post<InboxResponse>('/inboxes', data),
}
