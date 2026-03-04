'use client'
import { useChatStore } from '../../store/chat-store'
import { useConversations } from '../../hooks/use-conversations'
import { useCurrentUserId } from '../../hooks/use-current-user-id'
import type { ConversationFilter } from '../../store/chat-store'

export function ConversationTabs() {
  const filter = useChatStore((s) => s.filter)
  const setFilter = useChatStore((s) => s.setFilter)
  const { data: conversations } = useConversations()
  const userId = useCurrentUserId()

  // Calculate counts for each tab
  const counts = {
    mine: conversations?.filter(c => c.meta.assignee?.id === userId).length ?? 0,
    unassigned: conversations?.filter(c => !c.meta.assignee).length ?? 0,
    all: conversations?.length ?? 0,
  }

  const tabs: Array<{ key: ConversationFilter; label: string; count: number }> = [
    { key: 'mine', label: 'Mías', count: counts.mine },
    { key: 'unassigned', label: 'Sin asignar', count: counts.unassigned },
    { key: 'all', label: 'Todos', count: counts.all },
  ]

  return (
    <div className="flex gap-2 px-6 pt-4 border-b border-white/[0.06]">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setFilter(tab.key)}
          className={`
            px-4 py-2 text-sm font-medium
            border-b-2 transition-colors
            ${filter === tab.key
              ? 'border-[#9EFF00] text-[#9EFF00]'
              : 'border-transparent text-[#f0f4ff]/60 hover:text-[#f0f4ff]'
            }
          `}
        >
          {tab.label} {tab.count}
        </button>
      ))}
    </div>
  )
}
