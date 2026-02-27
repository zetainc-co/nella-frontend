# Agent Assignment System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable agents to filter conversations by assignment status and assign/unassign agents via context menu

**Architecture:** Client-side filtering with 3 tabs (mine/unassigned/all), context menu triggered by right-click or 3-dots button, agent selector submenu using existing backend endpoints

**Tech Stack:** React, TypeScript, TanStack Query, Zustand, Tailwind CSS, jwt-decode

---

## Task 0: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install jwt-decode**

```bash
npm install jwt-decode
```

Expected: Package installed successfully

**Step 2: Verify installation**

```bash
npm list jwt-decode
```

Expected: Shows jwt-decode@4.x.x

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat|nella-41|20260227|Add jwt-decode dependency for client-side JWT parsing"
```

---

## Phase 1: Tabs + Filtering

### Task 1: Add New Filter Types to Store

**Files:**
- Modify: `src/modules/chat/store/chat-store.ts:3`

**Step 1: Update ConversationFilter type**

In `chat-store.ts`, change line 3 from:
```typescript
export type ConversationFilter = 'all' | 'ai_active' | 'human' | 'resolved'
```

To:
```typescript
export type ConversationFilter =
  | 'all'
  | 'mine'        // NEW: My assigned conversations
  | 'unassigned'  // NEW: Unassigned conversations
  | 'ai_active'
  | 'human'
  | 'resolved'
```

**Step 2: Verify TypeScript compilation**

```bash
npm run build
```

Expected: No TypeScript errors

**Step 3: Commit**

```bash
git add src/modules/chat/store/chat-store.ts
git commit -m "feat|nella-41|20260227|Add mine and unassigned filter types to conversation store"
```

---

### Task 2: Create useCurrentUserId Hook

**Files:**
- Create: `src/modules/chat/hooks/use-current-user-id.ts`

**Step 1: Create hook file**

Create `src/modules/chat/hooks/use-current-user-id.ts`:

```typescript
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  sub: string // userId
  tenantId: string
  tenantSlug: string
  role: string
  type: 'access' | 'refresh'
}

/**
 * Extract current user ID from JWT access token
 * @returns userId as number or null if not available
 */
export function useCurrentUserId(): number | null {
  const token = localStorage.getItem('access_token')

  if (!token) {
    console.warn('No access_token found in localStorage')
    return null
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)
    const userId = parseInt(decoded.sub, 10)

    if (isNaN(userId)) {
      console.error('Invalid userId in JWT:', decoded.sub)
      return null
    }

    return userId
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/chat/hooks/use-current-user-id.ts
git commit -m "feat|nella-41|20260227|Add useCurrentUserId hook to extract userId from JWT"
```

---

### Task 3: Update useConversations with New Filters

**Files:**
- Modify: `src/modules/chat/hooks/use-conversations.ts:1-56`
- Import: Add `useCurrentUserId`

**Step 1: Add import for useCurrentUserId**

At top of `use-conversations.ts`, add:
```typescript
import { useCurrentUserId } from './use-current-user-id'
```

**Step 2: Update useConversations function**

Replace the function body (lines 7-55) with:

```typescript
export function useConversations() {
  const filter = useChatStore((s) => s.filter)
  const searchQuery = useChatStore((s) => s.searchQuery)
  const currentUserId = useCurrentUserId()

  return useQuery({
    queryKey: ['conversations', filter, searchQuery],
    queryFn: async () => {
      const params: any = {}

      // Backend filtering by status
      if (filter === 'resolved') {
        params.status = 'resolved'
      } else if (filter !== 'all' && filter !== 'mine' && filter !== 'unassigned') {
        params.status = 'open'
      }

      const response = await chatwootService.getConversations(params)
      return response.data
    },
    select: (data) => {
      let conversations = data.payload

      // Client-side filtering by assignment
      if (filter === 'mine' && currentUserId) {
        conversations = conversations.filter(c => c.meta.assignee?.id === currentUserId)
      } else if (filter === 'unassigned') {
        conversations = conversations.filter(c => !c.meta.assignee)
      }

      // Filtrar por modo agente basado en status
      if (filter === 'ai_active') {
        conversations = conversations.filter((c) => c.status === 'pending')
      } else if (filter === 'human') {
        conversations = conversations.filter((c) => c.status === 'open')
      }

      // Búsqueda local por nombre/teléfono
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        conversations = conversations.filter(
          (c) =>
            c.meta.sender.name.toLowerCase().includes(q) ||
            c.meta.sender.phone_number?.includes(q)
        )
      }

      // Enriquecer con agentMode basado en status de Chatwoot
      return conversations.map((c) => ({
        ...c,
        agentMode: c.status === 'pending' ? 'ai' : 'human',
        lastMessage: c.last_non_activity_message?.content || c.meta.sender.phone_number || '',
      })) as ConversationWithMode[]
    },
    refetchInterval: 30_000, // Fallback si socket falla
    staleTime: 10_000,
  })
}
```

**Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/chat/hooks/use-conversations.ts
git commit -m "feat|nella-41|20260227|Add mine and unassigned filtering to useConversations hook"
```

---

### Task 4: Create ConversationTabs Component

**Files:**
- Create: `src/modules/chat/components/conversation-list/conversation-tabs.tsx`

**Step 1: Create component file**

Create `src/modules/chat/components/conversation-list/conversation-tabs.tsx`:

```typescript
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
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/chat/components/conversation-list/conversation-tabs.tsx
git commit -m "feat|nella-41|20260227|Create ConversationTabs component with mine unassigned all filters"
```

---

### Task 5: Integrate ConversationTabs into Chat UI

**Files:**
- Modify: `src/modules/chat/components/conversation-list/index.tsx` or main chat layout

**Step 1: Find conversation list container**

```bash
find src/modules/chat -name "*.tsx" | xargs grep -l "ConversationItem" | head -1
```

Expected: Path to file that renders conversation list

**Step 2: Add ConversationTabs above conversation list**

Import at top:
```typescript
import { ConversationTabs } from './conversation-tabs'
```

Add before the conversation list:
```typescript
<ConversationTabs />
```

**Step 3: Test in browser**

```bash
npm run dev
```

Expected: See 3 tabs (Mías, Sin asignar, Todos) with counts

**Step 4: Verify tab clicking updates filter**

Click each tab → Verify conversations filter correctly

**Step 5: Commit**

```bash
git add [modified-file]
git commit -m "feat|nella-41|20260227|Integrate ConversationTabs into chat UI"
```

---

## Phase 2: Context Menu Infrastructure

### Task 6: Add Service Methods for Agent Assignment

**Files:**
- Modify: `src/modules/chat/services/chatwoot.ts:71`

**Step 1: Add new service methods**

At end of `chatwootService` object (after line 70), add:

```typescript
  assignConversation: (conversationId: number, assigneeId: number, teamId?: number) =>
    apiClient.post<any>(
      `/chatwoot-conversations/conversations/${conversationId}/assign`,
      {
        assignee_id: assigneeId,
        ...(teamId && { team_id: teamId })
      }
    ),

  updateConversationStatus: (
    conversationId: number,
    data: { assignee_id?: number | null; status?: string; snoozed_until?: string }
  ) =>
    apiClient.patch<any>(
      `/chatwoot-conversations/conversations/${conversationId}/status`,
      data
    ),
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/chat/services/chatwoot.ts
git commit -m "feat|nella-41|20260227|Add assignConversation and updateConversationStatus service methods"
```

---

### Task 7: Create useAgents Hook

**Files:**
- Create: `src/modules/chat/hooks/use-agents.ts`

**Step 1: Create hook file**

Create `src/modules/chat/hooks/use-agents.ts`:

```typescript
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/api-client'

export interface Agent {
  id: number
  name: string
  email: string
  avatar_url?: string
  role: string
  availability_status: string
}

/**
 * Fetch list of all agents for the current tenant
 */
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await apiClient.get<Agent[]>('/chatwoot-agents')
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - agents don't change frequently
  })
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/chat/hooks/use-agents.ts
git commit -m "feat|nella-41|20260227|Create useAgents hook to fetch agent list"
```

---

### Task 8: Create useAssignAgent Hook

**Files:**
- Create: `src/modules/chat/hooks/use-assign-agent.ts`

**Step 1: Create hook file**

Create `src/modules/chat/hooks/use-assign-agent.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { chatwootService } from '../services/chatwoot'
import { toast } from 'sonner'

/**
 * Assign or unassign agent from conversation
 */
export function useAssignAgent(conversationId: number) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (agentId: number | null) => {
      if (agentId === null) {
        // Desasignar agente
        return chatwootService.updateConversationStatus(conversationId, {
          assignee_id: null,
        })
      } else {
        // Asignar agente
        return chatwootService.assignConversation(conversationId, agentId)
      }
    },
    onSuccess: (data, agentId) => {
      const message = agentId === null
        ? 'Conversación desasignada exitosamente'
        : 'Agente asignado exitosamente'

      console.log(`✅ ${message}:`, data)
      toast.success(message)

      // Refetch conversations para actualizar UI
      queryClient.refetchQueries({ queryKey: ['conversations'] })
      queryClient.refetchQueries({ queryKey: ['conversation', conversationId] })
    },
    onError: (error: any) => {
      console.error('❌ Error asignando agente:', error)
      toast.error(error.message || 'Error al asignar agente')
    },
  })

  return {
    assignAgent: mutation.mutate,
    isAssigning: mutation.isPending,
  }
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/chat/hooks/use-assign-agent.ts
git commit -m "feat|nella-41|20260227|Create useAssignAgent hook with assign and unassign logic"
```

---

### Task 9: Create AgentSelectorSubmenu Component

**Files:**
- Create: `src/modules/chat/components/shared/agent-selector-submenu.tsx`

**Step 1: Create shared directory if needed**

```bash
mkdir -p src/modules/chat/components/shared
```

**Step 2: Create component file**

Create `src/modules/chat/components/shared/agent-selector-submenu.tsx`:

```typescript
'use client'
import { useAgents } from '../../hooks/use-agents'
import { useAssignAgent } from '../../hooks/use-assign-agent'
import { User, Loader2 } from 'lucide-react'

interface AgentSelectorSubmenuProps {
  conversationId: number
  onSelect: () => void
  position?: { x: number; y: number }
}

export function AgentSelectorSubmenu({
  conversationId,
  onSelect,
  position = { x: 0, y: 0 }
}: AgentSelectorSubmenuProps) {
  const { data: agents, isLoading } = useAgents()
  const { assignAgent, isAssigning } = useAssignAgent(conversationId)

  const handleSelect = (agentId: number | null) => {
    assignAgent(agentId)
    onSelect()
  }

  return (
    <div
      className="
        absolute z-50
        min-w-[200px]
        bg-[#1a1a1a] border border-white/[0.1]
        rounded-lg shadow-xl
        py-1
      "
      style={{
        top: position.y,
        left: position.x + 10, // Offset to right of main menu
      }}
    >
      {/* None option - unassign */}
      <button
        onClick={() => handleSelect(null)}
        disabled={isAssigning}
        className="
          w-full px-4 py-2 text-left
          text-sm text-[#f0f4ff]/60
          hover:bg-white/[0.05]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
        "
      >
        None
      </button>

      <div className="border-t border-white/[0.06] my-1" />

      {/* Agent list */}
      {isLoading ? (
        <div className="px-4 py-2 flex items-center gap-2 text-[#f0f4ff]/40">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando agentes...</span>
        </div>
      ) : agents && agents.length > 0 ? (
        agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => handleSelect(agent.id)}
            disabled={isAssigning}
            className="
              w-full px-4 py-2 text-left
              text-sm text-[#f0f4ff]
              hover:bg-white/[0.05]
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
              flex items-center gap-2
            "
          >
            <User className="w-4 h-4 text-[#f0f4ff]/60" />
            <span>{agent.name}</span>
          </button>
        ))
      ) : (
        <div className="px-4 py-2 text-sm text-[#f0f4ff]/40">
          No hay agentes disponibles
        </div>
      )}
    </div>
  )
}
```

**Step 3: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 4: Commit**

```bash
git add src/modules/chat/components/shared/agent-selector-submenu.tsx
git commit -m "feat|nella-41|20260227|Create AgentSelectorSubmenu component with agent list"
```

---

## Phase 3: Context Menu Integration

### Task 10: Create ConversationContextMenu Component

**Files:**
- Create: `src/modules/chat/components/conversation-list/conversation-context-menu.tsx`

**Step 1: Create component file**

Create `src/modules/chat/components/conversation-list/conversation-context-menu.tsx`:

```typescript
'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { User, Tag, ChevronRight } from 'lucide-react'
import { AgentSelectorSubmenu } from '../shared/agent-selector-submenu'

interface ConversationContextMenuProps {
  conversationId: number
  position: { x: number; y: number }
  onClose: () => void
}

export function ConversationContextMenu({
  conversationId,
  position,
  onClose
}: ConversationContextMenuProps) {
  const [submenuOpen, setSubmenuOpen] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const menuContent = (
    <div
      ref={menuRef}
      className="
        fixed z-50
        min-w-[220px]
        bg-[#1a1a1a] border border-white/[0.1]
        rounded-lg shadow-xl
        py-1
      "
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {/* Asignar un agente */}
      <button
        onMouseEnter={() => setSubmenuOpen('agents')}
        className="
          w-full px-4 py-2 text-left
          text-sm text-[#f0f4ff]
          hover:bg-white/[0.05]
          transition-colors
          flex items-center justify-between gap-2
        "
      >
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-[#f0f4ff]/60" />
          <span>Asignar un agente</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#f0f4ff]/40" />
      </button>

      {/* Asignar etiqueta (disabled for now) */}
      <button
        disabled
        className="
          w-full px-4 py-2 text-left
          text-sm text-[#f0f4ff]/40
          cursor-not-allowed
          flex items-center justify-between gap-2
        "
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#f0f4ff]/40" />
          <span>Asignar etiqueta</span>
        </div>
        <ChevronRight className="w-4 h-4 text-[#f0f4ff]/40" />
      </button>

      {/* Agent selector submenu */}
      {submenuOpen === 'agents' && (
        <AgentSelectorSubmenu
          conversationId={conversationId}
          onSelect={() => {
            setSubmenuOpen(null)
            onClose()
          }}
          position={{
            x: position.x + 220, // Menu width
            y: position.y
          }}
        />
      )}
    </div>
  )

  return createPortal(menuContent, document.body)
}
```

**Step 2: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 3: Commit**

```bash
git add src/modules/chat/components/conversation-list/conversation-context-menu.tsx
git commit -m "feat|nella-41|20260227|Create ConversationContextMenu with agent assignment option"
```

---

### Task 11: Add Context Menu Trigger to ConversationItem

**Files:**
- Modify: `src/modules/chat/components/conversation-list/conversation-item.tsx:1-107`

**Step 1: Add imports**

At top of file, add:
```typescript
import { useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { ConversationContextMenu } from './conversation-context-menu'
```

**Step 2: Add state for menu**

Inside `ConversationItemComponent`, after line 12, add:
```typescript
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
```

**Step 3: Add right-click handler**

After line 12 (after state declarations), add:
```typescript
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
```

**Step 4: Update button element**

Change line 15 `<button` to:
```typescript
    <button
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={`
```

**Step 5: Add 3-dots button**

Before the closing `</button>` tag (around line 101), add:
```typescript
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
```

**Step 6: Add context menu rendering**

After the closing `</button>` tag (around line 102), before the final `</button>`, add:
```typescript
      {/* Context menu */}
      {menuOpen && (
        <ConversationContextMenu
          conversationId={conversation.id}
          position={menuPosition}
          onClose={() => setMenuOpen(false)}
        />
      )}
```

**Step 7: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

Expected: No errors

**Step 8: Test in browser**

```bash
npm run dev
```

- Right-click conversation → Context menu appears
- Click 3-dots button → Context menu appears
- Click outside → Menu closes
- Hover "Asignar un agente" → Submenu appears
- Click agent → Assignment happens, toast shows

**Step 9: Commit**

```bash
git add src/modules/chat/components/conversation-list/conversation-item.tsx
git commit -m "feat|nella-41|20260227|Add context menu trigger via right-click and 3-dots button"
```

---

## Final Verification

### Task 12: End-to-End Testing

**Step 1: Test tab filtering**

```bash
npm run dev
```

1. Click "Mías" tab → See only conversations assigned to current user
2. Click "Sin asignar" tab → See only unassigned conversations
3. Click "Todos" tab → See all conversations

**Step 2: Test context menu**

1. Right-click on conversation → Menu opens at cursor
2. Click 3-dots button → Menu opens next to button
3. Click outside menu → Menu closes
4. Press Escape → Menu closes

**Step 3: Test agent assignment**

1. Open context menu → Hover "Asignar un agente"
2. Submenu appears with agent list
3. Click an agent → Success toast appears
4. Conversation list updates → Conversation shows new assignee
5. Tabs update → Counts adjust correctly

**Step 4: Test unassignment**

1. Open context menu on assigned conversation
2. Hover "Asignar un agente" → Click "None"
3. Success toast appears
4. Conversation moves to "Sin asignar" tab

**Step 5: Verify no console errors**

Open DevTools → Console tab → Should be clean (no errors)

**Step 6: Final commit**

```bash
git add .
git commit -m "feat|nella-41|20260227|Complete agent assignment system with tabs and context menu"
```

---

## Success Criteria Checklist

- [ ] Tabs show correct counts for Mías/Sin asignar/Todos
- [ ] Clicking tab filters conversations correctly
- [ ] Right-click opens context menu at cursor position
- [ ] 3-dots button opens context menu next to button
- [ ] Context menu shows "Asignar agente" with arrow indicator
- [ ] Clicking "Asignar agente" opens submenu with agents list
- [ ] Clicking agent assigns and shows success toast
- [ ] Clicking "None" unassigns and shows success toast
- [ ] Conversation list updates after assignment
- [ ] Clicking outside menu closes it
- [ ] No TypeScript errors
- [ ] No console errors

---

## Notes

**Estimated time:** 2-3 hours for full implementation

**Testing focus:**
- Tab filtering logic with different user IDs
- Context menu positioning edge cases (near viewport edges)
- Assignment/unassignment state updates
- Toast notifications

**Known limitations:**
- Client-side filtering (performance acceptable for < 1000 conversations)
- No keyboard shortcuts yet (future enhancement)
- No agent search in submenu (future enhancement)

**Future enhancements:**
- Add "Asignar etiqueta" functionality
- Keyboard shortcuts (e.g., 'a' for assign)
- Bulk assignment
- Agent status indicators (online/offline)
