import { io, Socket } from 'socket.io-client'
import type {
  WebSocketMessage,
  WebSocketConversationUpdate,
  WebSocketAgentAssigned,
  WebSocketLabelsUpdated,
  WebSocketStatusChanged,
  WebSocketUserTyping,
} from '../../types/nella-api'

/**
 * Servicio WebSocket para chat en tiempo real
 * Namespace: /chat
 */
class ChatWebSocketService {
  private socket: Socket | null = null
  private baseUrl: string

  constructor() {
    // URL del backend - ajustar según environment
    this.baseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect() {
    if (this.socket?.connected) {
      console.log('[WebSocket] Already connected')
      return this.socket
    }

    // Conectar directamente al backend (Next.js no hace proxy de WebSockets)
    this.socket = io(`${this.baseUrl}/chat`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    })

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error)
    })

    return this.socket
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      console.log('[WebSocket] Disconnected')
    }
  }

  /**
   * Unirse a una conversación
   */
  joinConversation(conversationId: string, userId: string) {
    if (!this.socket) {
      console.error('[WebSocket] Not connected')
      return
    }

    this.socket.emit('join_conversation', { conversationId, userId })
    console.log('[WebSocket] Joined conversation:', conversationId)
  }

  /**
   * Salir de una conversación
   */
  leaveConversation(conversationId: string) {
    if (!this.socket) return

    this.socket.emit('leave_conversation', { conversationId })
    console.log('[WebSocket] Left conversation:', conversationId)
  }

  /**
   * Indicar que el usuario está escribiendo
   */
  startTyping(conversationId: string, userId: string, userName: string) {
    if (!this.socket) return

    this.socket.emit('typing_start', { conversationId, userId, userName })
  }

  /**
   * Indicar que el usuario dejó de escribir
   */
  stopTyping(conversationId: string, userId: string) {
    if (!this.socket) return

    this.socket.emit('typing_stop', { conversationId, userId })
  }

  /**
   * Escuchar nuevos mensajes
   */
  onNewMessage(callback: (data: WebSocketMessage) => void) {
    if (!this.socket) return

    this.socket.on('new_message', callback)
  }

  /**
   * Escuchar actualizaciones de conversación
   */
  onConversationUpdate(callback: (data: WebSocketConversationUpdate) => void) {
    if (!this.socket) return

    this.socket.on('conversation_updated', callback)
  }

  /**
   * Escuchar asignaciones de agente
   */
  onAgentAssigned(callback: (data: WebSocketAgentAssigned) => void) {
    if (!this.socket) return

    this.socket.on('agent_assigned', callback)
  }

  /**
   * Escuchar cambios de labels
   */
  onLabelsUpdated(callback: (data: WebSocketLabelsUpdated) => void) {
    if (!this.socket) return

    this.socket.on('labels_updated', callback)
  }

  /**
   * Escuchar cambios de estado
   */
  onStatusChanged(callback: (data: WebSocketStatusChanged) => void) {
    if (!this.socket) return

    this.socket.on('status_changed', callback)
  }

  /**
   * Escuchar cuando otro usuario está escribiendo
   */
  onUserTyping(callback: (data: WebSocketUserTyping) => void) {
    if (!this.socket) return

    this.socket.on('user_typing', callback)
  }

  /**
   * Remover listener de nuevos mensajes
   */
  offNewMessage(callback: (data: WebSocketMessage) => void) {
    if (!this.socket) return

    this.socket.off('new_message', callback)
  }

  /**
   * Remover listener de typing
   */
  offUserTyping(callback: (data: WebSocketUserTyping) => void) {
    if (!this.socket) return

    this.socket.off('user_typing', callback)
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Obtener el socket (para uso avanzado)
   */
  getSocket(): Socket | null {
    return this.socket
  }
}

// Exportar instancia singleton
export const chatWebSocket = new ChatWebSocketService()
