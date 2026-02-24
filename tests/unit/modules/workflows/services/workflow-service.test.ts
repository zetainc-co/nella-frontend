import { describe, it, expect } from 'vitest'
import { workflowValidator } from '@/modules/workflows/services/workflow-validator'
import type { WorkflowConfig, WorkflowCredentials } from '@/modules/workflows/types/workflow-types'

describe('workflowValidator', () => {
  const validConfig: WorkflowConfig = {
    ai_model: 'gpt-4',
    prompts: {
      profiler: 'A valid profiler prompt with enough length to pass validation',
      strategist: 'A valid strategist prompt with enough length to pass validation',
      mirror: 'A valid mirror prompt with enough length to pass validation',
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
  }

  describe('validateConfig', () => {
    it('returns valid for a correct config', () => {
      const result = workflowValidator.validateConfig(validConfig)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('returns error for invalid AI model', () => {
      const config = { ...validConfig, ai_model: 'invalid-model' }
      const result = workflowValidator.validateConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Modelo de IA'))).toBe(true)
    })

    it('returns error for empty profiler prompt', () => {
      const config = {
        ...validConfig,
        prompts: { ...validConfig.prompts, profiler: '' },
      }
      const result = workflowValidator.validateConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Profiler'))).toBe(true)
    })

    it('returns error for response_delay out of range', () => {
      const config = {
        ...validConfig,
        business_settings: {
          ...validConfig.business_settings,
          response_delay: 100,
        },
      }
      const result = workflowValidator.validateConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Response delay'))).toBe(true)
    })

    it('returns error for invalid office hours when enabled', () => {
      const config = {
        ...validConfig,
        business_settings: {
          ...validConfig.business_settings,
          office_hours: {
            enabled: true,
            start: '18:00',
            end: '09:00',
            timezone: 'America/Bogota',
          },
        },
      }
      const result = workflowValidator.validateConfig(config)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('inicio'))).toBe(true)
    })
  })

  describe('validateCredentials', () => {
    it('returns valid when whatsapp_token is provided', () => {
      const creds: WorkflowCredentials = {
        whatsapp_token: 'EAAGsome_very_long_token_string_that_is_more_than_100_characters_long_to_pass_the_whatsapp_validation_check_1234567890',
      }
      const result = workflowValidator.validateCredentials(creds)
      expect(result.isValid).toBe(true)
    })

    it('returns error when whatsapp_token is empty', () => {
      const creds: WorkflowCredentials = {
        whatsapp_token: '',
      }
      const result = workflowValidator.validateCredentials(creds)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('WhatsApp token'))).toBe(true)
    })
  })
})

describe('workflow module exports', () => {
  it('exports workflowService from service module', async () => {
    const mod = await import('@/modules/workflows/services/workflow-service')
    expect(mod.workflowService).toBeDefined()
    expect(typeof mod.workflowService.getWorkflowByTenant).toBe('function')
    expect(typeof mod.workflowService.createWorkflowForTenant).toBe('function')
    expect(typeof mod.workflowService.updateWorkflowConfig).toBe('function')
  })
})
