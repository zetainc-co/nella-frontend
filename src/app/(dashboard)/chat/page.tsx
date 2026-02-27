'use client'
import { InboxChat } from '@/modules/chat/components/inbox-chat'

export default function ChatPage() {
  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <h2
            className="text-2xl font-bold tracking-tight"
            style={{ color: '#f0f4ff' }}
          >
            Chat
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: 'rgba(240,244,255,0.4)' }}>
            Conversaciones de WhatsApp en tiempo real.
          </p>
        </div>
      </div>

      {/* Chat interface — altura restante */}
      <div className="flex-1 overflow-hidden">
        <InboxChat />
      </div>
    </div>
  )
}
