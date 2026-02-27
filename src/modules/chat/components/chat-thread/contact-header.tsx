import { User, MoreVertical } from 'lucide-react'
import type { ContactHeaderProps } from '../../types'
import { getInitials } from '@/utils/get-initials'

export function ContactHeader({ conversation }: ContactHeaderProps) {
  const { meta, agentMode } = conversation
  const sender = meta.sender

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
          {agentMode === 'ai' && (
            <button className="
              px-4 py-2
              bg-[#ff6b35]
              hover:bg-[#ff5722]
              text-white text-sm font-medium
              rounded-lg
              transition-colors
              flex items-center gap-2
            ">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              Detener IA
            </button>
          )}

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
    </div>
  )
}
