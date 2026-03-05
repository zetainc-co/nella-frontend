'use client'
import { Search, ChevronDown } from 'lucide-react'
import { ConversationItem } from './conversation-item'
import { useConversations } from '../../hooks/use-conversations'
import { useChatStore, type ConversationFilter } from '../../store/chat-store'
import { useCurrentUserId } from '../../hooks/use-current-user-id'
import type { ConversationListProps } from '../../types'

export function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const filter = useChatStore((s) => s.filter)
  const setFilter = useChatStore((s) => s.setFilter)
  const { data: allConversations } = useConversations()
  const userId = useCurrentUserId()

  // Calcular counts
  const counts = {
    mine: allConversations?.filter(c => c.meta?.assignee?.id === userId).length ?? 0,
    unassigned: allConversations?.filter(c => !c.meta?.assignee).length ?? 0,
    all: allConversations?.length ?? 0,
  }

  const filterOptions: Array<{ value: ConversationFilter; label: string; count: number }> = [
    { value: 'mine', label: 'Mías', count: counts.mine },
    { value: 'unassigned', label: 'Sin asignar', count: counts.unassigned },
    { value: 'all', label: 'Todas', count: counts.all },
  ]

  const currentFilter = filterOptions.find(opt => opt.value === filter) || filterOptions[2]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-[#9EFF00]/20 border-t-[#9EFF00] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#151515]">
      {/* Header con select */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#f0f4ff]">Inbox</h2>

          {/* Select compacto */}
          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as ConversationFilter)}
              className="
                appearance-none
                pl-3 pr-8 py-1.5
                bg-[#0a0a0a]
                border border-white/[0.06]
                rounded-lg
                text-xs font-medium text-[#f0f4ff]/80
                hover:border-[#9EFF00]/30
                focus:outline-none focus:border-[#9EFF00]/50
                transition-colors
                cursor-pointer
              "
            >
              {filterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.count})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#f0f4ff]/40 pointer-events-none" />
          </div>
        </div>
      </div>

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
