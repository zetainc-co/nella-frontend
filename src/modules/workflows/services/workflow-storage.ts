// src/lib/workflows/workflow-storage.ts
import type { TenantWorkflowConfig } from '@/modules/workflows/types/workflow-types'

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
