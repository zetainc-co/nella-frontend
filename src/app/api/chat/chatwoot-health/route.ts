import { NextResponse } from 'next/server'

const CHATWOOT_URL = process.env.CHATWOOT_URL ?? 'http://localhost:3000'

// GET /api/chat/chatwoot-health
// Proxy health check server-side para evitar CORS desde el browser
export async function GET() {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(`${CHATWOOT_URL}/auth/sign_in`, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeout)

    // Chatwoot devuelve 200 o 401 en rutas protegidas — ambos indican que el server está vivo
    if (res.status < 500) {
      return NextResponse.json({ healthy: true }, { status: 200 })
    }

    return NextResponse.json({ healthy: false }, { status: 503 })
  } catch {
    return NextResponse.json({ healthy: false }, { status: 503 })
  }
}
