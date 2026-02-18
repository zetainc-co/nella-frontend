'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatOffline } from './chat-offline'

interface ChatwootIframeProps {
  chatwootUrl: string
  sessionToken: string | null
}

type ConnectionStatus = 'checking' | 'online' | 'offline' | 'timeout'

const LOAD_TIMEOUT_MS = 10_000

export function ChatwootIframe({ chatwootUrl, sessionToken }: ChatwootIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [isRetrying, setIsRetrying] = useState(false)

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/chatwoot-health')
      const { healthy } = await res.json()
      return healthy as boolean
    } catch {
      return false
    }
  }, [])

  const initConnection = useCallback(async () => {
    setStatus('checking')

    // 1. Health check previo al iframe
    const healthy = await checkHealth()
    if (!healthy) {
      setStatus('offline')
      return
    }

    setStatus('online')

    // 2. Timeout de carga — se cancela en onLoad del iframe
    timeoutRef.current = setTimeout(() => {
      setStatus('timeout')
    }, LOAD_TIMEOUT_MS)
  }, [checkHealth])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initConnection()
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [initConnection])

  const handleIframeLoad = () => {
    // Carga exitosa: cancelar timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('online')

    // 3. Pasar session token al iframe vía postMessage
    if (sessionToken && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'nella:session', token: sessionToken },
        chatwootUrl
      )
    }
  }

  const handleIframeError = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('offline')
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    await initConnection()
    setIsRetrying(false)
  }

  // Estados de fallo (health, timeout, error de red/CORS)
  if (status === 'offline' || status === 'timeout') {
    return <ChatOffline onRetry={handleRetry} isRetrying={isRetrying} />
  }

  return (
    <div className="relative flex flex-1 h-full w-full">
      {/* Skeleton mientras verifica o carga */}
      {status === 'checking' && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Conectando con el chat...</p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        // La URL base se construye server-side y llega como prop
        // El token se pasa vía postMessage en onLoad para evitar exponerlo en la URL
        src={chatwootUrl}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="flex-1 w-full h-full border-0"
        title="Chat Chatwoot"
        allow="microphone; camera; clipboard-write"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
      />
    </div>
  )
}
