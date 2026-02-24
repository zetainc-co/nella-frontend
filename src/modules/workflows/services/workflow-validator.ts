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
