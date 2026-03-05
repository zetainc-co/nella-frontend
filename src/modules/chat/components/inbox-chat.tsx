'use client'
import { useConversations } from '../hooks/use-conversations'
import { useMessages } from '../hooks/use-messages'
import { useSendMessage } from '../hooks/use-send-message'
import { useConversationsSocket } from '../hooks/use-conversations-socket'
import { useChatStore } from '../store/chat-store'
import { ConversationList } from './conversation-list/conversation-list'
import { ChatThread } from './chat-thread/chat-thread'

export function InboxChat() {
  const { selectedConversationId, setSelected } = useChatStore()

  // Conectar a Socket.io para actualizaciones en tiempo real
  useConversationsSocket(selectedConversationId)

  const { data: conversations, isLoading: loadingConvs } = useConversations()

  const { data: messagesData, isLoading: loadingMsgs } =
    useMessages(selectedConversationId)

  const { mutate: sendMessage, isPending: sendingMessage } = useSendMessage(
    selectedConversationId
  )

  const selectedConversation = conversations?.find(
    (c) => c.id === selectedConversationId
  )

  return (
    <div
      className="flex h-full"
      style={{ background: '#151515' }}
      role="main"
      aria-label="Bandeja de entrada"
    >
      {/* Panel izquierdo — lista de conversaciones */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 320,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: '#1a1a1a',
        }}
        role="region"
        aria-label="Conversaciones"
      >
        <ConversationList
          conversations={conversations ?? []}
          isLoading={loadingConvs}
          selectedId={selectedConversationId}
          onSelect={setSelected}
        />
      </div>

      {/* Panel derecho — hilo de mensajes */}
      <div
        className="flex-1 flex flex-col min-w-0"
        role="region"
        aria-label="Chat"
      >
        <ChatThread
          conversation={selectedConversation ?? null}
          messages={messagesData ?? []}
          isLoading={loadingMsgs}
          isSending={sendingMessage}
          onSendMessage={(content) =>
            sendMessage({ content, message_type: 'outgoing' })
          }
        />
      </div>
    </div>
  )
}
