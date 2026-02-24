// src/components/workflows/workflow-credentials-manager.tsx
"use client"

import { useState, useEffect } from 'react'
import { useWorkflowCredentials } from '@/hooks/useWorkflowCredentials'
import { HudCorners } from '@/components/ui/hud-corners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Shield,
  Key,
  AlertCircle
} from 'lucide-react'
import type { WorkflowCredentials } from '@/lib/workflows/workflow-types'

interface WorkflowCredentialsManagerProps {
  workflowId: string
  tenantId: string
}

interface ValidationState {
  whatsapp: boolean | null
  openai: boolean | null
  anthropic: boolean | null
}

export function WorkflowCredentialsManager({
  workflowId,
  tenantId
}: WorkflowCredentialsManagerProps) {
  const {
    credentials,
    updateCredential,
    validateCredential,
    isUpdating,
    isValidating
  } = useWorkflowCredentials(workflowId)

  // Local state for form inputs
  const [formData, setFormData] = useState<WorkflowCredentials>({
    whatsapp_token: '',
    openai_api_key: '',
    anthropic_api_key: ''
  })

  // Visibility toggles for each token
  const [visibility, setVisibility] = useState({
    whatsapp: false,
    openai: false,
    anthropic: false
  })

  // Validation states
  const [validationState, setValidationState] = useState<ValidationState>({
    whatsapp: null,
    openai: null,
    anthropic: null
  })

  // Validating per credential
  const [validatingField, setValidatingField] = useState<string | null>(null)

  // Sync credentials to form data (only on initial load or when credentials actually change)
  useEffect(() => {
    if (credentials) {
      setFormData(prev => {
        // Only update if values actually changed
        const newWhatsapp = credentials.whatsapp_token || ''
        const newOpenAI = credentials.openai_api_key || ''
        const newAnthropic = credentials.anthropic_api_key || ''

        if (
          prev.whatsapp_token !== newWhatsapp ||
          prev.openai_api_key !== newOpenAI ||
          prev.anthropic_api_key !== newAnthropic
        ) {
          return {
            whatsapp_token: newWhatsapp,
            openai_api_key: newOpenAI,
            anthropic_api_key: newAnthropic
          }
        }
        return prev
      })
    }
  }, [credentials?.whatsapp_token, credentials?.openai_api_key, credentials?.anthropic_api_key])

  // Handle input changes
  const handleInputChange = (field: keyof WorkflowCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Reset validation state when user edits
    const validationKey = field.replace('_token', '').replace('_api_key', '') as keyof ValidationState
    setValidationState(prev => ({ ...prev, [validationKey]: null }))
  }

  // Validate a specific credential
  const handleValidate = async (type: 'whatsapp' | 'openai' | 'anthropic') => {
    const tokenMap: Record<string, string> = {
      whatsapp: formData.whatsapp_token,
      openai: formData.openai_api_key || '',
      anthropic: formData.anthropic_api_key || ''
    }

    const token = tokenMap[type]

    if (!token || token.trim() === '') {
      setValidationState(prev => ({ ...prev, [type]: false }))
      return
    }

    setValidatingField(type)

    try {
      const isValid = await validateCredential(type, token)
      setValidationState(prev => ({ ...prev, [type]: isValid }))
    } catch (error) {
      console.error(`Error validating ${type}:`, error)
      setValidationState(prev => ({ ...prev, [type]: false }))
    } finally {
      setValidatingField(null)
    }
  }

  // Save all credentials
  const handleSave = () => {
    updateCredential(formData)
  }

  // Toggle visibility
  const toggleVisibility = (field: 'whatsapp' | 'openai' | 'anthropic') => {
    setVisibility(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Get naming convention display
  const getNamingConvention = (type: string) => {
    return `${type}-tenant-${tenantId}`
  }

  // Check if form has unsaved changes
  const hasChanges = () => {
    if (!credentials) return false
    return (
      formData.whatsapp_token !== (credentials.whatsapp_token || '') ||
      formData.openai_api_key !== (credentials.openai_api_key || '') ||
      formData.anthropic_api_key !== (credentials.anthropic_api_key || '')
    )
  }

  const isDisabled = isUpdating || isValidating

  return (
    <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
      <HudCorners />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <div>
          <h3 className="text-lg font-bold text-white">Gestión de Credenciales</h3>
          <p className="text-sm text-gray-400">
            Configuración de credenciales por tenant (cifrado en Supabase Vault)
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mb-6 flex items-start gap-3 rounded border border-primary/20 bg-primary/5 p-4">
        <Key className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <div className="text-sm">
          <p className="font-semibold text-white">Almacenamiento Seguro</p>
          <p className="text-gray-400">
            Las credenciales se almacenan cifradas en Supabase Vault (simulado con Base64 en MVP).
            Solo el tenant propietario puede acceder a sus credenciales.
          </p>
        </div>
      </div>

      {/* Credentials Form */}
      <div className="space-y-6">
        {/* WhatsApp Token */}
        <CredentialInput
          label="WhatsApp Business API Token"
          field="whatsapp"
          value={formData.whatsapp_token}
          onChange={(value) => handleInputChange('whatsapp_token', value)}
          onValidate={() => handleValidate('whatsapp')}
          isVisible={visibility.whatsapp}
          toggleVisibility={() => toggleVisibility('whatsapp')}
          validationState={validationState.whatsapp}
          isValidating={validatingField === 'whatsapp'}
          isDisabled={isDisabled}
          namingConvention={getNamingConvention('whatsapp')}
          placeholder="EAAG..."
          required
        />

        {/* OpenAI API Key */}
        <CredentialInput
          label="OpenAI API Key"
          field="openai"
          value={formData.openai_api_key || ''}
          onChange={(value) => handleInputChange('openai_api_key', value)}
          onValidate={() => handleValidate('openai')}
          isVisible={visibility.openai}
          toggleVisibility={() => toggleVisibility('openai')}
          validationState={validationState.openai}
          isValidating={validatingField === 'openai'}
          isDisabled={isDisabled}
          namingConvention={getNamingConvention('openai')}
          placeholder="sk-..."
        />

        {/* Anthropic API Key */}
        <CredentialInput
          label="Anthropic API Key"
          field="anthropic"
          value={formData.anthropic_api_key || ''}
          onChange={(value) => handleInputChange('anthropic_api_key', value)}
          onValidate={() => handleValidate('anthropic')}
          isVisible={visibility.anthropic}
          toggleVisibility={() => toggleVisibility('anthropic')}
          validationState={validationState.anthropic}
          isValidating={validatingField === 'anthropic'}
          isDisabled={isDisabled}
          namingConvention={getNamingConvention('anthropic')}
          placeholder="sk-ant-..."
        />
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between border-t border-primary/20 pt-6">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {hasChanges() && (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span className="text-yellow-500">Cambios sin guardar</span>
            </>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isDisabled || !hasChanges()}
          className="min-w-[120px]"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// Sub-component for credential input
interface CredentialInputProps {
  label: string
  field: string
  value: string
  onChange: (value: string) => void
  onValidate: () => void
  isVisible: boolean
  toggleVisibility: () => void
  validationState: boolean | null
  isValidating: boolean
  isDisabled: boolean
  namingConvention: string
  placeholder?: string
  required?: boolean
}

function CredentialInput({
  label,
  field,
  value,
  onChange,
  onValidate,
  isVisible,
  toggleVisibility,
  validationState,
  isValidating,
  isDisabled,
  namingConvention,
  placeholder,
  required = false
}: CredentialInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-white">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        <span className="font-mono text-xs text-gray-500">
          {namingConvention}
        </span>
      </div>

      <div className="flex gap-2">
        {/* Input with visibility toggle */}
        <div className="relative flex-1">
          <Input
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isDisabled}
            placeholder={placeholder}
            className="pr-10 font-mono text-sm"
          />
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={isDisabled}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Validate button */}
        <Button
          type="button"
          onClick={onValidate}
          disabled={isDisabled || !value.trim()}
          variant="outline"
          size="sm"
          className="min-w-[100px]"
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="text-xs">Validando</span>
            </>
          ) : (
            <span className="text-xs">Validar</span>
          )}
        </Button>

        {/* Validation status icon */}
        <div className="flex w-8 items-center justify-center">
          {validationState === true && (
            <Check className="h-5 w-5 text-green-500" />
          )}
          {validationState === false && (
            <X className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Validation feedback */}
      {validationState !== null && (
        <p className={`text-xs ${validationState ? 'text-green-500' : 'text-red-500'}`}>
          {validationState
            ? '✓ Credencial válida'
            : '✗ Credencial inválida o sin acceso'}
        </p>
      )}
    </div>
  )
}
