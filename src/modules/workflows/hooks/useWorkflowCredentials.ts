// src/modules/workflows/hooks/useWorkflowCredentials.ts
"use client"

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { workflowService } from '@/modules/workflows/services/workflow-service'
import { useApiError } from '@/shared/hooks/useApiError'
import type { WorkflowCredentials } from '@/modules/workflows/types/workflow-types'

export function useWorkflowCredentials(workflowId: string) {
  const queryClient = useQueryClient()
  const { handleError } = useApiError()
  const [isValidating, setIsValidating] = useState(false)

  const { data: credentials } = useQuery({
    queryKey: ['workflow-credentials', workflowId],
    queryFn: async () => {
      const creds = await workflowService.getCredentials(workflowId)
      return creds
    },
    staleTime: 10 * 60 * 1000,
  })

  const { mutate: updateCredential, isPending: isUpdating } = useMutation({
    mutationFn: async (newCreds: WorkflowCredentials) => {
      await workflowService.updateCredentials(workflowId, newCreds)
      return newCreds
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-credentials', workflowId] })
      toast.success('Credenciales actualizadas correctamente')
    },
    onError: (error: Error) => {
      handleError(error, {
        showToast: true,
        fallbackMessage: 'Error al actualizar credenciales',
      })
    },
  })

  const validateCredential = async (type: 'whatsapp' | 'openai' | 'anthropic', token: string) => {
    setIsValidating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      const isValid = await workflowService.validateCredential(type, token)

      if (isValid) {
        toast.success(`Token de ${type} validado correctamente`)
      } else {
        toast.error(`Token de ${type} inválido`)
      }

      return isValid
    } catch (error) {
      handleError(error, {
        showToast: true,
        fallbackMessage: `Error al validar token de ${type}`,
      })
      return false
    } finally {
      setIsValidating(false)
    }
  }

  return {
    credentials: credentials || {
      whatsapp_token: '',
      openai_api_key: '',
      anthropic_api_key: ''
    },
    updateCredential,
    validateCredential,
    isUpdating,
    isValidating,
  }
}
