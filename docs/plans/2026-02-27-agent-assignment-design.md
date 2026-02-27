# Agent Assignment System - Design Document

**Date:** 2026-02-27
**Status:** Approved
**Author:** Claude Sonnet 4.5

---

## Overview

Implement an agent assignment system for conversations with:
- **3 filter tabs**: Mías (mine), Sin asignar (unassigned), Todos (all)
- **Context menu**: Right-click + 3-dots button trigger
- **MVP actions**: Assign agent (with submenu showing all agents), Assign label (future)

## Goals

- Allow agents to filter conversations by assignment status
- Enable quick agent assignment via context menu
- Provide visual indicators for assigned/unassigned conversations
- Use existing backend endpoints (no new backend development needed)

## Non-Goals (for MVP)

- Mark as read/unread
- Snooze conversation
- Priority management
- Team assignment
- Assign label (listed in menu but disabled for now)

---

## Architecture

### Component Structure

```
src/modules/chat/components/
├── conversation-list/
│   ├── conversation-tabs.tsx        ← NEW: Filter tabs
│   ├── conversation-item.tsx        ← MODIFY: Add 3-dots button
│   └── conversation-context-menu.tsx ← NEW: Context menu
│
└── shared/
    └── agent-selector-submenu.tsx   ← NEW: Agent list submenu
```

### Data Flow

```
User clicks tab → Update filter in store → useConversations refetch
                                         ↓
                              Filter by meta.assignee.id

User right-click OR 3-dots → Open context menu
                           ↓
                  Click "Asignar agente"
                           ↓
                  Open submenu with agents list
                           ↓
                  Select agent
                           ↓
          POST /conversations/:id/assign
                           ↓
                  Refetch conversations
```

---

## Components

### 1. ConversationTabs

**Purpose:** Display 3 filter tabs with conversation counts

**Location:** `src/modules/chat/components/conversation-list/conversation-tabs.tsx`

**State:**
- Uses `useChatStore` for current filter
- Uses `useConversations` for data
- Uses `useCurrentUserId` to identify current user

**Logic:**
```typescript
counts = {
  mine: conversations.filter(c => c.meta.assignee?.id === userId).length,
  unassigned: conversations.filter(c => !c.meta.assignee).length,
  all: conversations.length,
}
```

**UI:**
```
[Mías 3] [Sin asignar 5] [Todos 8]
```

---

### 2. ConversationItem (modifications)

**Purpose:** Add 3-dots button and context menu trigger

**Location:** `src/modules/chat/components/conversation-list/conversation-item.tsx`

**New features:**
- Right-click handler → `onContextMenu`
- 3-dots button → `onClick` (stops propagation)
- Position calculation for menu placement
- Conditional rendering of `ConversationContextMenu`

**State:**
```typescript
const [menuOpen, setMenuOpen] = useState(false)
const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
```

---

### 3. ConversationContextMenu

**Purpose:** Display context menu with actions

**Location:** `src/modules/chat/components/conversation-list/conversation-context-menu.tsx`

**Props:**
- `conversationId: number`
- `position: { x: number, y: number }`
- `onClose: () => void`

**Menu structure:**
```
┌─────────────────────────┐
│ 👤 Asignar un agente  ▶ │ ← Opens submenu
│ 🏷️ Asignar etiqueta   ▶ │ ← Disabled for now
└─────────────────────────┘
```

**Features:**
- Renders in Portal (outside normal DOM hierarchy)
- Backdrop to close on outside click
- Submenu management state
- Arrow indicators for submenu items

---

### 4. AgentSelectorSubmenu

**Purpose:** Display list of available agents

**Location:** `src/modules/chat/components/shared/agent-selector-submenu.tsx`

**Props:**
- `conversationId: number`
- `onSelect: () => void`

**Data source:**
- Uses `useAgents()` hook
- Uses `useAssignAgent(conversationId)` mutation

**Menu structure:**
```
┌─────────────────────────┐
│ None                    │ ← Unassign
├─────────────────────────┤
│ 👤 SSOS Admin           │
│ 👤 Agent 1              │
│ 👤 Agent 2              │
└─────────────────────────┘
```

**Interactions:**
- Click "None" → Unassign agent (set assignee_id to null)
- Click agent → Assign agent (set assignee_id)
- Shows loading state while fetching agents
- Closes menu after selection

---

## Hooks

### useCurrentUserId

**Purpose:** Extract userId from JWT token

**Location:** `src/modules/chat/hooks/use-current-user-id.ts`

**Logic:**
```typescript
1. Get token from localStorage
2. Decode JWT using jwtDecode
3. Extract userId from payload.sub
4. Return number or null
```

**Dependencies:**
- `jwt-decode` library (may need to install)

---

### useAgents

**Purpose:** Fetch list of all agents for the tenant

**Location:** `src/modules/chat/hooks/use-agents.ts`

**Query:**
- Key: `['agents']`
- Endpoint: `GET /chatwoot-agents`
- Stale time: 5 minutes

**Returns:**
```typescript
{
  id: number
  name: string
  email: string
  avatar_url?: string
  role: string
  availability_status: string
}[]
```

---

### useAssignAgent

**Purpose:** Assign or unassign agent from conversation

**Location:** `src/modules/chat/hooks/use-assign-agent.ts`

**Mutation logic:**
```typescript
if (agentId === null) {
  // Unassign
  PATCH /conversations/:id/status
  Body: { assignee_id: null }
} else {
  // Assign
  POST /conversations/:id/assign
  Body: { assignee_id, team_id? }
}
```

**Side effects:**
- Shows toast notification
- Refetches conversations list
- Refetches specific conversation

---

### useConversations (modifications)

**Purpose:** Add filtering by assignment status

**Location:** `src/modules/chat/hooks/use-conversations.ts`

**New filter logic:**
```typescript
if (filter === 'mine') {
  conversations = conversations.filter(c => c.meta.assignee?.id === currentUserId)
} else if (filter === 'unassigned') {
  conversations = conversations.filter(c => !c.meta.assignee)
}
```

**Query key:** `['conversations', filter, searchQuery]`

---

## Services

### chatwootService (additions)

**Location:** `src/modules/chat/services/chatwoot.ts`

**New methods:**

```typescript
assignConversation: (conversationId: number, assigneeId: number, teamId?: number) =>
  apiClient.post(`/chatwoot-conversations/conversations/${conversationId}/assign`, {
    assignee_id: assigneeId,
    ...(teamId && { team_id: teamId })
  })

updateConversationStatus: (conversationId: number, data: { assignee_id?: number | null }) =>
  apiClient.patch(`/chatwoot-conversations/conversations/${conversationId}/status`, data)
```

---

## Store

### chatStore (modifications)

**Location:** `src/modules/chat/store/chat-store.ts`

**New filter types:**
```typescript
export type ConversationFilter =
  | 'all'
  | 'mine'        // NEW
  | 'unassigned'  // NEW
  | 'ai_active'
  | 'human'
  | 'resolved'
```

---

## Backend (No Changes Needed)

All required endpoints already exist:

### 1. List Agents
```
GET /chatwoot-agents
Response: Agent[]
```

### 2. Assign Agent
```
POST /chatwoot-conversations/conversations/:conversationId/assign
Body: {
  "assignee_id": number,
  "team_id"?: number
}
```
- Controller: `chatwoot-conversations.controller.ts:149`
- DTO: `AssignConversationDto` ✅
- Service: `assignConversation()` ✅

### 3. Unassign Agent
```
PATCH /chatwoot-conversations/conversations/:conversationId/status
Body: {
  "assignee_id": null
}
```
- Controller: `chatwoot-conversations.controller.ts:173`
- DTO: `UpdateConversationStatusDto` ✅
- Service: `updateConversationStatus()` ✅

---

## Design Decisions

### 1. Filter tabs vs assignee_type query param

**Decision:** Client-side filtering
**Rationale:**
- Chatwoot API has `assignee_type` param (me, unassigned, all) but requires agent ID
- Client-side filtering is simpler and doesn't require backend changes
- Performance acceptable for typical conversation counts (< 1000)

### 2. Context menu positioning

**Decision:** Calculate position from event coordinates
**Rationale:**
- Right-click: Use `event.clientX/Y`
- 3-dots button: Use `element.getBoundingClientRect()`
- Ensures menu doesn't overflow viewport

### 3. Unassign as separate option vs checkbox

**Decision:** "None" option in agent list
**Rationale:**
- Matches Chatwoot UX
- Simpler interaction model
- Clear intent (click to unassign)

### 4. JWT decoding client-side

**Decision:** Decode JWT in `useCurrentUserId` hook
**Rationale:**
- Avoid additional API call to `/auth/me`
- JWT already contains userId
- No security concern (JWT is already in localStorage)

### 5. Assign label disabled for MVP

**Decision:** Show in menu but disabled
**Rationale:**
- Future-proofing UI
- Indicates planned feature
- Avoids scope creep in MVP

---

## Implementation Phases

### Phase 1: Tabs + Filtering
1. Create `ConversationTabs` component
2. Add filter types to store
3. Implement `useCurrentUserId` hook
4. Update `useConversations` with new filters
5. Test filtering logic

### Phase 2: Context Menu Infrastructure
1. Create `ConversationContextMenu` component
2. Add 3-dots button to `ConversationItem`
3. Implement right-click handler
4. Test menu positioning
5. Test backdrop close behavior

### Phase 3: Agent Assignment
1. Create `AgentSelectorSubmenu` component
2. Implement `useAgents` hook
3. Implement `useAssignAgent` hook
4. Add service methods to `chatwootService`
5. Wire up menu interactions
6. Test assign/unassign flows

---

## Success Criteria

- [x] Tabs show correct counts for Mías/Sin asignar/Todos
- [x] Clicking tab filters conversations correctly
- [x] Right-click opens context menu at cursor position
- [x] 3-dots button opens context menu next to button
- [x] Context menu shows "Asignar agente" with arrow indicator
- [x] Clicking "Asignar agente" opens submenu with agents list
- [x] Clicking agent assigns and shows success toast
- [x] Clicking "None" unassigns and shows success toast
- [x] Conversation list updates after assignment
- [x] Clicking outside menu closes it

---

## Future Enhancements (Post-MVP)

- Assign label functionality
- Mark as read/unread
- Snooze conversation
- Priority levels
- Team assignment
- Bulk assignment
- Keyboard shortcuts (e.g., press 'a' to assign)
- Search agents in submenu
- Show agent status (online/offline) in submenu

---

## Dependencies

### New NPM packages needed:
```json
{
  "jwt-decode": "^4.0.0"  // For decoding JWT client-side
}
```

### Existing dependencies:
- `@tanstack/react-query` (already installed)
- `zustand` (already installed)
- `sonner` (already installed)
