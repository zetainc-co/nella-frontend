# Auth Login Security Fix — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate the rejected `/auth/global-login` endpoint and fix all security issues flagged in the PR review, leaving a single hardened `/auth/login` endpoint with TenantMiddleware and Repository pattern.

**Architecture:** TenantMiddleware extracts `tenantSlug` from Host header (or `X-Tenant-Id` in dev) and sets `req['tenantSlug']` before the controller runs. `AuthService.login()` uses a `QueryRunner` + `Repository<User>` instead of raw SQL. All failure paths return the same generic `401 'Invalid credentials'`.

**Tech Stack:** NestJS (backend), TypeORM QueryRunner + Repository, bcrypt, Next.js API Routes (frontend)

---

## Repos and Running Servers

- Backend: `nella_backend/` — NestJS on port 3000
- Frontend: `nella-frontend/` — Next.js on port 3001
- Package manager (frontend): **yarn only**
- Commit format: `Tipo|NELLA-31|YYYYMMDD|Description (max 60 chars, English)`

---

## Task 1: Create TenantMiddleware

**Repo:** `nella_backend`

**Files:**
- Create: `src/auth/middleware/tenant.middleware.ts`

**Step 1: Create the middleware directory and file**

Create `nella_backend/src/auth/middleware/tenant.middleware.ts` with this exact content:

```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host') || '';

    // Development fallback: use X-Tenant-Id header if present
    if (process.env.NODE_ENV === 'development') {
      const tenantId = req.get('X-Tenant-Id');
      if (tenantId) {
        req['tenantSlug'] = tenantId;
        return next();
      }
    }

    // Production: extract subdomain from Host header
    // empresa-abc.nella.com → empresa-abc
    const parts = host.split('.');
    if (parts.length >= 2 && parts[0] !== 'localhost') {
      req['tenantSlug'] = parts[0];
    }

    // Always call next() — controller validates req['tenantSlug'] presence
    next();
  }
}
```

**Step 2: Verify the file exists**

```bash
# In nella_backend/
ls src/auth/middleware/
```
Expected: `tenant.middleware.ts`

---

## Task 2: Register TenantMiddleware in AuthModule

**Repo:** `nella_backend`

**Files:**
- Modify: `src/auth/auth.module.ts`

**Step 1: Read current auth.module.ts**

Current content at `nella_backend/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
// ... (JwtModule, PassportModule, etc.)
export class AuthModule {}
```

**Step 2: Replace the entire file with this content**

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TenantModule } from '../tenant/tenant.module';
import { TenantMiddleware } from './middleware/tenant.middleware';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_EXPIRES_IN') || '15m',
        },
      }),
    }),
    TenantModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('auth');
  }
}
```

**Step 3: Verify backend compiles**

```bash
# In nella_backend/
npx nest build --tsc 2>&1 | tail -5
```
Expected: No TypeScript errors. Exit code 0.

---

## Task 3: Refactor AuthController — remove global-login and extractSubdomain

**Repo:** `nella_backend`

**Files:**
- Modify: `src/auth/auth.controller.ts`

**Step 1: Replace the entire file with this content**

```typescript
import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login endpoint — tenant resolved by TenantMiddleware via Host header
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() request: Request) {
    const tenantSlug = request['tenantSlug'] as string | undefined;

    if (!tenantSlug) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.authService.login(dto, tenantSlug);

    return {
      success: true,
      message: 'Login successful',
      data: result,
    };
  }
}
```

Note: `globalLogin` endpoint and private `extractSubdomain()` method are gone. The controller now only reads `req['tenantSlug']` set by the middleware.

**Step 2: Verify backend compiles**

```bash
# In nella_backend/
npx nest build --tsc 2>&1 | tail -5
```
Expected: No errors.

---

## Task 4: Refactor AuthService — remove globalLogin, use QueryRunner + Repository

**Repo:** `nella_backend`

**Files:**
- Modify: `src/auth/auth.service.ts`

**Step 1: Replace the entire file with this content**

```typescript
import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TenantService } from '../tenant/tenant.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { User } from '../common/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantService: TenantService,
  ) {}

  /**
   * Login with tenant resolved from subdomain
   * Password is only used in bcrypt.compare — never logged, never passed between methods
   */
  async login(dto: LoginDto, tenantSlug: string) {
    this.logger.log(`Login attempt on subdomain: ${tenantSlug}`);

    let qr: QueryRunner | null = null;

    try {
      // 1. Find tenant — wrap in try/catch to return generic error
      let tenant: any;
      try {
        tenant = await this.tenantService.findBySlug(tenantSlug);
      } catch {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (tenant.status !== 'active') {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 2. Connect to tenant schema via QueryRunner
      const schemaName = tenant.schema_name;
      qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.query(`SET search_path TO "${schemaName}"`);

      // 3. Find user via Repository (typed, no raw SQL)
      const userRepo = qr.manager.getRepository(User);
      const user = await userRepo.findOne({ where: { email: dto.email } });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 4. Validate password — dto.password ONLY used here
      const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 5. Generate tokens
      const accessToken = await this.generateAccessToken(user, tenant);
      const refreshToken = await this.generateRefreshToken(user, tenant);

      this.logger.log(`✅ Login successful for tenant: ${tenantSlug}`);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
      };
    } finally {
      if (qr) await qr.release();
    }
  }

  /**
   * Validate JWT payload — called by JwtStrategy on every authenticated request
   */
  async validateUser(payload: JwtPayload): Promise<any> {
    let qr: QueryRunner | null = null;

    try {
      let tenant: any;
      try {
        tenant = await this.tenantService.findById(payload.tenantId);
      } catch {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (tenant.status !== 'active') {
        throw new UnauthorizedException('Invalid credentials');
      }

      qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.query(`SET search_path TO "${tenant.schema_name}"`);

      const userRepo = qr.manager.getRepository(User);
      const user = await userRepo.findOne({ where: { id: payload.sub } });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid credentials');
      }

      return {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: payload.tenantId,
        tenantSlug: payload.tenantSlug,
      };
    } finally {
      if (qr) await qr.release();
    }
  }

  /**
   * Generate Access Token (15 min)
   */
  private async generateAccessToken(user: User, tenant: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      role: user.role,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
    });
  }

  /**
   * Generate Refresh Token (7 days)
   */
  private async generateRefreshToken(user: User, tenant: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      role: user.role,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });
  }
}
```

**Step 2: Verify backend compiles**

```bash
# In nella_backend/
npx nest build --tsc 2>&1 | tail -5
```
Expected: No TypeScript errors.

**Step 3: Commit backend changes**

```bash
# In nella_backend/
git add src/auth/auth.service.ts \
        src/auth/auth.controller.ts \
        src/auth/auth.module.ts \
        src/auth/middleware/tenant.middleware.ts
git commit -m "$(cat <<'EOF'
fix|NELLA-31|20260218|Remove global-login, add TenantMiddleware, Repository pattern

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Simplify Frontend API Route

**Repo:** `nella-frontend`

**Files:**
- Modify: `src/app/api/auth/login/route.ts`

**Step 1: Replace the entire file with this content**

```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const { email, password, tenantSlug } = await request.json()

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (tenantSlug) headers['X-Tenant-Id'] = tenantSlug

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Credenciales inválidas' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/auth/login] Error:', error)
    return NextResponse.json(
      { error: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.' },
      { status: 503 }
    )
  }
}
```

Removed: `isGlobal` branch, `/auth/global-login` reference. Always calls `/auth/login`.

**Step 2: Verify frontend builds**

```bash
# In nella-frontend/
yarn build 2>&1 | tail -10
```
Expected: `✓ Compiled successfully` or `Done in X.XXs` with no errors.

**Step 3: Commit frontend changes**

```bash
# In nella-frontend/
git add src/app/api/auth/login/route.ts
git commit -m "$(cat <<'EOF'
fix|NELLA-31|20260218|Remove global-login route, always call /auth/login

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Manual Testing (with both servers running)

Both servers must be running before these tests:
- Backend: `npm run start:dev` in `nella_backend/`
- Frontend: `yarn dev` in `nella-frontend/`

### Test 1 — No subdomain, no X-Tenant-Id header → expect 401

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}' | jq .
```
Expected:
```json
{ "statusCode": 401, "message": "Invalid credentials" }
```

### Test 2 — With X-Tenant-Id header (dev mode) → expect 401 with wrong creds

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: <your-tenant-slug>" \
  -d '{"email":"wrong@email.com","password":"wrongpass"}' | jq .
```
Expected:
```json
{ "statusCode": 401, "message": "Invalid credentials" }
```

### Test 3 — With X-Tenant-Id header + valid credentials → expect 200 + tokens

```bash
curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Id: <your-tenant-slug>" \
  -d '{"email":"<valid-email>","password":"<valid-password>"}' | jq .
```
Expected:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "user": { "id": "...", "email": "...", "fullName": "...", "role": "..." },
    "tenant": { "id": "...", "name": "...", "slug": "..." }
  }
}
```

### Test 4 — Global-login endpoint is gone → expect 404

```bash
curl -s -X POST http://localhost:3000/auth/global-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}' | jq .
```
Expected:
```json
{ "statusCode": 404, "message": "Cannot POST /auth/global-login" }
```

### Test 5 — Frontend login at localhost:3001

Open `http://localhost:3001/login` in browser. Enter valid credentials.
- With `X-Tenant-Id` sent from frontend (if `tenantSlug` is in form state) → login works
- Check browser Network tab: request goes to `/api/auth/login` → backend `/auth/login` — NO `/auth/global-login` anywhere

---

## Task 7: Final Verification and Evidence

**Step 1: Check no reference to global-login remains in backend**

```bash
# In nella_backend/
grep -r "global-login\|globalLogin" src/
```
Expected: No output (zero matches).

**Step 2: Check no reference to global-login remains in frontend**

```bash
# In nella-frontend/
grep -r "global-login\|globalLogin" src/
```
Expected: No output (zero matches).

**Step 3: Backend server starts clean**

```bash
# In nella_backend/
npm run start:dev 2>&1 | head -20
```
Expected: `[Nest] Application is running on: http://[::1]:3000`

**Step 4: Save evidence**

Screenshot or copy the successful curl output from Test 3 and save as:
`docs/Evidencias/backend/20260218-fix-remove-global-login-auth.txt`

---

## Summary of Changes

| File | Change |
|------|--------|
| `nella_backend/src/auth/middleware/tenant.middleware.ts` | **Created** — NestMiddleware, extracts tenantSlug from Host / X-Tenant-Id |
| `nella_backend/src/auth/auth.module.ts` | Implements NestModule, registers TenantMiddleware for `auth/*` |
| `nella_backend/src/auth/auth.controller.ts` | Removed `globalLogin()` endpoint + `extractSubdomain()`. Reads `req['tenantSlug']` |
| `nella_backend/src/auth/auth.service.ts` | Removed `globalLogin()`. Refactored `login()` + `validateUser()` to QueryRunner + Repository<User>. Password only in bcrypt.compare |
| `nella-frontend/src/app/api/auth/login/route.ts` | Removed global-login branch. Always calls `/auth/login` |
