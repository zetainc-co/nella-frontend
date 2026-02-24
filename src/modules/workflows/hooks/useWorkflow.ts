// src/modules/workflows/hooks/useWorkflow.ts
"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workflowService } from '@/modules/workflows/services/workflow-service'
import { useAuthStore } from '@/core/store/auth-store'
import type { TenantWorkflowConfig, WorkflowConfigUpdate } from '@/modules/workflows/types/workflow-types'

function getTenantId(): string {
  const { session } = useAuthStore.getState()
  return session?.tenantId || ''
}

export function useWorkflow() {
  return useQuery({
    queryKey: ['workflow', getTenantId()],
    queryFn: async () => {
      const tenantId = getTenantId()
      if (!tenantId) throw new Error('No tenant ID found')

      const workflow = await workflowService.getWorkflowByTenant(tenantId)
      return workflow
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error.message.includes('not found') || error.message.includes('tenant')) {
        return false
      }
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useWorkflowUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      workflowId,
      config
    }: {
      workflowId: string
      config: WorkflowConfigUpdate
    }) => {
      const updated = await workflowService.updateWorkflowConfig(workflowId, config)
      return updated
    },

    onMutate: async ({ workflowId, config }) => {
      await queryClient.cancelQueries({ queryKey: ['workflow'] })

      const previousWorkflow = queryClient.getQueryData<TenantWorkflowConfig>(['workflow', getTenantId()])

      queryClient.setQueryData<TenantWorkflowConfig>(['workflow', getTenantId()], (old) => {
        if (!old) return old
        return {
          ...old,
          config: { ...old.config, ...config },
          updated_at: new Date().toISOString()
        }
      })

      return { previousWorkflow }
    },

    onError: (err, variables, context) => {
      if (context?.previousWorkflow) {
        queryClient.setQueryData(['workflow', getTenantId()], context.previousWorkflow)
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow', getTenantId()] })
    },
  })
}

export function useWorkflowTemplate() {
  const [isDownloading, setIsDownloading] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['workflow-template'],
    queryFn: async () => {
      const template = await workflowService.getBaseTemplate()
      return template
    },
    staleTime: Infinity,
  })

  const downloadTemplate = async (version: string) => {
    setIsDownloading(true)
    try {
      const template = await workflowService.getBaseTemplate()

      const blob = new Blob([JSON.stringify(template.workflow_json, null, 2)], {
        type: 'application/json'
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `workflow-template-${version}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading template:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return { data, isLoading, downloadTemplate, isDownloading }
}
