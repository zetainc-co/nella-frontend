'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChatOffline } from './chat-offline'

interface ChatwootIframeProps {
  chatwootUrl: string
  sessionToken: string | null
}

type ConnectionStatus = 'checking' | 'online' | 'offline' | 'timeout'

const LOAD_TIMEOUT_MS = 30_000 // Aumentado a 30 segundos para debugging

export function ChatwootIframe({ chatwootUrl, sessionToken }: ChatwootIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const iframeLoadedRef = useRef(false)
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [iframeReady, setIframeReady] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  const checkHealth = useCallback(async () => {
    try {
      console.log('[ChatwootIframe] Checking health...')
      const res = await fetch('/api/chat/chatwoot-health')
      const { healthy } = await res.json()
      console.log('[ChatwootIframe] Health check result:', healthy)
      return healthy as boolean
    } catch (err) {
      console.error('[ChatwootIframe] Health check failed:', err)
      return false
    }
  }, [])

  const initConnection = useCallback(async () => {
    console.log('[ChatwootIframe] initConnection started')
    setStatus('checking')

    // 1. Health check previo al iframe
    const healthy = await checkHealth()
    if (!healthy) {
      console.log('[ChatwootIframe] Health check failed, setting status to offline')
      setStatus('offline')
      return
    }

    console.log('[ChatwootIframe] Health check passed, setting status to online')
    setStatus('online')

    // 2. Clear any previous timeout BEFORE creating new one
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    // 3. Skip timeout if iframe already loaded once (auto-login page loaded,
    //    now waiting for internal redirect to dashboard)
    if (iframeLoadedRef.current) return

    // 4. Timeout de carga — se cancela en onLoad del iframe
    timeoutRef.current = setTimeout(() => {
      console.log('[ChatwootIframe] Load timeout reached')
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
    console.log('[ChatwootIframe] iframe onLoad event fired!')
    // Carga exitosa: cancelar timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    iframeLoadedRef.current = true
    setStatus('online')
    setIframeReady(true)
  }

  const handleIframeError = (e: any) => {
    console.error('[ChatwootIframe] iframe onError event fired:', e)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setStatus('offline')
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    await initConnection()
    setIsRetrying(false)
  }

  console.log('[ChatwootIframe] Rendering, status:', status, 'url:', chatwootUrl)

  return (
    <div className="relative flex flex-1 h-full w-full">
      {/* Overlay de error */}
      {(status === 'offline' || status === 'timeout') && (
        <div className="absolute inset-0 z-20">
          <ChatOffline onRetry={handleRetry} isRetrying={isRetrying} />
        </div>
      )}

      {/* Loading overlay mientras el iframe carga */}
      {!iframeReady && status !== 'offline' && status !== 'timeout' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {/* Subtle radial glow */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(158,255,0,0.06) 0%, transparent 70%)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }} />

          <div className="relative flex flex-col items-center gap-5">
            {/* Animated ring */}
            <div className="relative" style={{ width: 48, height: 48 }}>
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  border: '2px solid rgba(158,255,0,0.08)',
                  borderTopColor: '#9EFF00',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  inset: 6,
                  border: '2px solid rgba(158,255,0,0.05)',
                  borderBottomColor: 'rgba(158,255,0,0.4)',
                  animation: 'spin 1.8s linear infinite reverse',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  inset: 14,
                  background: 'rgba(158,255,0,0.12)',
                }}
              />
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <p className="text-sm font-medium tracking-wide" style={{ color: 'rgba(240,244,255,0.55)' }}>
                Conectando chat
              </p>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 4,
                      height: 4,
                      background: '#9EFF00',
                      opacity: 0.4,
                      animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <style>{`
            @keyframes pulse {
              0%, 80%, 100% { opacity: 0.15; transform: scale(0.8); }
              40% { opacity: 0.8; transform: scale(1.2); }
            }
          `}</style>
        </div>
      )}

      {/* El iframe SIEMPRE se renderiza para debugging */}
      <iframe
        ref={iframeRef}
        src={chatwootUrl}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="flex-1 w-full h-full border-0"
        title="Chat Chatwoot"
        allow="microphone; camera; clipboard-write"
      />
    </div>
  )
}
