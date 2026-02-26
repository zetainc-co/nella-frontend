import { NextResponse } from 'next/server'

const CHATWOOT_URL = process.env.CHATWOOT_URL ?? 'http://localhost:4000'

// GET /api/chat/chatwoot-health
// Proxy health check server-side para evitar CORS desde el browser
export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`${CHATWOOT_URL}/auth/sign_in`, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'manual', // No seguir redirects, solo verificar que responde
    })

    clearTimeout(timeout)

    // Cualquier respuesta < 500 indica que Chatwoot está vivo
    // (302, 200, 401, etc. son todos válidos)
    if (res.status < 500) {
      return NextResponse.json({ healthy: true }, { status: 200 })
    }

    return NextResponse.json({ healthy: false }, { status: 503 })
  } catch {
    return NextResponse.json({ healthy: false }, { status: 503 })
  }
}
