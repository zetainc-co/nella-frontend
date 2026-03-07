import { NextRequest, NextResponse } from 'next/server';
import { backendHeaders, unwrapBackend } from '@/core/api/backend-proxy';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const url = `${BACKEND_URL}/tenants/${slug}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: backendHeaders(request),
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
    console.error('[API/tenants GET]', error);
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 });
  }
}
