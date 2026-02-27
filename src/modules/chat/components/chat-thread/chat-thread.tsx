import { useEffect, useRef } from 'react'
import { ContactHeader } from './contact-header'
import { MessageBubble } from './message-bubble'
import { MessageInput } from './message-input'
import type { ChatThreadProps } from '../../types'

export function ChatThread({
  conversation,
  messages,
  isLoading,
  isSending,
  onSendMessage,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length])

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <p className="text-sm text-[#f0f4ff]/40">
          Selecciona una conversación
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      <ContactHeader conversation={conversation} />

      <div className="flex-1 overflow-y-auto pl-6 pr-0 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#9EFF00]/20 border-t-[#9EFF00] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 w-full">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <MessageInput
        onSend={onSendMessage}
        isPending={isSending}
        disabled={!conversation}
      />
    </div>
  )
}
