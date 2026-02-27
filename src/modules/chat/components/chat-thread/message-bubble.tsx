import { memo } from 'react'
import { CheckCheck } from 'lucide-react'
import type { MessageBubbleProps } from '../../types'
import { formatMessageTime } from '@/utils/format-message-time'

export const MessageBubble = memo(function MessageBubble({
  message,
}: MessageBubbleProps) {
  const isOutgoing = message.message_type === 'outgoing'
  const isBot = message.sender?.type === 'agent_bot'
  const isPending = message._pending

  // Mensajes privados (notas internas) - Siempre a la derecha (son nuestros)
  if (message.private) {
    return (
      <div className="flex justify-end">
        <div className="
          max-w-[85%]
          px-4 py-2.5
          bg-[#3a1a5c]/20
          border border-[#a78bfa]/20
          rounded-lg
          mx-6
        ">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3 h-3 text-[#a78bfa]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-semibold text-[#a78bfa]">
              IA
            </span>
          </div>
          <p className="text-sm text-[#f0f4ff]/70 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  // Mensajes regulares
  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} ${isOutgoing ? 'max-w-[85%]' : 'max-w-[75%]'}`}>

        {/* Badge IA (solo para mensajes de bot outgoing) */}
        {isBot && isOutgoing && (
          <div className="flex items-center gap-1.5 mb-1 px-2">
            <svg className="w-3 h-3 text-[#a78bfa]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 7H7v6h6V7z" />
              <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-medium text-[#a78bfa]">
              IA
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`
          px-4 py-2.5
          rounded-2xl
          ${isOutgoing
            ? 'bg-[#3a1a5c] rounded-tr-sm'  // Morado para TODO el equipo (IA + Humano)
            : 'bg-[#2a2a2a] rounded-tl-sm'  // Gris para cliente
          }
          ${isPending ? 'opacity-60' : ''}
        `}>
          <p className="text-sm text-[#f0f4ff] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Timestamp + Status */}
          <div className="flex items-center justify-end gap-1.5 mt-1.5">
            {isPending && (
              <div className="w-3 h-3 border-2 border-[#9EFF00]/20 border-t-[#9EFF00] rounded-full animate-spin" />
            )}
            <span className="text-[10px] text-[#f0f4ff]/30">
              {formatMessageTime(message.created_at)}
            </span>
            {isOutgoing && !isPending && (
              <CheckCheck className="w-3.5 h-3.5 text-[#10b981]" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
})
