// src/lib/workflows/workflow-types.ts

export interface TenantWorkflowConfig {
  id: string
  tenant_id: string
  n8n_workflow_id: string
  workflow_name: string
  status: 'active' | 'inactive'
  template_version: string
  config: WorkflowConfig
  credentials: WorkflowCredentials
  created_at: string
  updated_at: string
  last_executed_at?: string
  execution_count: number
}

export interface WorkflowConfig {
  ai_model: string
  prompts: {
    profiler: string
    strategist: string
    mirror: string
  }
  business_settings: {
    response_delay: number
    max_retries: number
    office_hours: {
      enabled: boolean
      start: string
      end: string
      timezone: string
    }
  }
}

export interface WorkflowCredentials {
  whatsapp_token: string
  openai_api_key?: string
  anthropic_api_key?: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  version: string
  workflow_json: any
  editable_params: string[]
}

export interface CreateWorkflowParams {
  tenant_id: string
  whatsapp_number: string
  whatsapp_token: string
}

export type WorkflowConfigUpdate = Partial<WorkflowConfig>
