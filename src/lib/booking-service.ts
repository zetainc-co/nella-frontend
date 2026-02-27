import type {
  BookingDataResponse,
  BookingConfirmResponse,
  BookingErrorCode,
} from '@/types/booking';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

function getTenantSlug(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost';
    if (hostname !== 'localhost' && hostname !== appDomain) {
      const subdomain = hostname.split('.')[0];
      if (subdomain) return subdomain;
    }
  }
  return process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN ?? '';
}

export class BookingApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: BookingErrorCode,
  ) {
    super(`Booking API error: ${code} (${status})`);
    this.name = 'BookingApiError';
  }
}

function mapErrorCode(
  status: number,
  errorField: string | undefined,
): BookingErrorCode {
  if (status === 404) {
    if (errorField === 'TENANT_NOT_FOUND') return 'TENANT_NOT_FOUND';
    return 'INVITATION_NOT_FOUND';
  }
  if (status === 410) return 'INVITATION_EXPIRED';
  if (status === 409) return 'SLOT_NOT_AVAILABLE';
  return 'UNKNOWN_ERROR';
}

export async function getBookingData(
  token: string,
): Promise<BookingDataResponse> {
  const tenantSlug = getTenantSlug();
  const headers: Record<string, string> = {};
  if (tenantSlug) headers['X-Tenant-Id'] = tenantSlug;

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/public/book/${token}`, { headers });
  } catch {
    throw new BookingApiError(0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new BookingApiError(response.status, mapErrorCode(response.status, body.error));
  }

  const body = (await response.json()) as { data: BookingDataResponse };
  return body.data;
}

export async function confirmBooking(
  token: string,
  scheduledAt: string,
): Promise<BookingConfirmResponse> {
  const tenantSlug = getTenantSlug();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (tenantSlug) headers['X-Tenant-Id'] = tenantSlug;

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/public/book/${token}/confirm`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ scheduledAt }),
    });
  } catch {
    throw new BookingApiError(0, 'NETWORK_ERROR');
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new BookingApiError(response.status, mapErrorCode(response.status, body.error));
  }

  const body = (await response.json()) as { data: BookingConfirmResponse };
  return body.data;
}
