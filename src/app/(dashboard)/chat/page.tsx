'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/core/store/auth-store'
import { apiClient } from '@/core/api/api-client'
import { ChatwootIframe } from '@/modules/chat/components/chatwoot-iframe'

export default function ChatPage() {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { session } = useAuthStore()
  const hasFetchedRef = useRef(false)

  const tenantSlug = session?.tenantSlug

  useEffect(() => {
    if (hasFetchedRef.current) return

    async function loadChatwootEmbed() {
      if (!tenantSlug) {
        setIsLoading(false)
        return
      }

      hasFetchedRef.current = true

      try {
        setIsLoading(true)

        // Always do auto-login to ensure correct session for current tenant
        // Cache is not viable because Chatwoot shares cookies across .localhost subdomains,
        // so switching tenants overwrites the session
        const config = await apiClient.get<{
          autoLoginUrl: string
          chatwootUrl: string
          accountId: number
        }>(`/api/chatwoot/embed-url/${tenantSlug}`)

        setEmbedUrl(config.autoLoginUrl)
        setError(null)
      } catch (err: any) {
        setError(
          err?.message || 'Chatwoot no configurado. Contacta al administrador.'
        )
        hasFetchedRef.current = false
      } finally {
        setIsLoading(false)
      }
    }

    loadChatwootEmbed()
  }, [tenantSlug])

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm" style={{ color: 'rgba(240,244,255,0.4)' }}>
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (isLoading || !embedUrl) {
    return null
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b px-8 py-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: '#f0f4ff' }}>
            Chat
          </h2>
          <p className="mt-0.5 text-sm" style={{ color: 'rgba(240,244,255,0.4)' }}>
            Conversaciones de WhatsApp en tiempo real.
          </p>
        </div>
      </div>

      <ChatwootIframe chatwootUrl={embedUrl} sessionToken={null} />
    </div>
  )
}
