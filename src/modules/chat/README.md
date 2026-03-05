# Módulo de Chat - Nella Native Backend

Sistema de chat 100% independiente usando PostgreSQL y WebSockets en tiempo real.

## 📁 Estructura

```
src/modules/chat/
├── components/           # Componentes React del chat
│   ├── conversation-list/    # Lista de conversaciones
│   ├── chat-thread/          # Thread de mensajes
│   └── shared/               # Componentes compartidos
├── hooks/                # React Hooks para lógica de negocio
│   ├── use-conversations.ts  # Listar y filtrar conversaciones
│   ├── use-messages.ts       # Listar mensajes de conversación
│   ├── use-send-message.ts   # Enviar mensajes
│   ├── use-assign-agent.ts   # Asignar/desasignar agentes
│   ├── use-ai-toggle.ts      # Alternar modo AI/Human
│   └── use-current-user-id.ts # Obtener ID del usuario actual
├── services/             # Servicios API
│   ├── nella-api/            # 🎯 Servicios Nella (USAR ESTOS)
│   │   ├── conversations.service.ts
│   │   ├── messages.service.ts
│   │   ├── labels.service.ts
│   │   ├── inboxes.service.ts
│   │   ├── assignments.service.ts
│   │   └── websocket.service.ts
│   └── chatwoot.ts           # ⚠️ DEPRECATED - No usar
├── types/                # TypeScript types
│   ├── nella-api.ts          # Types de Nella API
│   └── index.ts
└── store/                # Zustand stores
    └── chat-store.ts
```

## 🎯 Servicios Principales (Nella API)

### 1. Conversations Service

Gestiona conversaciones entre clientes y agentes.

```typescript
import { conversationsService } from '@/modules/chat/services/nella-api'

// Listar todas las conversaciones
const response = await conversationsService.getAll()

// Filtrar por contacto
const response = await conversationsService.getAll({ contactId: 123 })

// Filtrar por agente asignado
const response = await conversationsService.getAll({ agentId: 'uuid-agente' })

// Obtener una conversación específica
const response = await conversationsService.getById('uuid-conversation')

// Crear nueva conversación
const response = await conversationsService.create({
  contact_id: 123,
  inbox_id: 'uuid-inbox',
  status: 'active',
})

// Actualizar conversación
const response = await conversationsService.update('uuid-conversation', {
  status: 'closed',
  priority: 'high',
})

// Asignar agente
const response = await conversationsService.assignAgent(
  'uuid-conversation',
  'uuid-agente'
)

// Actualizar labels
const response = await conversationsService.updateLabels('uuid-conversation', [
  'uuid-label-1',
  'uuid-label-2',
])
```

### 2. Messages Service

Gestiona mensajes dentro de conversaciones.

```typescript
import { messagesService } from '@/modules/chat/services/nella-api'

// Obtener mensajes de una conversación
const response = await messagesService.getByConversation('uuid-conversation')

// Obtener solo mensajes de IA
const response = await messagesService.getAIMessages('uuid-conversation')

// Enviar mensaje de texto simple
const response = await messagesService.sendText(
  'uuid-conversation',
  'Hola, ¿cómo estás?',
  true // from_customer
)

// Enviar mensaje de agente
const response = await messagesService.sendAgentMessage(
  'uuid-conversation',
  'Te ayudo con tu consulta',
  'uuid-agente'
)

// Enviar mensaje con archivo
const response = await messagesService.sendWithAttachment(
  'uuid-conversation',
  'Aquí está el documento',
  'https://example.com/file.pdf',
  'application/pdf'
)
```

### 3. Labels Service

Gestiona etiquetas para categorizar conversaciones.

```typescript
import { labelsService } from '@/modules/chat/services/nella-api'

// Listar todas las labels
const response = await labelsService.getAll()

// Listar solo labels activas
const response = await labelsService.getActive()

// Crear nueva label
const response = await labelsService.create({
  name: 'Urgente',
  color: '#FF0000',
  description: 'Casos urgentes que requieren atención inmediata',
})

// Actualizar label
const response = await labelsService.update('uuid-label', {
  name: 'Muy Urgente',
  color: '#CC0000',
})

// Eliminar label
const response = await labelsService.delete('uuid-label')
```

### 4. Inboxes Service

Gestiona bandejas de entrada (canales).

```typescript
import { inboxesService } from '@/modules/chat/services/nella-api'

// Listar todos los inboxes
const response = await inboxesService.getAll()

// Listar solo inboxes activos
const response = await inboxesService.getActive()

// Obtener inbox por ID
const response = await inboxesService.getById('uuid-inbox')

// Crear nuevo inbox
const response = await inboxesService.create({
  name: 'WhatsApp Ventas',
  channel_type: 'whatsapp',
  is_active: true,
})
```

### 5. Assignments Service

Gestiona el historial de asignaciones de conversaciones.

```typescript
import { assignmentsService } from '@/modules/chat/services/nella-api'

// Obtener historial de asignaciones de una conversación
const response = await assignmentsService.getByConversation('uuid-conversation')

// Obtener asignaciones de un agente
const response = await assignmentsService.getByAgent('uuid-agente')

// Asignar agente a conversación
const response = await assignmentsService.assignAgent(
  'uuid-conversation',
  'uuid-agente',
  'uuid-asignador' // opcional
)
```

### 6. WebSocket Service

Gestiona conexión en tiempo real para eventos de chat.

```typescript
import { chatWebSocket } from '@/modules/chat/services/nella-api'

// Conectar al WebSocket
chatWebSocket.connect()

// Desconectar
chatWebSocket.disconnect()

// Escuchar nuevo mensaje
chatWebSocket.on('message:new', (data) => {
  console.log('Nuevo mensaje:', data.message)
})

// Escuchar actualización de conversación
chatWebSocket.on('conversation:updated', (data) => {
  console.log('Conversación actualizada:', data.conversationId)
})

// Escuchar asignación de agente
chatWebSocket.on('agent:assigned', (data) => {
  console.log('Agente asignado:', data.agentId)
})

// Indicar que usuario está escribiendo
chatWebSocket.emit('user:typing', {
  conversationId: 'uuid',
  userId: 'uuid',
  userName: 'Juan',
  isTyping: true,
})
```

## 🪝 React Hooks Principales

### useConversations

Lista y filtra conversaciones con React Query.

```typescript
import { useConversations } from '@/modules/chat/hooks'

function ConversationList() {
  const { data: conversations, isLoading, error } = useConversations()

  if (isLoading) return <div>Cargando...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <ul>
      {conversations?.map((conv) => (
        <li key={conv.id}>{conv.id}</li>
      ))}
    </ul>
  )
}
```

**Filtros disponibles** (configurados en `chat-store`):
- `all` - Todas las conversaciones
- `mine` - Mis conversaciones asignadas
- `unassigned` - Sin asignar
- `resolved` - Cerradas
- `ai_active` - Con IA activa
- `human` - Con agente humano

### useMessages

Lista mensajes de una conversación específica.

```typescript
import { useMessages } from '@/modules/chat/hooks'

function ChatThread({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useMessages(conversationId)

  return (
    <div>
      {messages?.map((msg) => (
        <div key={msg.id}>{msg.body}</div>
      ))}
    </div>
  )
}
```

### useSendMessage

Envía mensajes con mutación de React Query.

```typescript
import { useSendMessage } from '@/modules/chat/hooks'

function MessageInput({ conversationId }: { conversationId: string }) {
  const { sendMessage, isSending } = useSendMessage()

  const handleSend = () => {
    sendMessage({
      conversation_id: conversationId,
      body: 'Hola!',
      from_customer: false,
    })
  }

  return <button onClick={handleSend} disabled={isSending}>
    Enviar
  </button>
}
```

### useAssignAgent

Asigna o desasigna agentes de conversaciones.

```typescript
import { useAssignAgent } from '@/modules/chat/hooks'

function AssignButton({ conversationId }: { conversationId: string }) {
  const { assignAgent, isAssigning } = useAssignAgent(conversationId)

  const handleAssign = (agentId: string) => {
    assignAgent(agentId)
  }

  const handleUnassign = () => {
    assignAgent(null)
  }

  return <>
    <button onClick={() => handleAssign('uuid-agente')}>
      Asignar Agente
    </button>
    <button onClick={handleUnassign}>
      Desasignar
    </button>
  </>
}
```

### useAIToggle

Alterna entre modo AI y Human en una conversación.

```typescript
import { useAIToggle } from '@/modules/chat/hooks'

function AIToggle({
  conversationId,
  currentMode,
}: {
  conversationId: string
  currentMode: 'ai' | 'human'
}) {
  const { toggleAI, isLoading } = useAIToggle({ conversationId, currentMode })

  return (
    <button onClick={() => toggleAI('uuid-agente')} disabled={isLoading}>
      {currentMode === 'ai' ? 'Detener IA' : 'Activar IA'}
    </button>
  )
}
```

## 📊 Types Principales

### Conversation

```typescript
interface Conversation {
  id: string
  contact_id: number
  chatwoot_conversation_id: number | null
  status: 'active' | 'closed'
  inbox_id: string | null
  assigned_agent_id: string | null
  last_message_at: string | null
  label_ids: string[]
  priority: 'low' | 'medium' | 'high'
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}
```

### Message

```typescript
interface Message {
  id: string
  conversation_id: string
  body: string | null
  media_url: string | null
  media_type: string | null
  from_customer: boolean
  sender_id: string | null
  message_type: 'text' | 'image' | 'file' | 'video' | 'audio'
  attachments: any[] | null
  is_ai_response: boolean
  ai_intent: string | null
  chatwoot_message_id: number | null
  metadata: Record<string, any> | null
  created_at: string
}
```

## 🔄 Eventos WebSocket

El sistema emite eventos en tiempo real:

### Eventos de Mensajes

- `message:new` - Nuevo mensaje recibido
- `message:updated` - Mensaje actualizado
- `message:deleted` - Mensaje eliminado

### Eventos de Conversaciones

- `conversation:created` - Nueva conversación
- `conversation:updated` - Conversación actualizada
- `conversation:status_changed` - Status cambió (active/closed)

### Eventos de Asignación

- `agent:assigned` - Agente asignado
- `agent:unassigned` - Agente desasignado

### Eventos de Labels

- `labels:updated` - Labels actualizadas en conversación

### Eventos de Typing

- `user:typing` - Usuario está escribiendo

## 🚫 Servicios Obsoletos

### ⚠️ chatwoot.ts (DEPRECATED)

Este archivo está marcado como OBSOLETO y será eliminado. No usar.

**Migración:**

| Chatwoot (Viejo)                 | Nella (Nuevo)                            |
| -------------------------------- | ---------------------------------------- |
| `chatwootService.getConversations()` | `conversationsService.getAll()`          |
| `chatwootService.getMessages()`      | `messagesService.getByConversation()`    |
| `chatwootService.sendMessage()`      | `messagesService.send()`                 |
| `chatwootService.stopAI()`           | `conversationsService.update()` + metadata |
| `chatwootService.assignConversation()` | `assignmentsService.assignAgent()`      |

## 📝 Ejemplos de Uso Completo

### Ejemplo 1: Listar conversaciones filtradas

```typescript
'use client'
import { useConversations } from '@/modules/chat/hooks'
import { useChatStore } from '@/modules/chat/store/chat-store'

export function ConversationList() {
  const filter = useChatStore((s) => s.filter)
  const setFilter = useChatStore((s) => s.setFilter)
  const { data: conversations, isLoading } = useConversations()

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">Todas</option>
        <option value="mine">Mías</option>
        <option value="unassigned">Sin asignar</option>
        <option value="resolved">Resueltas</option>
      </select>

      {isLoading && <p>Cargando...</p>}

      <ul>
        {conversations?.map((conv) => (
          <li key={conv.id}>
            ID: {conv.id} - Status: {conv.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Ejemplo 2: Chat Thread con envío de mensajes

```typescript
'use client'
import { useMessages } from '@/modules/chat/hooks'
import { useSendMessage } from '@/modules/chat/hooks'
import { useState } from 'react'

export function ChatThread({ conversationId }: { conversationId: string }) {
  const { data: messages, isLoading } = useMessages(conversationId)
  const { sendMessage, isSending } = useSendMessage()
  const [text, setText] = useState('')

  const handleSend = () => {
    if (!text.trim()) return

    sendMessage({
      conversation_id: conversationId,
      body: text,
      from_customer: false,
      message_type: 'text',
    })

    setText('')
  }

  return (
    <div>
      <div className="messages">
        {messages?.map((msg) => (
          <div key={msg.id} className={msg.from_customer ? 'customer' : 'agent'}>
            <p>{msg.body}</p>
            <small>{new Date(msg.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <div className="input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={handleSend} disabled={isSending}>
          Enviar
        </button>
      </div>
    </div>
  )
}
```

## 🔗 Recursos Adicionales

- **Documentación Backend**: `/Users/gracialabdev/Documents/zeta/nella-proyect/nella_backend/POSTMAN_COLLECTION.json`
- **Schema SQL**: `/Users/gracialabdev/Documents/zeta/nella-proyect/nella_backend/src/shared/database/template-schema.sql`
- **Nella API Docs**: Ver `services/nella-api/README.md`

## 🆘 Solución de Problemas

### Error: "No hay sesión activa"

Asegúrate de que el usuario esté autenticado y tenga un token válido en el store.

```typescript
import { useAuthStore } from '@/core/store/auth-store'

const session = useAuthStore((s) => s.session)
if (!session) {
  // Redirigir a login
}
```

### Error: WebSocket no conecta

Verifica que el backend esté corriendo en `http://localhost:3000` y que los rewrites en `next.config.ts` estén configurados:

```typescript
{
  source: '/chat/:path*',
  destination: `${BACKEND_URL}/chat/:path*`,
}
```

### Error: 400 Bad Request en queries

Verifica que estés pasando los parámetros correctos. Los UUIDs son strings, los IDs de contactos son números.

```typescript
// ✅ Correcto
conversationsService.getAll({ contactId: 123, agentId: 'uuid-string' })

// ❌ Incorrecto
conversationsService.getAll({ contactId: 'abc', agentId: 123 })
```
