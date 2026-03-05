import { apiClient } from '@/core/api/api-client'
import type {
  Label,
  CreateLabelDto,
  UpdateLabelDto,
  LabelResponse,
  LabelListResponse,
} from '../../types/nella-api'

/**
 * Servicio para gestionar Labels (etiquetas)
 */
export const labelsService = {
  /**
   * Listar todos los labels
   */
  getAll: () => apiClient.get<LabelListResponse>('/labels'),

  /**
   * Listar solo labels activos
   */
  getActive: () => apiClient.get<LabelListResponse>('/labels/active'),

  /**
   * Obtener label por ID
   */
  getById: (id: string) => apiClient.get<LabelResponse>(`/labels/${id}`),

  /**
   * Crear un nuevo label
   */
  create: (data: CreateLabelDto) =>
    apiClient.post<LabelResponse>('/labels', data),

  /**
   * Actualizar label
   */
  update: (id: string, data: UpdateLabelDto) =>
    apiClient.patch<LabelResponse>(`/labels/${id}`, data),

  /**
   * Eliminar label
   */
  delete: (id: string) =>
    apiClient.delete<{ status: number; message: string }>(`/labels/${id}`),

  /**
   * Desactivar label (soft delete)
   */
  deactivate: (id: string) =>
    apiClient.patch<LabelResponse>(`/labels/${id}`, { is_active: false }),

  /**
   * Activar label
   */
  activate: (id: string) =>
    apiClient.patch<LabelResponse>(`/labels/${id}`, { is_active: true }),
}
