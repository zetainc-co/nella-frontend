// src/hooks/useWorkflowCredentials.ts
"use client"

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workflowService } from '@/lib/workflows/workflow-service'
import type { WorkflowCredentials } from '@/lib/workflows/workflow-types'

export function useWorkflowCredentials(workflowId: string) {
  const queryClient = useQueryClient()
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
      console.log('✅ Credenciales actualizadas')
    },
    onError: (error) => {
      console.error('❌ Error al actualizar credenciales:', error)
    }
  })

  const validateCredential = async (type: 'whatsapp' | 'openai' | 'anthropic', token: string) => {
    setIsValidating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const isValid = await workflowService.validateCredential(type, token)

      if (isValid) {
        console.log(`✅ ${type} token válido`)
      } else {
        console.error(`❌ ${type} token inválido`)
      }

      return isValid
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
