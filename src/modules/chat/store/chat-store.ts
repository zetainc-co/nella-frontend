import { create } from 'zustand'

export type ConversationFilter = 'all' | 'ai_active' | 'human' | 'resolved'

interface ChatStore {
  selectedConversationId: number | null
  filter: ConversationFilter
  searchQuery: string
  setSelected: (id: number | null) => void
  setFilter: (filter: ConversationFilter) => void
  setSearch: (query: string) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedConversationId: null,
  filter: 'all',
  searchQuery: '',
  setSelected: (id) => set({ selectedConversationId: id }),
  setFilter: (filter) => set({ filter }),
  setSearch: (searchQuery) => set({ searchQuery }),
}))
