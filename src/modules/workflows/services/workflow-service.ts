// src/lib/workflows/workflow-service.ts
import { workflowStorage } from './workflow-storage'
import { workflowTemplate } from './workflow-template'
import { workflowValidator } from './workflow-validator'
import type {
  TenantWorkflowConfig,
  WorkflowConfigUpdate,
  WorkflowCredentials,
  CreateWorkflowParams,
} from '@/modules/workflows/types/workflow-types'

/**
 * Servicio que simula la API de N8n
 *
 * ⚡ PUNTO DE INTEGRACIÓN FUTURA:
 * Reemplazar las funciones de este archivo con llamadas a /api/workflows/*
 */
class WorkflowService {
  async getWorkflowByTenant(tenantId: string): Promise<TenantWorkflowConfig> {
    await this.simulateNetworkDelay()

    const workflow = await workflowStorage.getByTenantId(tenantId)

    if (!workflow) {
      throw new Error('Workflow not found for tenant')
    }

    return workflow
  }

  async createWorkflowForTenant(params: CreateWorkflowParams): Promise<TenantWorkflowConfig> {
    await this.simulateNetworkDelay(1200)

    const template = await workflowTemplate.getBase()

    const n8nWorkflowId = `wf_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const workflowConfig: TenantWorkflowConfig = {
      id: crypto.randomUUID(),
      tenant_id: params.tenant_id,
      n8n_workflow_id: n8nWorkflowId,
      workflow_name: `WhatsApp Automation - ${params.tenant_id}`,
      status: 'active',
      template_version: template.version,
      config: {
        ai_model: 'gpt-4',
        prompts: {
          profiler: workflowTemplate.defaultPrompts.profiler,
          strategist: workflowTemplate.defaultPrompts.strategist,
          mirror: workflowTemplate.defaultPrompts.mirror,
        },
        business_settings: {
          response_delay: 2,
          max_retries: 3,
          office_hours: {
            enabled: false,
            start: '09:00',
            end: '18:00',
            timezone: 'America/Bogota',
          },
        },
      },
      credentials: {
        whatsapp_token: params.whatsapp_token,
        openai_api_key: '',
        anthropic_api_key: '',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      execution_count: 0,
    }

    const validation = workflowValidator.validateConfig(workflowConfig.config)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    await workflowStorage.save(workflowConfig)

    return workflowConfig
  }

  async updateWorkflowConfig(
    workflowId: string,
    config: WorkflowConfigUpdate
  ): Promise<TenantWorkflowConfig> {
    await this.simulateNetworkDelay(600)

    const workflow = await workflowStorage.getById(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const updatedConfig = {
      ...workflow.config,
      ...config,
      prompts: config.prompts
        ? { ...workflow.config.prompts, ...config.prompts }
        : workflow.config.prompts,
      business_settings: config.business_settings
        ? { ...workflow.config.business_settings, ...config.business_settings }
        : workflow.config.business_settings,
    }

    const validation = workflowValidator.validateConfig(updatedConfig)
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    const updated: TenantWorkflowConfig = {
      ...workflow,
      config: updatedConfig,
      updated_at: new Date().toISOString(),
    }

    await workflowStorage.update(workflowId, updated)

    return updated
  }

  async getCredentials(workflowId: string): Promise<WorkflowCredentials> {
    await this.simulateNetworkDelay(400)

    const workflow = await workflowStorage.getById(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    return this.decryptCredentials(workflow.credentials)
  }

  async updateCredentials(
    workflowId: string,
    credentials: WorkflowCredentials
  ): Promise<void> {
    await this.simulateNetworkDelay(700)

    const workflow = await workflowStorage.getById(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const encrypted = this.encryptCredentials(credentials)

    const updated: TenantWorkflowConfig = {
      ...workflow,
      credentials: encrypted,
      updated_at: new Date().toISOString(),
    }

    await workflowStorage.update(workflowId, updated)
  }

  async validateCredential(
    type: 'whatsapp' | 'openai' | 'anthropic',
    token: string
  ): Promise<boolean> {
    await this.simulateNetworkDelay(1500)

    const validators: Record<string, (t: string) => boolean> = {
      whatsapp: (t) => t.startsWith('EAA') && t.length > 100,
      openai: (t) => t.startsWith('sk-') && t.length > 40,
      anthropic: (t) => t.startsWith('sk-ant-') && t.length > 40,
    }

    const isValid = validators[type]?.(token) || false

    if (!isValid && process.env.NODE_ENV === 'development') {
      console.error(`[MOCK] ${type} token inválido`)
    }

    return isValid
  }

  async getBaseTemplate() {
    await this.simulateNetworkDelay(500)
    return await workflowTemplate.getBase()
  }

  async toggleWorkflowStatus(workflowId: string, status: 'active' | 'inactive'): Promise<void> {
    await this.simulateNetworkDelay(600)

    const workflow = await workflowStorage.getById(workflowId)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const updated: TenantWorkflowConfig = {
      ...workflow,
      status,
      updated_at: new Date().toISOString(),
    }

    await workflowStorage.update(workflowId, updated)
  }

  private async simulateNetworkDelay(ms: number = 500): Promise<void> {
    const delay = ms + Math.random() * 300
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  private encryptCredentials(creds: WorkflowCredentials): WorkflowCredentials {
    return {
      whatsapp_token: btoa(creds.whatsapp_token),
      openai_api_key: creds.openai_api_key ? btoa(creds.openai_api_key) : undefined,
      anthropic_api_key: creds.anthropic_api_key ? btoa(creds.anthropic_api_key) : undefined,
    }
  }

  private decryptCredentials(creds: WorkflowCredentials): WorkflowCredentials {
    try {
      return {
        whatsapp_token: atob(creds.whatsapp_token),
        openai_api_key: creds.openai_api_key ? atob(creds.openai_api_key) : undefined,
        anthropic_api_key: creds.anthropic_api_key ? atob(creds.anthropic_api_key) : undefined,
      }
    } catch {
      return creds
    }
  }
}

export const workflowService = new WorkflowService()
