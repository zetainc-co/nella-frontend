'use client'
import { Search } from 'lucide-react'
import { ConversationItem } from './conversation-item'
import { ConversationTabs } from './conversation-tabs'
import type { ConversationListProps } from '../../types'

export function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-[#9EFF00]/20 border-t-[#9EFF00] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#151515]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f0f4ff]">Inbox</h2>
        </div>
      </div>

      {/* Tabs */}
      <ConversationTabs />

      {/* Search bar */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f0f4ff]/40" />
          <input
            type="text"
            placeholder="Buscar conversación..."
            className="
              w-full pl-9 pr-4 py-2
              bg-[#0a0a0a]
              border border-white/[0.06]
              rounded-lg
              text-sm text-[#f0f4ff]
              placeholder:text-[#f0f4ff]/30
              focus:outline-none focus:border-[#9EFF00]/30
              transition-colors
            "
          />
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <p className="text-sm text-[#f0f4ff]/40">
              No hay conversaciones
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                onClick={() => onSelect(conversation.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
