'use client'
import { memo, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import type { ConversationItemProps } from '../../types'
import { formatRelativeTime } from '@shared/utils/format-relative-time'
import { getInitials } from '@shared/utils/get-initials'
import { ConversationContextMenu } from './conversation-context-menu'

function ConversationItemComponent({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const { meta, agentMode, lastMessage, last_message_at } = conversation
  // unread_count no está implementado aún en Nella - podría venir de metadata
  const unread_count = conversation.metadata?.unread_count as number || 0
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

  // Si no hay meta, no renderizar nada
  if (!meta?.sender) return null

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setMenuPosition({ x: e.clientX, y: e.clientY })
    setMenuOpen(true)
  }

  const handleMenuButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent conversation selection
    const rect = e.currentTarget.getBoundingClientRect()
    setMenuPosition({ x: rect.left, y: rect.bottom })
    setMenuOpen(true)
  }

  return (
    <div
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={`
        w-full px-4 py-3
        flex items-start gap-3
        hover:bg-white/[0.03]
        transition-colors
        cursor-pointer
        ${isSelected ? 'bg-white/[0.06]' : ''}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="
          w-10 h-10
          rounded-full
          bg-[#2a2a2a]
          flex items-center justify-center
          text-[#f0f4ff]/70
          text-sm font-medium
        ">
          {getInitials(meta.sender.name)}
        </div>

        {/* Unread badge */}
        {unread_count > 0 && (
          <div className="
            absolute -top-1 -right-1
            w-5 h-5
            bg-[#9EFF00]
            rounded-full
            flex items-center justify-center
            text-[10px] font-bold text-[#0a0a0a]
          ">
            {unread_count > 99 ? '99+' : unread_count}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-[#f0f4ff] truncate">
            {meta.sender.name}
          </h3>
          <span className="text-xs text-[#f0f4ff]/40 flex-shrink-0">
            {last_message_at ? formatRelativeTime(last_message_at) : ''}
          </span>
        </div>

        <p className="text-sm text-[#f0f4ff]/60 truncate mb-2 text-start">
          {lastMessage || meta.sender.phone_number || 'Sin mensajes'}
        </p>

        {/* Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
          {agentMode === 'ai' ? (
            <span className="
              inline-flex items-center gap-1.5
              px-2 py-0.5
              text-xs font-medium
              bg-[#8b5cf6]/20
              text-[#c4b5fd]
              rounded
            ">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 7H7v6h6V7z" />
                <path fillRule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clipRule="evenodd" />
              </svg>
              IA Activa
            </span>
          ) : (
            <span className="
              inline-flex items-center gap-1.5
              px-2 py-0.5
              text-xs font-medium
              bg-[#9EFF00]/20
              text-[#9EFF00]
              rounded
            ">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Humano
            </span>
          )}
          </div>

          {/* 3-dots menu button */}
          <button
            onClick={handleMenuButtonClick}
            className="
              ml-auto p-2 rounded
              text-[#f0f4ff]/40 hover:text-[#f0f4ff]
              hover:bg-white/[0.05]
              transition-colors
            "
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context menu */}
      {menuOpen && (
        <ConversationContextMenu
          conversationId={conversation.id}
          position={menuPosition}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  )
}

export const ConversationItem = memo(ConversationItemComponent)
