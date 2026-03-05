# Nella Native API Services

Servicios para el sistema de chat nativo de Nella, **100% independiente de Chatwoot**.

## Módulos Disponibles

### 1. Inboxes Service
Gestiona canales de comunicación (WhatsApp, Web, Email, API)

```typescript
import { inboxesService } from '@/modules/chat/services/nella-api'

// Listar todos los inboxes
const { data } = await inboxesService.getAll()
// data.data: Inbox[]

// Crear inbox
const inbox = await inboxesService.create({
  name: 'WhatsApp Principal',
  channel_type: 'whatsapp',
  is_active: true
})
```

### 2. Conversations Service
Gestiona conversaciones de chat

```typescript
import { conversationsService } from '@/modules/chat/services/nella-api'

// Listar todas las conversaciones
const { data } = await conversationsService.getAll()

// Filtrar por contacto
const convs = await conversationsService.getByContactId(123)

// Filtrar por inbox
const convs = await conversationsService.getByInboxId('uuid-inbox')

// Filtrar por agente
const convs = await conversationsService.getByAgentId('uuid-agente')

// Crear conversación
const conv = await conversationsService.create({
  contact_id: 123,
  inbox_id: 'uuid-inbox',
  priority: 'high'
})

// Actualizar conversación
const updated = await conversationsService.update('uuid-conv', {
  status: 'closed',
  assigned_agent_id: 'uuid-agente'
})

// Helpers útiles
await conversationsService.close('uuid-conv')
await conversationsService.reopen('uuid-conv')
await conversationsService.assignAgent('uuid-conv', 'uuid-agente')
await conversationsService.updateLabels('uuid-conv', ['label1', 'label2'])
await conversationsService.updatePriority('uuid-conv', 'high')
```

### 3. Messages Service
Gestiona mensajes con soporte para attachments

```typescript
import { messagesService } from '@/modules/chat/services/nella-api'

// Obtener mensajes de conversación
const { data } = await messagesService.getByConversation('uuid-conv')

// Enviar mensaje simple
const msg = await messagesService.sendText('uuid-conv', 'Hola!', true)

// Enviar mensaje de agente
const agentMsg = await messagesService.sendAgentMessage(
  'uuid-conv',
  'Te puedo ayudar?',
  'uuid-agente'
)

// Enviar mensaje con archivo
const fileMsg = await messagesService.sendWithAttachment(
  'uuid-conv',
  'Aquí está el documento',
  'https://example.com/file.pdf',
  'application/pdf',
  false
)

// Obtener solo mensajes de IA
const aiMessages = await messagesService.getAIMessages('uuid-conv')
```

### 4. Labels Service
Gestiona etiquetas para organizar conversaciones

```typescript
import { labelsService } from '@/modules/chat/services/nella-api'

// Listar todos los labels
const { data } = await labelsService.getAll()

// Solo labels activos
const active = await labelsService.getActive()

// Crear label
const label = await labelsService.create({
  name: 'Urgente',
  color: '#FF0000',
  description: 'Requiere atención inmediata'
})

// Actualizar label
const updated = await labelsService.update('uuid-label', {
  color: '#00FF00'
})

// Desactivar (soft delete)
await labelsService.deactivate('uuid-label')

// Activar
await labelsService.activate('uuid-label')
```

### 5. Assignments Service
Gestiona asignación de agentes a conversaciones

```typescript
import { assignmentsService } from '@/modules/chat/services/nella-api'

// Asignar agente
const assignment = await assignmentsService.assignAgent(
  'uuid-conv',
  'uuid-agente',
  'uuid-admin' // quien hizo la asignación
)

// Obtener asignaciones de conversación
const convAssignments = await assignmentsService.getByConversation('uuid-conv')

// Obtener asignaciones de agente
const agentAssignments = await assignmentsService.getByAgent('uuid-agente')

// Remover asignación
await assignmentsService.removeAgentFromConversation('uuid-conv', 'uuid-agente')
```

### 6. WebSocket Service
Comunicación en tiempo real

```typescript
import { chatWebSocket } from '@/modules/chat/services/nella-api'

// Conectar
chatWebSocket.connect()

// Unirse a conversación
chatWebSocket.joinConversation('uuid-conv', 'uuid-usuario')

// Escuchar nuevos mensajes
chatWebSocket.onNewMessage((data) => {
  console.log('Nuevo mensaje:', data.message)
  // Actualizar UI
})

// Escuchar typing
chatWebSocket.onUserTyping((data) => {
  if (data.isTyping) {
    console.log(`${data.userName} está escribiendo...`)
  }
})

// Indicar que estás escribiendo
chatWebSocket.startTyping('uuid-conv', 'uuid-usuario', 'Tu Nombre')
chatWebSocket.stopTyping('uuid-conv', 'uuid-usuario')

// Otros eventos
chatWebSocket.onConversationUpdate((data) => {
  console.log('Conversación actualizada:', data.update)
})

chatWebSocket.onAgentAssigned((data) => {
  console.log('Agente asignado:', data.agentId)
})

chatWebSocket.onLabelsUpdated((data) => {
  console.log('Labels actualizados:', data.labels)
})

chatWebSocket.onStatusChanged((data) => {
  console.log('Estado cambiado:', data.status)
})

// Salir de conversación
chatWebSocket.leaveConversation('uuid-conv')

// Desconectar
chatWebSocket.disconnect()
```

## Ejemplo de Hook Completo

```typescript
// hooks/use-nella-chat.ts
import { useState, useEffect } from 'react'
import {
  conversationsService,
  messagesService,
  chatWebSocket,
  type Conversation,
  type Message,
} from '@/modules/chat/services/nella-api'

export function useNellaChat(conversationId: string | null, userId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) return

    // Cargar conversación y mensajes
    const load = async () => {
      setIsLoading(true)
      try {
        const [convResp, msgsResp] = await Promise.all([
          conversationsService.getById(conversationId),
          messagesService.getByConversation(conversationId),
        ])
        setConversation(convResp.data.data)
        setMessages(msgsResp.data.data)
      } finally {
        setIsLoading(false)
      }
    }

    load()

    // Conectar WebSocket
    chatWebSocket.connect()
    chatWebSocket.joinConversation(conversationId, userId)

    // Escuchar nuevos mensajes
    const handleNewMessage = (data: any) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data.message])
      }
    }

    chatWebSocket.onNewMessage(handleNewMessage)

    // Cleanup
    return () => {
      chatWebSocket.offNewMessage(handleNewMessage)
      chatWebSocket.leaveConversation(conversationId)
    }
  }, [conversationId, userId])

  const sendMessage = async (text: string) => {
    if (!conversationId) return

    try {
      await messagesService.sendText(conversationId, text, true)
      // El WebSocket actualizará los mensajes automáticamente
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return {
    conversation,
    messages,
    isLoading,
    sendMessage,
  }
}
```

## Configuración

Asegúrate de tener la URL del backend configurada en `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Notas Importantes

- **WebSocket**: Los mensajes nuevos se emiten automáticamente vía WebSocket cuando se crean con `messagesService.send()`
- **Multi-tenant**: Los servicios ya incluyen el contexto de tenant automáticamente vía `apiClient`
- **Tipos**: Todos los servicios están completamente tipados con TypeScript
- **Independiente**: No requiere Chatwoot en absoluto

## Migración desde Chatwoot

Si estás migrando desde el servicio de Chatwoot:

### Antes (Chatwoot):
```typescript
import { chatwootService } from '@/modules/chat/services/chatwoot'

const convs = await chatwootService.getConversations()
await chatwootService.sendMessage(123, { content: 'Hola', message_type: 'outgoing' })
```

### Ahora (Nella Native):
```typescript
import { conversationsService, messagesService } from '@/modules/chat/services/nella-api'

const convs = await conversationsService.getAll()
await messagesService.sendText('uuid-conv', 'Hola', false)
```

---

**Sistema 100% Independiente** - No requiere Chatwoot 🎉
