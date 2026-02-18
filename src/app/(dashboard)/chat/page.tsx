// Server Component — lee variables de entorno server-side
// El iframe y la detección de fallos se delegan al Client Component
import { ChatwootIframe } from '@/components/chat/chatwoot-iframe'

// URL base de Chatwoot: en dev apunta a localhost, en prod al dominio real.
// NUNCA usar NEXT_PUBLIC_ para esta URL — se resuelve solo server-side.
const CHATWOOT_URL = process.env.CHATWOOT_URL ?? 'http://localhost:3000'

export default async function ChatPage() {
  // TODO: cuando auth esté configurado, reemplazar por:
  //   const session = await auth()
  //   const sessionToken = session?.user?.chatToken ?? null
  //
  // El token se pasa como prop y se envía al iframe vía postMessage en onLoad,
  // nunca en la URL ni en el código client-side.
  const sessionToken: string | null = null

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header de sección */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Chat</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Conversaciones de WhatsApp en tiempo real.
          </p>
        </div>
      </div>

      {/* Iframe — ocupa todo el espacio restante */}
      <ChatwootIframe
        chatwootUrl={CHATWOOT_URL}
        sessionToken={sessionToken}
      />
    </div>
  )
}
