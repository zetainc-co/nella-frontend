import { useState } from 'react'
import { User, MoreVertical, Loader2 } from 'lucide-react'
import type { ContactHeaderProps } from '../../types'
import { getInitials } from '@shared/utils/get-initials'
import { useAIToggle, useCurrentUserId } from '../../hooks'
import { ContactProfileDrawer } from './contact-profile-drawer'

export function ContactHeader({ conversation }: ContactHeaderProps) {
  const { meta, agentMode, id, contact_id, assigned_agent_id, metadata } = conversation
  const currentUserId = useCurrentUserId()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Get agent data from conversation metadata
  const agentName = metadata?.assigned_agent_name || null

  // Construir sender con fallback
  const sender = meta?.sender || {
    name: `Contact ${contact_id}`,
    phone_number: null,
  }

  // Hook para manejar el toggle de IA
  const { toggleAI, isLoading } = useAIToggle({
    conversationId: id,
    currentMode: agentMode,
  })

  // Obtener información adicional del contacto detectada por IA
  const getContactInfo = () => {
    // Aquí se podría obtener de custom_attributes o additional_attributes
    // que la IA ha detectado sobre el contacto
    // Por ahora, si no hay información, retornar null

    // Ejemplo de estructura esperada:
    // custom_attributes: { job_title: "Directora Comercial", company: "TechCorp SA" }

    const jobTitle = (sender as any).custom_attributes?.job_title
    const company = (sender as any).custom_attributes?.company

    if (jobTitle || company) {
      const parts = []
      if (jobTitle) parts.push(jobTitle)
      if (company) parts.push(company)
      return parts.join(' · ')
    }

    return null
  }

  const contactInfo = getContactInfo()

  return (
    <div className="px-6 py-4 border-b border-white/[0.06] bg-[#0a0a0a]">
      <div className="flex items-center justify-between">
        {/* Left: Avatar + Info */}
        <div className="flex items-center gap-3">
          <div className="
            w-11 h-11
            rounded-full
            bg-[#2a2a2a]
            flex items-center justify-center
            text-[#f0f4ff]/70
            text-sm font-medium
          ">
            {getInitials(sender.name)}
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#f0f4ff]">
              {sender.name}
            </h3>
            {contactInfo && (
              <p className="text-xs text-[#f0f4ff]/40">
                {contactInfo}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {agentMode === 'ai' ? (
            <button
              onClick={() => currentUserId && toggleAI(currentUserId)}
              disabled={isLoading || !currentUserId}
              className="
                px-4 py-2
                bg-transparent
                border border-[#ff6b35]
                hover:bg-[#ff6b35]/10
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-[#ff6b35] text-sm font-medium
                rounded-lg
                transition-colors
                flex items-center gap-2
              "
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              )}
              Detener IA
            </button>
          ) : (
            <button
              onClick={() => toggleAI()}
              disabled={isLoading}
              className="
                px-2 py-1
                bg-transparent
                border border-[#9EFF00]
                hover:bg-[#9EFF00]/10
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-[#9EFF00] text-sm font-medium
                rounded-lg
                transition-colors
                flex items-center gap-2
              "
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              Activar IA
            </button>
          )}

          <button
            onClick={() => setDrawerOpen(true)}
            className="
              w-9 h-9
              rounded-lg
              bg-white/[0.06]
              hover:bg-white/[0.1]
              flex items-center justify-center
              text-[#f0f4ff]/60
              hover:text-[#f0f4ff]
              transition-colors
            "
          >
            <User className="w-5 h-5" />
          </button>

          <button className="
            w-9 h-9
            rounded-lg
            bg-white/[0.06]
            hover:bg-white/[0.1]
            flex items-center justify-center
            text-[#f0f4ff]/60
            hover:text-[#f0f4ff]
            transition-colors
          ">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contact Profile Drawer */}
      <ContactProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        contact={contact_id ? {
          id: contact_id,
          name: metadata?.contact_name || sender.name,
          phone: metadata?.contact_phone || sender.phone_number || '',
          email: metadata?.contact_email || null,
          lead_status: metadata?.contact_lead_status || undefined,
          handoff_active: metadata?.contact_handoff_active || undefined,
          ai_summary: metadata?.contact_ai_summary || null,
          tags: metadata?.contact_tags || undefined,
          last_interaction_at: metadata?.contact_last_interaction_at || null,
          source: metadata?.contact_source || null,
          next_purchase_prediction: metadata?.contact_next_purchase_prediction || null,
        } : null}
        assignedAgentId={assigned_agent_id}
        agentName={agentName}
      />
    </div>
  )
}
