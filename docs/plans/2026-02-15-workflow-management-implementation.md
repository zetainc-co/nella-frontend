# Workflow Management Multi-Tenant Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete workflow management system for multi-tenant N8n automation with mock API, credential management, and automatic workflow creation on user registration.

**Architecture:** Multi-Layer with Stratified Mocking - UI components consume React Query hooks, which call a mock service layer that wraps localStorage. This makes future API integration trivial (only replace service layer).

**Tech Stack:** Next.js 16 App Router, TypeScript, React Query, Tailwind CSS 4, localStorage (mock DB), Sonner (toasts)

---

## Task 1: Setup Base Structure & Types

**Files:**
- Create: `src/lib/workflows/workflow-types.ts`
- Create: `src/app/(dashboard)/workflows/.gitkeep`
- Create: `src/components/workflows/.gitkeep`

**Step 1: Create workflows directory structure**

Run: `mkdir -p src/lib/workflows src/app/\(dashboard\)/workflows src/components/workflows src/hooks`

Expected: Directories created

**Step 2: Create TypeScript types**

Create `src/lib/workflows/workflow-types.ts`:

```typescript
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
```

**Step 3: Verify file compiles**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 4: Commit**

```bash
git add src/lib/workflows/workflow-types.ts src/app/\(dashboard\)/workflows/.gitkeep src/components/workflows/.gitkeep
git commit -m "feat|workflow|setup base structure and types

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Workflow Storage Layer

**Files:**
- Create: `src/lib/workflows/workflow-storage.ts`

**Step 1: Create localStorage wrapper**

Create `src/lib/workflows/workflow-storage.ts`:

```typescript
// src/lib/workflows/workflow-storage.ts
import type { TenantWorkflowConfig } from './workflow-types'

const STORAGE_KEY = 'nella_workflow_configs'

class WorkflowStorage {
  private getAll(): TenantWorkflowConfig[] {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private setAll(workflows: TenantWorkflowConfig[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows))
  }

  async getById(id: string): Promise<TenantWorkflowConfig | null> {
    const workflows = this.getAll()
    return workflows.find((w) => w.id === id) || null
  }

  async getByTenantId(tenantId: string): Promise<TenantWorkflowConfig | null> {
    const workflows = this.getAll()
    return workflows.find((w) => w.tenant_id === tenantId) || null
  }

  async save(workflow: TenantWorkflowConfig): Promise<void> {
    const workflows = this.getAll()

    const exists = workflows.some((w) => w.tenant_id === workflow.tenant_id)
    if (exists) {
      throw new Error('Workflow already exists for this tenant')
    }

    workflows.push(workflow)
    this.setAll(workflows)
  }

  async update(id: string, workflow: TenantWorkflowConfig): Promise<void> {
    const workflows = this.getAll()
    const index = workflows.findIndex((w) => w.id === id)

    if (index === -1) {
      throw new Error('Workflow not found')
    }

    workflows[index] = workflow
    this.setAll(workflows)
  }

  async delete(id: string): Promise<void> {
    const workflows = this.getAll()
    const filtered = workflows.filter((w) => w.id !== id)
    this.setAll(filtered)
  }

  async incrementExecutionCount(id: string): Promise<void> {
    const workflow = await this.getById(id)
    if (!workflow) {
      throw new Error('Workflow not found')
    }

    const updated: TenantWorkflowConfig = {
      ...workflow,
      execution_count: workflow.execution_count + 1,
      last_executed_at: new Date().toISOString(),
    }

    await this.update(id, updated)
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export const workflowStorage = new WorkflowStorage()
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/workflows/workflow-storage.ts
git commit -m "feat|workflow|add localStorage wrapper for workflow storage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Workflow Template Manager

**Files:**
- Create: `src/lib/workflows/workflow-template.ts`

**Step 1: Create template manager**

Create `src/lib/workflows/workflow-template.ts`:

```typescript
// src/lib/workflows/workflow-template.ts
import type { WorkflowTemplate } from './workflow-types'

class WorkflowTemplateManager {
  async getBase(): Promise<WorkflowTemplate> {
    const templateJson = await this.loadWorkerTemplate()

    return {
      id: 'base-whatsapp-workflow',
      name: 'WhatsApp Automation Base Template',
      description: 'Template base para automatización de WhatsApp con IA',
      version: 'v1.0.0',
      workflow_json: templateJson,
      editable_params: [
        'config.ai_model',
        'config.prompts.profiler',
        'config.prompts.strategist',
        'config.prompts.mirror',
        'config.business_settings.response_delay',
        'config.business_settings.max_retries',
        'config.business_settings.office_hours',
      ],
    }
  }

  private async loadWorkerTemplate(): Promise<any> {
    // Mock simplificado del template M1.B - Worker
    return {
      name: 'WhatsApp Worker',
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook WhatsApp',
          type: 'n8n-nodes-base.webhook',
          position: [250, 300],
        },
        {
          id: 'profiler',
          name: 'The Profiler',
          type: 'n8n-nodes-base.openAi',
          position: [450, 300],
          parameters: {
            model: '{{ $json.config.ai_model }}',
            prompt: '{{ $json.config.prompts.profiler }}',
          },
        },
        {
          id: 'strategist',
          name: 'The Strategist',
          type: 'n8n-nodes-base.openAi',
          position: [650, 300],
          parameters: {
            model: '{{ $json.config.ai_model }}',
            prompt: '{{ $json.config.prompts.strategist }}',
          },
        },
        {
          id: 'mirror',
          name: 'The Mirror',
          type: 'n8n-nodes-base.openAi',
          position: [850, 300],
          parameters: {
            model: '{{ $json.config.ai_model }}',
            prompt: '{{ $json.config.prompts.mirror }}',
          },
        },
        {
          id: 'send-whatsapp',
          name: 'Enviar WhatsApp',
          type: 'n8n-nodes-base.whatsApp',
          position: [1050, 300],
        },
      ],
      connections: {
        webhook: { main: [[{ node: 'profiler', type: 'main', index: 0 }]] },
        profiler: { main: [[{ node: 'strategist', type: 'main', index: 0 }]] },
        strategist: { main: [[{ node: 'mirror', type: 'main', index: 0 }]] },
        mirror: { main: [[{ node: 'send-whatsapp', type: 'main', index: 0 }]] },
      },
    }
  }

  get defaultPrompts() {
    return {
      profiler: `Eres un experto en análisis de clientes. Tu tarea es extraer información clave del mensaje del cliente:
- Necesidad principal
- Presupuesto estimado
- Urgencia
- Puntos de dolor

Analiza el siguiente mensaje y extrae estos datos en formato JSON.`,

      strategist: `Eres un estratega de ventas experto. Basándote en el perfil del cliente, diseña una estrategia de venta que:
- Aborde sus necesidades específicas
- Se ajuste a su presupuesto
- Genere urgencia apropiada
- Ofrezca valor claro

Genera una estrategia de venta en formato JSON.`,

      mirror: `Eres un asistente de ventas conversacional. Genera una respuesta natural y personalizada basada en:
- El perfil del cliente
- La estrategia de venta
- El contexto de la conversación

Responde de forma amigable, profesional y persuasiva. Máximo 2-3 párrafos.`,
    }
  }
}

export const workflowTemplate = new WorkflowTemplateManager()
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/workflows/workflow-template.ts
git commit -m "feat|workflow|add workflow template manager with mock N8n template

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Workflow Validator

**Files:**
- Create: `src/lib/workflows/workflow-validator.ts`

**Step 1: Create validator**

Create `src/lib/workflows/workflow-validator.ts`:

```typescript
// src/lib/workflows/workflow-validator.ts
import type { WorkflowConfig, WorkflowCredentials } from './workflow-types'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

class WorkflowValidator {
  validateConfig(config: WorkflowConfig): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Validar modelo de IA
    if (!this.isValidAIModel(config.ai_model)) {
      errors.push(`Modelo de IA no válido: ${config.ai_model}`)
    }

    // Validar prompts
    if (!config.prompts.profiler || config.prompts.profiler.trim().length < 10) {
      errors.push('Prompt del Profiler es requerido (mínimo 10 caracteres)')
    }

    if (!config.prompts.strategist || config.prompts.strategist.trim().length < 10) {
      errors.push('Prompt del Strategist es requerido (mínimo 10 caracteres)')
    }

    if (!config.prompts.mirror || config.prompts.mirror.trim().length < 10) {
      errors.push('Prompt del Mirror es requerido (mínimo 10 caracteres)')
    }

    // Validar prompts muy largos
    if (config.prompts.profiler.length > 5000) {
      warnings.push('Prompt del Profiler muy largo (>5000 chars). Puede afectar performance.')
    }

    // Validar business settings
    if (config.business_settings.response_delay < 0 || config.business_settings.response_delay > 60) {
      errors.push('Response delay debe estar entre 0 y 60 segundos')
    }

    if (config.business_settings.max_retries < 1 || config.business_settings.max_retries > 10) {
      errors.push('Max retries debe estar entre 1 y 10')
    }

    // Validar office hours
    if (config.business_settings.office_hours.enabled) {
      const startValid = this.isValidTime(config.business_settings.office_hours.start)
      const endValid = this.isValidTime(config.business_settings.office_hours.end)

      if (!startValid || !endValid) {
        errors.push('Horarios de oficina inválidos (formato HH:MM)')
      }

      if (startValid && endValid) {
        const start = this.timeToMinutes(config.business_settings.office_hours.start)
        const end = this.timeToMinutes(config.business_settings.office_hours.end)

        if (start >= end) {
          errors.push('Hora de inicio debe ser antes que hora de fin')
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  validateCredentials(credentials: WorkflowCredentials): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!credentials.whatsapp_token || credentials.whatsapp_token.trim().length === 0) {
      errors.push('WhatsApp token es requerido')
    } else if (!credentials.whatsapp_token.startsWith('EAA')) {
      warnings.push('WhatsApp token no parece tener el formato correcto (debería empezar con EAA)')
    } else if (credentials.whatsapp_token.length < 100) {
      warnings.push('WhatsApp token parece muy corto')
    }

    if (credentials.openai_api_key && credentials.openai_api_key.length > 0) {
      if (!credentials.openai_api_key.startsWith('sk-')) {
        warnings.push('OpenAI API key debería empezar con "sk-"')
      }
    }

    if (credentials.anthropic_api_key && credentials.anthropic_api_key.length > 0) {
      if (!credentials.anthropic_api_key.startsWith('sk-ant-')) {
        warnings.push('Anthropic API key debería empezar con "sk-ant-"')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  private isValidAIModel(model: string): boolean {
    const validModels = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo',
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku',
    ]
    return validModels.includes(model)
  }

  private isValidTime(time: string): boolean {
    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
}

export const workflowValidator = new WorkflowValidator()
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/workflows/workflow-validator.ts
git commit -m "feat|workflow|add workflow configuration and credentials validator

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Workflow Service (Mock N8n API)

**Files:**
- Create: `src/lib/workflows/workflow-service.ts`

**Step 1: Create service mock (Part 1 - Class structure and helpers)**

Create `src/lib/workflows/workflow-service.ts`:

```typescript
// src/lib/workflows/workflow-service.ts
import { workflowStorage } from './workflow-storage'
import { workflowTemplate } from './workflow-template'
import { workflowValidator } from './workflow-validator'
import type {
  TenantWorkflowConfig,
  WorkflowConfigUpdate,
  WorkflowCredentials,
  CreateWorkflowParams,
} from './workflow-types'

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

    console.log(`[MOCK] Workflow creado en N8n: ${n8nWorkflowId}`)

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

    console.log(`[MOCK] Workflow actualizado en N8n: ${workflow.n8n_workflow_id}`)

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

    console.log(`[MOCK] Credenciales actualizadas en N8n`)
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

    if (isValid) {
      console.log(`[MOCK] ${type} token validado exitosamente`)
    } else {
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

    console.log(`[MOCK] Workflow ${status === 'active' ? 'activado' : 'desactivado'} en N8n`)
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
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/workflows/workflow-service.ts
git commit -m "feat|workflow|add workflow service mock (N8n API simulation)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: React Query Hooks - useWorkflow

**Files:**
- Create: `src/hooks/useWorkflow.ts`

**Step 1: Create main workflow hook**

Create `src/hooks/useWorkflow.ts`:

```typescript
// src/hooks/useWorkflow.ts
"use client"

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workflowService } from '@/lib/workflows/workflow-service'
import type { TenantWorkflowConfig, WorkflowConfigUpdate } from '@/lib/workflows/workflow-types'

function getTenantId(): string {
  if (typeof window === 'undefined') return ''
  const session = JSON.parse(localStorage.getItem('nella_session') || '{}')
  return session.tenantId || ''
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
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/hooks/useWorkflow.ts
git commit -m "feat|workflow|add React Query hooks for workflow management

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: React Query Hooks - useWorkflowCredentials

**Files:**
- Create: `src/hooks/useWorkflowCredentials.ts`

**Step 1: Create credentials hook**

Create `src/hooks/useWorkflowCredentials.ts`:

```typescript
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
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/hooks/useWorkflowCredentials.ts
git commit -m "feat|workflow|add credentials management hook

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: HUD Corners Reusable Component

**Files:**
- Create: `src/components/ui/hud-corners.tsx`

**Step 1: Extract HUD corners as reusable component**

Create `src/components/ui/hud-corners.tsx`:

```typescript
// src/components/ui/hud-corners.tsx
export function HudCorners() {
  return (
    <>
      {/* Top-left */}
      <div className="absolute top-0 left-0 w-6 h-6 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary/60 to-transparent" />
      </div>

      {/* Top-right */}
      <div className="absolute top-0 right-0 w-6 h-6 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-primary/60 to-transparent" />
      </div>

      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-primary/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-px h-full bg-gradient-to-t from-primary/60 to-transparent" />
      </div>

      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-primary/60 to-transparent" />
        <div className="absolute bottom-0 right-0 w-px h-full bg-gradient-to-t from-primary/60 to-transparent" />
      </div>
    </>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ui/hud-corners.tsx
git commit -m "feat|ui|add reusable HUD corners component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Workflow Status Badge Component

**Files:**
- Create: `src/components/workflows/workflow-status-badge.tsx`

**Step 1: Create status badge**

Create `src/components/workflows/workflow-status-badge.tsx`:

```typescript
// src/components/workflows/workflow-status-badge.tsx
interface WorkflowStatusBadgeProps {
  status?: 'active' | 'inactive'
}

export function WorkflowStatusBadge({ status = 'active' }: WorkflowStatusBadgeProps) {
  return (
    <span className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium
      ${status === 'active'
        ? 'bg-green-500/10 text-green-600 border border-green-500/30'
        : 'bg-gray-500/10 text-gray-600 border border-gray-500/30'
      }
    `}>
      <span className={`size-2 rounded-full ${status === 'active' ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`} />
      {status === 'active' ? 'Activo' : 'Inactivo'}
    </span>
  )
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`

Expected: No errors

**Step 3: Commit**

```bash
git add src/components/workflows/workflow-status-badge.tsx
git commit -m "feat|workflow|add workflow status badge component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

*Due to length constraints, I'll create a summary of the remaining tasks. The full plan would continue with similar bite-sized tasks for:*

- **Task 10-15:** Remaining workflow components (node visualizer, error boundary, tabs container, overview, config editor, credentials manager)
- **Task 16:** Main workflows page
- **Task 17-20:** Wizard registration improvements (wizard container, stepper, step 4, email verification)
- **Task 21:** Update registration hook with workflow creation
- **Task 22:** Global styles
- **Task 23:** Manual testing

Would you like me to continue with the complete detailed plan, or should we proceed with execution using this abbreviated version?

---

## Execution Handoff

Plan saved to `docs/plans/2026-02-15-workflow-management-implementation.md`.

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach would you prefer?**
