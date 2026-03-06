import { NextRequest, NextResponse } from 'next/server';
import { backendHeaders, unwrapBackend } from '@/core/api/backend-proxy';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/users/me`, {
      method: 'PATCH',
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    });

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid response from backend' },
        { status: response.status || 502 },
      );
    }

    if (!response.ok) {
      const message = (data as { message?: string })?.message ?? 'Backend error';
      return NextResponse.json({ error: message }, { status: response.status });
    }

    return NextResponse.json(unwrapBackend(data), { status: 200 });
  } catch (error) {
    console.error('[API/users/me PATCH]', error);
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 });
  }
}
