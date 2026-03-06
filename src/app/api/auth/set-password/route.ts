import { NextRequest, NextResponse } from 'next/server';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/auth/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { message: 'Error al conectar con el servidor' },
      { status: 500 }
    );
  }
}
