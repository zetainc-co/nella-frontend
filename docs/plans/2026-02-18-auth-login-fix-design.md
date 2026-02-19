# Auth Login Fix — Security Design

**Date:** 2026-02-18
**Reason:** PR rejected — critical security vulnerabilities in `/auth/global-login`
**Approach:** Option B — Full PR compliance (delete global-login + TenantMiddleware + Repository pattern)

---

## Problem Summary

The PR introduced `/auth/global-login` which violated multi-tenant isolation:
- Timing attacks: reveals which tenant has a given email
- Brute force amplified: O(n) queries across all active tenants
- Raw SQL via `dataSource.query()` throughout auth service
- Password DTO passed between methods risking accidental logging

---

## Architecture

### Request Flow (after fix)

```
POST /auth/login
  ↓
TenantMiddleware (NestJS NestMiddleware)
  → Host header → extract subdomain
  → Dev fallback: X-Tenant-Id header
  → No subdomain → 401 'Invalid credentials' (stop here)
  → Sets req['tenantSlug'] = slug
  ↓
AuthController.login(dto, req)
  → reads req['tenantSlug']
  → delegates to authService.login(dto, tenantSlug)
  ↓
AuthService.login(dto, tenantSlug)
  → tenantService.findBySlug(tenantSlug)
  → QueryRunner: SET search_path TO "<schema_name>"
  → repository.findOne({ where: { email: dto.email } })
  → bcrypt.compare(dto.password, user.password_hash)
  → generate accessToken + refreshToken
  → return { accessToken, refreshToken, user, tenant }
```

---

## Files Changed

### Backend — `nella_backend`

| File | Action |
|------|--------|
| `src/auth/auth.controller.ts` | Delete `globalLogin()` endpoint + private `extractSubdomain()` |
| `src/auth/auth.service.ts` | Delete `globalLogin()` + refactor `login()` and `validateUser()` to QueryRunner + Repository<User> |
| `src/auth/middleware/tenant.middleware.ts` | **New** — NestMiddleware, extracts subdomain from Host header |
| `src/auth/auth.module.ts` | Register TenantMiddleware via MiddlewareConsumer for `auth/*` routes |

### Frontend — `nella-frontend`

| File | Action |
|------|--------|
| `src/app/api/auth/login/route.ts` | Remove global-login branch — always call `/auth/login` |

---

## Password Handling

`dto.password` is only ever used in `bcrypt.compare()` and **never logged, never passed to another method**. Logger only logs `dto.email`.

```typescript
// ✅ Safe
const isValid = await bcrypt.compare(dto.password, user.password_hash);
if (!isValid) throw new UnauthorizedException('Invalid credentials');
// dto.password does not appear anywhere else
```

---

## Error Messages — Generic for all failures

All auth failure paths return the same message to prevent tenant/user enumeration:

| Scenario | Response |
|----------|----------|
| No subdomain | `401 'Invalid credentials'` |
| Tenant not found | `401 'Invalid credentials'` |
| Tenant inactive | `401 'Invalid credentials'` |
| User not found | `401 'Invalid credentials'` |
| User inactive | `401 'Invalid credentials'` |
| Wrong password | `401 'Invalid credentials'` |

---

## TenantMiddleware — Key Implementation

```typescript
// src/auth/middleware/tenant.middleware.ts
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host') || '';

    if (process.env.NODE_ENV === 'development') {
      const tenantId = req.get('X-Tenant-Id');
      if (tenantId) {
        req['tenantSlug'] = tenantId;
        return next();
      }
    }

    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      req['tenantSlug'] = parts[0];
    }

    next(); // Controller validates presence of req['tenantSlug']
  }
}
```

---

## Repository Pattern — Key Implementation

```typescript
// auth.service.ts login() — replaces dataSource.query() raw SQL
const qr = this.dataSource.createQueryRunner();
await qr.connect();
await qr.query(`SET search_path TO "${schemaName}"`);
const userRepo = qr.manager.getRepository(User);
const user = await userRepo.findOne({ where: { email: dto.email } });
await qr.release();
```

---

## Frontend Route Simplification

```typescript
// route.ts — AFTER
const headers: Record<string, string> = { 'Content-Type': 'application/json' };
if (tenantSlug) headers['X-Tenant-Id'] = tenantSlug;

const response = await fetch(`${BACKEND_URL}/auth/login`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ email, password }),
});
```

No more branching to `/auth/global-login`.
