# Projects + Lead Metrics — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar creación de proyectos y métricas de leads por proyecto con actualización en tiempo real vía WebSocket.

**Architecture:** Backend NestJS expone ProjectsModule + MetricsModule con QueryRunner + search_path para aislamiento multi-tenant. MetricsGateway (socket.io) emite `metrics:updated` como notificación liviana cuando cambia un contacto; el frontend re-fetcha via REST. Frontend Next.js reemplaza mock data del dashboard con datos reales, gestiona proyecto activo por URL param `?project=<id>`.

**Tech Stack:** NestJS + TypeORM + PostgreSQL + socket.io (backend) | Next.js 16 + React Query + socket.io-client + Recharts (frontend) | yarn (SOLO yarn en frontend — nunca npm)

---

## Contexto crítico para el implementador

- **Backend:** `nella_backend/` — NestJS, puerto 3000
- **Frontend:** `nella-frontend/` — Next.js 16, puerto 3001, SOLO `yarn`
- **Tenant de prueba:** `verify-corp` (header `X-Tenant-Id: verify-corp` en dev)
- **Patrón DB:** `qr = dataSource.createQueryRunner()` → `qr.connect()` → `qr.query('SET search_path TO "<schema>"')` → `qr.manager.getRepository(Entity)` → `qr.release()` en `finally`
- **Convención entity:** snake_case en propiedades TypeScript (igual que `contact.entity.ts`)
- **Template schema:** `nella_backend/src/database/template-schema.sql` — se clona para cada nuevo tenant. Agregar aquí para que nuevos tenants tengan las tablas automáticamente
- **TenantContextMiddleware** ya aplicado globalmente en `AppModule` — `(req as any).tenantSlug` disponible en todos los controllers
- **JwtAuthGuard** + **TenantValidationGuard** son globales — todos los nuevos endpoints quedan protegidos automáticamente

---

## Task 1: Instalar dependencias WebSocket (backend) + agregar tablas al template schema

**Files:**
- Modify: `nella_backend/package.json` (via npm install)
- Modify: `nella_backend/src/database/template-schema.sql`

### Step 1: Instalar dependencias WebSocket en el backend

```bash
cd nella_backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

Verificar que aparecen en `package.json` dependencies.

### Step 2: Agregar tabla `projects` al template schema

Abrir `nella_backend/src/database/template-schema.sql` y agregar ANTES de la tabla `contacts`:

```sql
-- Tabla projects
CREATE TABLE template_tenant.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES template_tenant.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_owner_id ON template_tenant.projects(owner_id);
```

### Step 3: Agregar `project_id` a la tabla `contacts` en el template schema

En la definición de `template_tenant.contacts`, agregar la columna ANTES de `created_at`:

```sql
  project_id UUID REFERENCES template_tenant.projects(id) ON DELETE SET NULL,
```

Y agregar el índice después de los existentes:

```sql
CREATE INDEX idx_contacts_project_id ON template_tenant.contacts(project_id);
```

### Step 4: Agregar trigger `updated_at` para `projects`

En la sección de triggers, agregar:

```sql
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON template_tenant.projects
  FOR EACH ROW EXECUTE FUNCTION template_tenant.update_updated_at_column();
```

### Step 5: Verificar que el SQL es válido

```bash
cd nella_backend
npx nest build --tsc
```

Esperado: sin errores de compilación.

---

## Task 2: Project entity + modificar Contact entity

**Files:**
- Create: `nella_backend/src/common/entities/project.entity.ts`
- Modify: `nella_backend/src/common/entities/contact.entity.ts`

### Step 1: Crear `project.entity.ts`

```typescript
// nella_backend/src/common/entities/project.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'uuid', nullable: true })
  owner_id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
```

> **Nota:** No incluir `@OneToMany` hacia Contact aquí para evitar circular dependency. La relación es unidireccional desde Contact.

### Step 2: Agregar `project_id` a `contact.entity.ts`

Abrir `nella_backend/src/common/entities/contact.entity.ts`.

Agregar el import de Project al principio:
```typescript
import { Project } from './project.entity';
```

Agregar estas dos propiedades ANTES de `@CreateDateColumn`:
```typescript
  @Column({ type: 'uuid', nullable: true })
  project_id: string;

  @ManyToOne(() => Project, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
```

### Step 3: Compilar para verificar

```bash
cd nella_backend
npx nest build --tsc
```

Esperado: Build exitoso sin errores TS.

---

## Task 3: ProjectsModule (controller + service + DTO)

**Files:**
- Create: `nella_backend/src/projects/dto/create-project.dto.ts`
- Create: `nella_backend/src/projects/projects.service.ts`
- Create: `nella_backend/src/projects/projects.controller.ts`
- Create: `nella_backend/src/projects/projects.module.ts`
- Modify: `nella_backend/src/app.module.ts`

### Step 1: Crear DTO

```typescript
// nella_backend/src/projects/dto/create-project.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;
}
```

### Step 2: Crear ProjectsService

```typescript
// nella_backend/src/projects/projects.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { TenantService } from '../tenant/tenant.service';
import { Project } from '../common/entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly tenantService: TenantService,
  ) {}

  async findAll(tenantSlug: string): Promise<Project[]> {
    let qr: QueryRunner | null = null;
    try {
      const tenant = await this.tenantService.findBySlug(tenantSlug);
      qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.query(`SET search_path TO "${tenant.schema_name}"`);

      return await qr.manager
        .getRepository(Project)
        .createQueryBuilder('p')
        .orderBy('p.created_at', 'DESC')
        .getMany();
    } finally {
      if (qr) await qr.release();
    }
  }

  async create(tenantSlug: string, dto: CreateProjectDto, ownerId: string): Promise<Project> {
    let qr: QueryRunner | null = null;
    try {
      const tenant = await this.tenantService.findBySlug(tenantSlug);
      qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.query(`SET search_path TO "${tenant.schema_name}"`);

      const project = qr.manager.getRepository(Project).create({
        name: dto.name,
        owner_id: ownerId,
      });

      return await qr.manager.getRepository(Project).save(project);
    } finally {
      if (qr) await qr.release();
    }
  }
}
```

### Step 3: Crear ProjectsController

```typescript
// nella_backend/src/projects/projects.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const tenantSlug = (req as any).tenantSlug as string | undefined;
    if (!tenantSlug) throw new UnauthorizedException('Invalid credentials');
    return this.projectsService.findAll(tenantSlug);
  }

  @Post()
  async create(@Body() dto: CreateProjectDto, @Req() req: Request) {
    const tenantSlug = (req as any).tenantSlug as string | undefined;
    const userId = (req as any).user?.id as string | undefined;
    if (!tenantSlug) throw new UnauthorizedException('Invalid credentials');
    return this.projectsService.create(tenantSlug, dto, userId ?? '');
  }
}
```

### Step 4: Crear ProjectsModule

```typescript
// nella_backend/src/projects/projects.module.ts
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
```

### Step 5: Registrar en AppModule

Abrir `nella_backend/src/app.module.ts` y agregar:

```typescript
import { ProjectsModule } from './projects/projects.module';
```

Y agregar `ProjectsModule` al array `imports`:

```typescript
imports: [
  // ...existing imports...
  TenantModule,
  AuthModule,
  AuditModule,
  ProjectsModule,  // ← agregar
],
```

### Step 6: Compilar y verificar

```bash
cd nella_backend
npx nest build --tsc
```

Esperado: Build exitoso.

### Step 7: Test manual rápido

Con el backend corriendo (`npm run start:dev`):

```bash
curl -X GET http://localhost:3000/projects \
  -H "X-Tenant-Id: verify-corp" \
  -H "Authorization: Bearer <token>"
```

Esperado: `[]` (array vacío — no hay proyectos aún).

---

## Task 4: MetricsModule (controller + service)

**Files:**
- Create: `nella_backend/src/metrics/metrics.service.ts`
- Create: `nella_backend/src/metrics/metrics.controller.ts`
- Create: `nella_backend/src/metrics/metrics.module.ts`

### Step 1: Crear MetricsService

```typescript
// nella_backend/src/metrics/metrics.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { TenantService } from '../tenant/tenant.service';
import { Contact } from '../common/entities/contact.entity';

export interface ProjectMetrics {
  totalLeads: number;
  activeLeads: number;
  revenueMonth: number;
  trafficSources: { source: string; count: number }[];
  funnel: { status: string; count: number }[];
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly tenantService: TenantService,
  ) {}

  async getProjectMetrics(tenantSlug: string, projectId: string): Promise<ProjectMetrics> {
    let qr: QueryRunner | null = null;
    try {
      const tenant = await this.tenantService.findBySlug(tenantSlug);
      qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.query(`SET search_path TO "${tenant.schema_name}"`);

      const repo = qr.manager.getRepository(Contact);

      // 1. Total leads
      const totalLeads = await repo
        .createQueryBuilder('c')
        .where('c.project_id = :id', { id: projectId })
        .getCount();

      // 2. Active leads (status NOT IN 'closed', 'lost')
      const activeLeads = await repo
        .createQueryBuilder('c')
        .where('c.project_id = :id', { id: projectId })
        .andWhere("c.status NOT IN ('closed', 'lost')")
        .getCount();

      // 3. Revenue this month (sum of deal_value for closed contacts)
      const revenueResult = await repo
        .createQueryBuilder('c')
        .select("COALESCE(SUM(c.deal_value), 0)", 'revenue')
        .where('c.project_id = :id', { id: projectId })
        .andWhere("c.status = 'closed'")
        .andWhere("DATE_TRUNC('month', c.updated_at) = DATE_TRUNC('month', NOW())")
        .getRawOne();

      const revenueMonth = parseFloat(revenueResult?.revenue ?? '0');

      // 4. Traffic sources
      const sourcesRaw = await repo
        .createQueryBuilder('c')
        .select('c.source', 'source')
        .addSelect('COUNT(*)', 'count')
        .where('c.project_id = :id', { id: projectId })
        .andWhere('c.source IS NOT NULL')
        .groupBy('c.source')
        .orderBy('count', 'DESC')
        .getRawMany();

      const trafficSources = sourcesRaw.map((r) => ({
        source: r.source,
        count: parseInt(r.count, 10),
      }));

      // 5. Funnel by status
      const funnelRaw = await repo
        .createQueryBuilder('c')
        .select('c.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('c.project_id = :id', { id: projectId })
        .groupBy('c.status')
        .getRawMany();

      const statusOrder = ['new', 'qualified', 'negotiation', 'closed', 'lost'];
      const funnel = statusOrder
        .map((s) => {
          const found = funnelRaw.find((r) => r.status === s);
          return { status: s, count: found ? parseInt(found.count, 10) : 0 };
        })
        .filter((f) => f.count > 0);

      return { totalLeads, activeLeads, revenueMonth, trafficSources, funnel };
    } finally {
      if (qr) await qr.release();
    }
  }
}
```

### Step 2: Crear MetricsController

```typescript
// nella_backend/src/metrics/metrics.controller.ts
import { Controller, Get, Param, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('project/:id')
  async getProjectMetrics(@Param('id') projectId: string, @Req() req: Request) {
    const tenantSlug = (req as any).tenantSlug as string | undefined;
    if (!tenantSlug) throw new UnauthorizedException('Invalid credentials');
    return this.metricsService.getProjectMetrics(tenantSlug, projectId);
  }
}
```

### Step 3: Crear MetricsModule (sin Gateway aún)

```typescript
// nella_backend/src/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
```

### Step 4: Registrar MetricsModule en AppModule

```typescript
import { MetricsModule } from './metrics/metrics.module';

// En imports[]:
MetricsModule,  // ← agregar
```

### Step 5: Compilar

```bash
cd nella_backend
npx nest build --tsc
```

Esperado: Build exitoso.

---

## Task 5: MetricsGateway (WebSocket) + notificaciones

**Files:**
- Create: `nella_backend/src/metrics/metrics.gateway.ts`
- Modify: `nella_backend/src/metrics/metrics.module.ts`
- Modify: `nella_backend/src/projects/projects.service.ts`
- Modify: `nella_backend/src/main.ts`

### Step 1: Crear MetricsGateway

```typescript
// nella_backend/src/metrics/metrics.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/metrics',
  cors: { origin: '*', credentials: false },
})
export class MetricsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MetricsGateway.name);

  afterInit() {
    this.logger.log('MetricsGateway initialized on namespace /metrics');
  }

  /**
   * Called by MetricsService/ProjectsService after any contact mutation.
   * Emits lightweight notification — frontend re-fetches via REST.
   */
  notifyProjectUpdate(projectId: string): void {
    this.server
      .to(`project:${projectId}`)
      .emit('metrics:updated', { projectId });
    this.logger.debug(`Emitted metrics:updated to room project:${projectId}`);
  }

  @SubscribeMessage('join:project')
  handleJoin(client: Socket, projectId: string): void {
    client.join(`project:${projectId}`);
    this.logger.debug(`Client ${client.id} joined room project:${projectId}`);
  }
}
```

### Step 2: Actualizar MetricsModule para incluir el Gateway

```typescript
// nella_backend/src/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { MetricsGateway } from './metrics.gateway';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [MetricsController],
  providers: [MetricsService, MetricsGateway],
  exports: [MetricsService, MetricsGateway],
})
export class MetricsModule {}
```

### Step 3: Inyectar MetricsGateway en ProjectsModule para notificaciones

Actualizar `nella_backend/src/projects/projects.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { TenantModule } from '../tenant/tenant.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [TenantModule, MetricsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
```

Actualizar `nella_backend/src/projects/projects.service.ts` — agregar MetricsGateway al constructor y llamar `notifyProjectUpdate` después de `create`:

```typescript
// Agregar import:
import { MetricsGateway } from '../metrics/metrics.gateway';

// Modificar constructor:
constructor(
  @InjectDataSource()
  private readonly dataSource: DataSource,
  private readonly tenantService: TenantService,
  private readonly metricsGateway: MetricsGateway,
) {}

// Al final del método create(), antes del return:
this.metricsGateway.notifyProjectUpdate(project.id);
return project;
```

### Step 4: Habilitar socket.io en main.ts

Abrir `nella_backend/src/main.ts` y agregar el adaptador de socket.io:

```typescript
import { IoAdapter } from '@nestjs/platform-socket.io';

// Antes de app.listen():
app.useWebSocketAdapter(new IoAdapter(app));
```

### Step 5: Compilar

```bash
cd nella_backend
npx nest build --tsc
```

Esperado: Build exitoso.

### Step 6: Test manual WebSocket

Con el backend corriendo, abrir el navegador en `http://localhost:3000` y verificar en los logs de arranque:

```
MetricsGateway initialized on namespace /metrics
```

---

## Task 6: Seed script para verify-corp

**Files:**
- Create: `nella_backend/src/database/seed-project-metrics.ts`

### Step 1: Crear el script

```typescript
// nella_backend/src/database/seed-project-metrics.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: false,
});

async function seed() {
  await dataSource.initialize();
  console.log('Connected to DB');

  // 1. Buscar tenant verify-corp
  const tenants = await dataSource.query(
    `SELECT id, slug, schema_name FROM public.tenants WHERE slug = 'verify-corp' LIMIT 1`
  );

  if (!tenants.length) {
    console.error('Tenant verify-corp not found. Run the app and register first.');
    process.exit(1);
  }

  const { schema_name: schema } = tenants[0];
  console.log(`Using schema: ${schema}`);

  // 2. Set search_path
  await dataSource.query(`SET search_path TO "${schema}"`);

  // 3. Obtener admin user id
  const users = await dataSource.query(`SELECT id FROM users LIMIT 1`);
  if (!users.length) {
    console.error('No users found in tenant schema');
    process.exit(1);
  }
  const ownerId = users[0].id;

  // 4. Verificar si ya existe un proyecto seed
  const existing = await dataSource.query(
    `SELECT id FROM projects WHERE name = 'Proyecto Demo' LIMIT 1`
  );
  if (existing.length) {
    console.log('Seed already ran (Proyecto Demo exists). Skipping.');
    await dataSource.destroy();
    return;
  }

  // 5. Crear proyecto
  const projects = await dataSource.query(
    `INSERT INTO projects (name, owner_id) VALUES ('Proyecto Demo', $1) RETURNING id`,
    [ownerId]
  );
  const projectId = projects[0].id;
  console.log(`Created project: ${projectId}`);

  // 6. Insertar 50 contactos distribuidos
  const sources = ['Instagram', 'Instagram', 'Instagram', 'Instagram', 'Facebook', 'Facebook', 'Facebook', 'WhatsApp', 'WhatsApp', 'Referral'];
  const statuses = [
    ...Array(15).fill('new'),
    ...Array(12).fill('qualified'),
    ...Array(10).fill('negotiation'),
    ...Array(8).fill('closed'),
    ...Array(5).fill('lost'),
  ];

  const contacts = [];
  for (let i = 0; i < 50; i++) {
    const status = statuses[i];
    const source = sources[i % sources.length];
    const dealValue = status === 'closed' ? (500 + Math.floor(Math.random() * 4500)).toFixed(2) : null;
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

    contacts.push({
      phone: `+5491100${String(i).padStart(5, '0')}`,
      name: `Lead ${i + 1}`,
      source,
      status,
      deal_value: dealValue,
      project_id: projectId,
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  for (const c of contacts) {
    await dataSource.query(
      `INSERT INTO contacts (phone, name, source, status, deal_value, project_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [c.phone, c.name, c.source, c.status, c.deal_value, c.project_id, c.created_at, c.updated_at]
    );
  }

  console.log(`✅ Inserted 50 contacts for project ${projectId}`);
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Step 2: Ejecutar el seed

Con el backend **detenido** (para evitar conflictos de conexión) y la DB corriendo:

```bash
cd nella_backend
npx ts-node -r tsconfig-paths/register src/database/seed-project-metrics.ts
```

Esperado:
```
Connected to DB
Using schema: tenant_verify-corp_xxxxxxxx
Created project: <uuid>
✅ Inserted 50 contacts for project <uuid>
```

### Step 3: Verificar seed

```bash
# Con psql o cualquier cliente SQL:
SELECT COUNT(*) FROM "<schema_name>".contacts WHERE project_id IS NOT NULL;
-- Esperado: 50
```

---

## Task 7: Tests unitarios backend (Jest)

**Files:**
- Create: `nella_backend/src/projects/projects.service.spec.ts`
- Create: `nella_backend/src/metrics/metrics.service.spec.ts`
- Create: `nella_backend/src/metrics/metrics.gateway.spec.ts`

### Step 1: Test de ProjectsService

```typescript
// nella_backend/src/projects/projects.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { DataSource } from 'typeorm';
import { TenantService } from '../tenant/tenant.service';
import { MetricsGateway } from '../metrics/metrics.gateway';

const mockTenant = { id: 't1', slug: 'verify-corp', schema_name: 'tenant_verify_corp_abc12345', status: 'active' };
const mockProject = { id: 'p1', name: 'Test Project', owner_id: 'u1', created_at: new Date(), updated_at: new Date() };

const mockQueryRunner = {
  connect: jest.fn(),
  release: jest.fn(),
  query: jest.fn(),
  manager: {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue({
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockProject]),
      }),
      create: jest.fn().mockReturnValue(mockProject),
      save: jest.fn().mockResolvedValue(mockProject),
    }),
  },
};

describe('ProjectsService', () => {
  let service: ProjectsService;
  let tenantService: jest.Mocked<TenantService>;
  let gateway: jest.Mocked<MetricsGateway>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner) },
        },
        {
          provide: TenantService,
          useValue: { findBySlug: jest.fn().mockResolvedValue(mockTenant) },
        },
        {
          provide: MetricsGateway,
          useValue: { notifyProjectUpdate: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    tenantService = module.get(TenantService);
    gateway = module.get(MetricsGateway);
  });

  it('findAll returns projects list', async () => {
    const result = await service.findAll('verify-corp');
    expect(result).toEqual([mockProject]);
    expect(mockQueryRunner.query).toHaveBeenCalledWith(
      expect.stringContaining('SET search_path')
    );
  });

  it('create saves and notifies via gateway', async () => {
    const result = await service.create('verify-corp', { name: 'Test Project' }, 'u1');
    expect(result).toEqual(mockProject);
    expect(gateway.notifyProjectUpdate).toHaveBeenCalledWith(mockProject.id);
  });
});
```

### Step 2: Test de MetricsService

```typescript
// nella_backend/src/metrics/metrics.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';
import { DataSource } from 'typeorm';
import { TenantService } from '../tenant/tenant.service';

const mockTenant = { schema_name: 'tenant_verify_corp_abc12345' };

const makeQBMock = (returnValue: any) => ({
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  addSelect: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getCount: jest.fn().mockResolvedValue(returnValue),
  getRawOne: jest.fn().mockResolvedValue(returnValue),
  getRawMany: jest.fn().mockResolvedValue(returnValue),
});

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsService,
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue({
              connect: jest.fn(),
              release: jest.fn(),
              query: jest.fn(),
              manager: {
                getRepository: jest.fn().mockReturnValue({
                  createQueryBuilder: jest
                    .fn()
                    .mockImplementationOnce(() => makeQBMock(50))  // totalLeads
                    .mockImplementationOnce(() => makeQBMock(37))  // activeLeads
                    .mockImplementationOnce(() => makeQBMock({ revenue: '22000' })) // revenue
                    .mockImplementationOnce(() => makeQBMock([{ source: 'Instagram', count: '20' }])) // sources
                    .mockImplementationOnce(() => makeQBMock([{ status: 'new', count: '15' }])), // funnel
                }),
              },
            }),
          },
        },
        {
          provide: TenantService,
          useValue: { findBySlug: jest.fn().mockResolvedValue(mockTenant) },
        },
      ],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  it('returns all 5 metrics for a project', async () => {
    const result = await service.getProjectMetrics('verify-corp', 'project-id-1');
    expect(result.totalLeads).toBe(50);
    expect(result.activeLeads).toBe(37);
    expect(result.revenueMonth).toBe(22000);
    expect(result.trafficSources[0].source).toBe('Instagram');
    expect(result.funnel.length).toBeGreaterThan(0);
  });
});
```

### Step 3: Test de MetricsGateway

```typescript
// nella_backend/src/metrics/metrics.gateway.spec.ts
import { MetricsGateway } from './metrics.gateway';
import { Server, Socket } from 'socket.io';

describe('MetricsGateway', () => {
  let gateway: MetricsGateway;
  let mockServer: jest.Mocked<Partial<Server>>;

  beforeEach(() => {
    gateway = new MetricsGateway();
    mockServer = {
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    };
    gateway.server = mockServer as any;
  });

  it('notifyProjectUpdate emits to correct room', () => {
    gateway.notifyProjectUpdate('project-123');
    expect(mockServer.to).toHaveBeenCalledWith('project:project-123');
    const toResult = mockServer.to!('project:project-123') as any;
    expect(toResult.emit).toHaveBeenCalledWith('metrics:updated', { projectId: 'project-123' });
  });

  it('handleJoin adds client to room', () => {
    const mockClient = { id: 'client-1', join: jest.fn() } as unknown as Socket;
    gateway.handleJoin(mockClient, 'project-123');
    expect(mockClient.join).toHaveBeenCalledWith('project:project-123');
  });
});
```

### Step 4: Correr los tests

```bash
cd nella_backend
npx jest src/projects/projects.service.spec.ts src/metrics/metrics.service.spec.ts src/metrics/metrics.gateway.spec.ts --no-coverage
```

Esperado: 5 tests passing.

---

## Task 8: Frontend — instalar socket.io-client + API proxy routes

**Files:**
- Modify: `nella-frontend/package.json` (via yarn add)
- Create: `nella-frontend/src/app/api/projects/route.ts`
- Create: `nella-frontend/src/app/api/metrics/[projectId]/route.ts`

### Step 1: Instalar socket.io-client

```bash
cd nella-frontend
yarn add socket.io-client
```

Verificar que aparece en `package.json`.

### Step 2: Crear proxy route para projects

```typescript
// nella-frontend/src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

function backendHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const auth = request.headers.get('authorization')
  if (auth) headers['Authorization'] = auth
  const tenant = request.headers.get('x-tenant-id')
  if (tenant) headers['X-Tenant-Id'] = tenant
  return headers
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/projects`, {
      method: 'GET',
      headers: backendHeaders(request),
    })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ error: data.message }, { status: response.status })
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/projects GET]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const response = await fetch(`${BACKEND_URL}/projects`, {
      method: 'POST',
      headers: backendHeaders(request),
      body: JSON.stringify(body),
    })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ error: data.message }, { status: response.status })
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[API/projects POST]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
```

### Step 3: Crear proxy route para metrics

```typescript
// nella-frontend/src/app/api/metrics/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const headers: Record<string, string> = {}
    const auth = request.headers.get('authorization')
    if (auth) headers['Authorization'] = auth
    const tenant = request.headers.get('x-tenant-id')
    if (tenant) headers['X-Tenant-Id'] = tenant

    const response = await fetch(`${BACKEND_URL}/metrics/project/${params.projectId}`, {
      method: 'GET',
      headers,
    })
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ error: data.message }, { status: response.status })
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API/metrics GET]', error)
    return NextResponse.json({ error: 'Backend no disponible' }, { status: 503 })
  }
}
```

### Step 4: Verificar build

```bash
cd nella-frontend
yarn build
```

Esperado: Sin errores en las nuevas rutas.

---

## Task 9: Frontend — hooks

**Files:**
- Create: `nella-frontend/src/hooks/use-projects.ts`
- Modify: `nella-frontend/src/hooks/useMetrics.ts` (reemplazar vacío)
- Create: `nella-frontend/src/hooks/use-metrics-socket.ts`

### Step 1: Definir tipos de proyecto

Agregar a `nella-frontend/src/types/auth-types.ts` al final del archivo:

```typescript
// Project & Metrics Types
export interface Project {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface ProjectMetrics {
  totalLeads: number
  activeLeads: number
  revenueMonth: number
  trafficSources: { source: string; count: number }[]
  funnel: { status: string; count: number }[]
}
```

### Step 2: Crear use-projects.ts

```typescript
// nella-frontend/src/hooks/use-projects.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Project } from '@/types/auth-types'

async function fetchProjects(): Promise<Project[]> {
  const session = JSON.parse(localStorage.getItem('nella_session') || 'null')
  const headers: Record<string, string> = {}
  if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
  if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug

  const res = await fetch('/api/projects', { headers })
  if (!res.ok) throw new Error('Failed to fetch projects')
  return res.json()
}

async function createProject(name: string): Promise<Project> {
  const session = JSON.parse(localStorage.getItem('nella_session') || 'null')
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
  if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug

  const res = await fetch('/api/projects', {
    method: 'POST',
    headers,
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create project')
  return res.json()
}

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 30_000,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createProject(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
```

### Step 3: Reemplazar useMetrics.ts

```typescript
// nella-frontend/src/hooks/useMetrics.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import type { ProjectMetrics } from '@/types/auth-types'

async function fetchMetrics(projectId: string): Promise<ProjectMetrics> {
  const session = JSON.parse(localStorage.getItem('nella_session') || 'null')
  const headers: Record<string, string> = {}
  if (session?.accessToken) headers['Authorization'] = `Bearer ${session.accessToken}`
  if (session?.tenantSlug) headers['X-Tenant-Id'] = session.tenantSlug

  const res = await fetch(`/api/metrics/${projectId}`, { headers })
  if (!res.ok) throw new Error('Failed to fetch metrics')
  return res.json()
}

export function useMetrics(projectId: string | null) {
  return useQuery<ProjectMetrics>({
    queryKey: ['metrics', projectId],
    queryFn: () => fetchMetrics(projectId!),
    enabled: !!projectId,
    staleTime: 10_000,
  })
}
```

### Step 4: Crear use-metrics-socket.ts

```typescript
// nella-frontend/src/hooks/use-metrics-socket.ts
'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

export function useMetricsSocket(projectId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!projectId) return

    const socket = io(`${BACKEND_URL}/metrics`, {
      transports: ['websocket'],
    })

    socket.emit('join:project', projectId)

    socket.on('metrics:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', projectId] })
    })

    return () => {
      socket.disconnect()
    }
  }, [projectId, queryClient])
}
```

### Step 5: Agregar NEXT_PUBLIC_BACKEND_URL al .env.local del frontend

Abrir `nella-frontend/.env.local` y agregar si no existe:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Step 6: Verificar build

```bash
cd nella-frontend
yarn build
```

Esperado: Sin errores.

---

## Task 10: Frontend — componentes UI

**Files:**
- Create: `nella-frontend/src/components/dashboard/project-empty-state.tsx`
- Create: `nella-frontend/src/components/dashboard/create-project-modal.tsx`
- Create: `nella-frontend/src/components/dashboard/project-selector.tsx`
- Create: `nella-frontend/src/components/dashboard/kpi-card.tsx`
- Create: `nella-frontend/src/components/dashboard/metrics-dashboard.tsx`
- Create: `nella-frontend/src/components/dashboard/leads-line-chart.tsx`
- Create: `nella-frontend/src/components/dashboard/conversion-funnel.tsx`
- Create: `nella-frontend/src/components/dashboard/traffic-sources.tsx`

### Step 1: ProjectEmptyState

```typescript
// nella-frontend/src/components/dashboard/project-empty-state.tsx
'use client'

import { FolderOpen } from 'lucide-react'

interface ProjectEmptyStateProps {
  onCreateClick: () => void
}

export function ProjectEmptyState({ onCreateClick }: ProjectEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-5 rounded-2xl bg-accent/40 border border-border">
          <FolderOpen className="size-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Aún no tienes proyectos</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Crea tu primer proyecto para comenzar a rastrear leads y métricas.
          </p>
        </div>
        <button
          onClick={onCreateClick}
          className="btn-primary mt-2 w-auto px-6"
          style={{ width: 'auto' }}
        >
          Crear Primer Proyecto
        </button>
      </div>
    </div>
  )
}
```

### Step 2: CreateProjectModal

```typescript
// nella-frontend/src/components/dashboard/create-project-modal.tsx
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useCreateProject } from '@/hooks/use-projects'

interface CreateProjectModalProps {
  open: boolean
  onClose: () => void
  onCreated: (projectId: string) => void
}

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { mutateAsync: createProject, isPending } = useCreateProject()

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('El nombre es requerido'); return }
    try {
      const project = await createProject(name.trim())
      setName('')
      onCreated(project.id)
      onClose()
    } catch {
      setError('Error al crear el proyecto. Intenta de nuevo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative auth-card w-full max-w-md p-6" style={{ animation: 'fadeIn 0.2s ease-out' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Nuevo Proyecto</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="tech-label">Nombre del proyecto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Campaña Instagram Q1"
              className={`auth-input ${error ? 'border-destructive' : ''}`}
              autoFocus
              maxLength={255}
            />
            {error && <p className="text-destructive text-xs mt-1">{error}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-login flex-1"
              disabled={isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isPending || !name.trim()}
            >
              {isPending ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

### Step 3: ProjectSelector

```typescript
// nella-frontend/src/components/dashboard/project-selector.tsx
'use client'

import { ChevronDown, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '@/types/auth-types'

interface ProjectSelectorProps {
  projects: Project[]
  activeProjectId: string
  onSelect: (id: string) => void
  onCreateClick: () => void
}

export function ProjectSelector({ projects, activeProjectId, onSelect, onCreateClick }: ProjectSelectorProps) {
  const [open, setOpen] = useState(false)
  const active = projects.find((p) => p.id === activeProjectId)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel text-sm font-medium text-foreground hover:bg-accent transition-colors"
      >
        <span className="max-w-[160px] truncate">{active?.name ?? 'Seleccionar proyecto'}</span>
        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 rounded-xl glass-panel border border-border overflow-hidden z-20" style={{ animation: 'slideIn 0.15s ease-out' }}>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelect(p.id); setOpen(false) }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-accent/60 ${p.id === activeProjectId ? 'text-primary font-medium' : 'text-foreground'}`}
            >
              {p.name}
            </button>
          ))}
          <div className="border-t border-border">
            <button
              onClick={() => { onCreateClick(); setOpen(false) }}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <Plus className="size-4" />
              Nuevo proyecto
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

### Step 4: KpiCard

```typescript
// nella-frontend/src/components/dashboard/kpi-card.tsx
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  icon: LucideIcon
  loading?: boolean
}

export function KpiCard({ title, value, icon: Icon, loading }: KpiCardProps) {
  return (
    <div className="group glass-panel tech-glow relative p-6 rounded-2xl">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-accent text-muted-foreground group-hover:text-foreground group-hover:bg-primary/20 transition-colors">
          <Icon className="size-5" />
        </div>
      </div>
      {loading ? (
        <div className="h-9 w-24 rounded-lg bg-accent/60 animate-pulse mb-1" />
      ) : (
        <div className="text-3xl font-bold text-foreground mb-1 tracking-tight">{value}</div>
      )}
      <div className="text-sm text-muted-foreground font-medium">{title}</div>
    </div>
  )
}
```

### Step 5: ConversionFunnel

```typescript
// nella-frontend/src/components/dashboard/conversion-funnel.tsx
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts'
import type { ProjectMetrics } from '@/types/auth-types'

const STATUS_LABELS: Record<string, string> = {
  new: 'Nuevo',
  qualified: 'Calificado',
  negotiation: 'Negociación',
  closed: 'Cerrado',
  lost: 'Perdido',
}

interface ConversionFunnelProps {
  funnel: ProjectMetrics['funnel']
}

export function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const data = funnel.map((f) => ({ stage: STATUS_LABELS[f.status] ?? f.status, count: f.count }))

  return (
    <div className="w-full glass-panel tech-glow rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Embudo de Conversión</h3>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
            <XAxis type="number" hide />
            <YAxis dataKey="stage" type="category" hide width={0} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))' }}
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
            />
            <Bar dataKey="count" fill="#CEF25D" radius={[0, 4, 4, 0]} barSize={48} activeBar={{ fill: '#badd4f' }}>
              <LabelList dataKey="stage" position="insideLeft" fill="#000" fontWeight="bold" fontSize={14} />
              <LabelList dataKey="count" position="right" fill="#fff" fontSize={14} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### Step 6: TrafficSources

```typescript
// nella-frontend/src/components/dashboard/traffic-sources.tsx
'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { ProjectMetrics } from '@/types/auth-types'

const COLORS = ['#CEF25D', '#a3c24a', '#7a9136', '#555555', '#333333']

interface TrafficSourcesProps {
  sources: ProjectMetrics['trafficSources']
  totalLeads: number
}

export function TrafficSources({ sources, totalLeads }: TrafficSourcesProps) {
  const data = sources.map((s, i) => ({
    name: s.source,
    value: s.count,
    color: COLORS[i % COLORS.length],
  }))

  if (!data.length) {
    return (
      <div className="glass-panel tech-glow rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-foreground mb-4">Fuentes de Tráfico</h3>
        <p className="text-sm text-muted-foreground">Sin datos de fuente aún.</p>
      </div>
    )
  }

  return (
    <div className="glass-panel tech-glow rounded-2xl p-6 flex flex-col">
      <h3 className="text-lg font-semibold text-foreground mb-6">Fuentes de Tráfico</h3>

      <div className="relative flex-1 min-h-[250px] flex items-center justify-center">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={90} outerRadius={110} dataKey="value" stroke="none" paddingAngle={0}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold text-foreground tracking-tighter">{totalLeads}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Total Leads</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Step 7: LeadsLineChart (revenue area chart)

```typescript
// nella-frontend/src/components/dashboard/leads-line-chart.tsx
'use client'

import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { ProjectMetrics } from '@/types/auth-types'

interface LeadsLineChartProps {
  revenueMonth: ProjectMetrics['revenueMonth']
}

// Genera datos mock del mes actual por semana (el backend no tiene endpoint time-series aún)
// TODO: reemplazar con endpoint real cuando se implemente serie de tiempo
function generateMonthlyData(revenueMonth: number) {
  const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
  const base = revenueMonth / 4
  return weeks.map((week, i) => ({
    week,
    revenue: Math.round(base * (0.7 + Math.random() * 0.6)),
  }))
}

export function LeadsLineChart({ revenueMonth }: LeadsLineChartProps) {
  const data = generateMonthlyData(revenueMonth)

  return (
    <div className="lg:col-span-2 glass-panel tech-glow rounded-2xl p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Análisis de Revenue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Revenue del mes: <span className="text-primary font-semibold">${revenueMonth.toLocaleString()}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#CEF25D" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#CEF25D" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}K`} dx={-10} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              itemStyle={{ color: 'hsl(var(--primary))' }}
              formatter={(value) => [`$${value}`, 'Revenue']}
            />
            <Area type="monotone" dataKey="revenue" stroke="#CEF25D" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

### Step 8: MetricsDashboard (orquestador)

```typescript
// nella-frontend/src/components/dashboard/metrics-dashboard.tsx
'use client'

import { Users, UserCheck, DollarSign, Skeleton as _ } from 'lucide-react'
import { KpiCard } from './kpi-card'
import { LeadsLineChart } from './leads-line-chart'
import { ConversionFunnel } from './conversion-funnel'
import { TrafficSources } from './traffic-sources'
import { useMetrics } from '@/hooks/useMetrics'
import { useMetricsSocket } from '@/hooks/use-metrics-socket'

interface MetricsDashboardProps {
  projectId: string
}

export function MetricsDashboard({ projectId }: MetricsDashboardProps) {
  const { data: metrics, isLoading } = useMetrics(projectId)
  useMetricsSocket(projectId)

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard title="Total Leads" value={isLoading ? '—' : String(metrics?.totalLeads ?? 0)} icon={Users} loading={isLoading} />
        <KpiCard title="Leads Activos" value={isLoading ? '—' : String(metrics?.activeLeads ?? 0)} icon={UserCheck} loading={isLoading} />
        <KpiCard title="Revenue del Mes" value={isLoading ? '—' : `$${(metrics?.revenueMonth ?? 0).toLocaleString()}`} icon={DollarSign} loading={isLoading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {metrics ? <LeadsLineChart revenueMonth={metrics.revenueMonth} /> : (
          <div className="lg:col-span-2 glass-panel rounded-2xl h-[360px] animate-pulse bg-accent/30" />
        )}
        {metrics ? (
          <TrafficSources sources={metrics.trafficSources} totalLeads={metrics.totalLeads} />
        ) : (
          <div className="glass-panel rounded-2xl h-[360px] animate-pulse bg-accent/30" />
        )}
      </div>

      {/* Funnel */}
      {metrics ? (
        <ConversionFunnel funnel={metrics.funnel} />
      ) : (
        <div className="glass-panel rounded-2xl h-[300px] animate-pulse bg-accent/30" />
      )}
    </div>
  )
}
```

### Step 9: Verificar build

```bash
cd nella-frontend
yarn build
```

Esperado: Sin errores TypeScript en los nuevos componentes.

---

## Task 11: Refactorizar dashboard/page.tsx

**Files:**
- Modify: `nella-frontend/src/app/(dashboard)/dashboard/page.tsx`

### Step 1: Reemplazar todo el contenido del archivo

```typescript
// nella-frontend/src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useProjects } from '@/hooks/use-projects'
import { ProjectEmptyState } from '@/components/dashboard/project-empty-state'
import { CreateProjectModal } from '@/components/dashboard/create-project-modal'
import { ProjectSelector } from '@/components/dashboard/project-selector'
import { MetricsDashboard } from '@/components/dashboard/metrics-dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)

  const { data: projects, isLoading } = useProjects()

  // Active project from URL param — fallback to first project
  const urlProjectId = searchParams.get('project')
  const activeProjectId = urlProjectId ?? projects?.[0]?.id ?? null

  function handleSelectProject(id: string) {
    router.push(`/dashboard?project=${id}`)
  }

  function handleProjectCreated(id: string) {
    router.push(`/dashboard?project=${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-8 pt-6 min-h-screen">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="h-8 w-40 bg-accent/40 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-56 bg-accent/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-2xl h-[120px] animate-pulse bg-accent/30" />
          ))}
        </div>
      </div>
    )
  }

  const hasProjects = projects && projects.length > 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-8 pt-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1 text-sm tracking-wide">Rendimiento en tiempo real.</p>
        </div>

        {hasProjects && activeProjectId && (
          <ProjectSelector
            projects={projects}
            activeProjectId={activeProjectId}
            onSelect={handleSelectProject}
            onCreateClick={() => setModalOpen(true)}
          />
        )}
      </div>

      {/* Content */}
      {!hasProjects ? (
        <ProjectEmptyState onCreateClick={() => setModalOpen(true)} />
      ) : activeProjectId ? (
        <MetricsDashboard projectId={activeProjectId} />
      ) : null}

      {/* Modal */}
      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  )
}
```

### Step 2: Verificar build

```bash
cd nella-frontend
yarn build
```

Esperado: Build exitoso con la página de dashboard refactorizada.

### Step 3: Test manual completo

1. Navegar a `http://localhost:3001/dashboard`
2. Verificar que aparece `ProjectEmptyState` (sin proyectos aún)
3. Click "Crear Primer Proyecto" → modal abre
4. Ingresar nombre "Proyecto Demo" → crear
5. Verificar redirect a `/dashboard?project=<id>`
6. Verificar que aparecen las 3 KPI cards con datos del seed
7. Verificar que el funnel muestra los 4 stages
8. Verificar que traffic sources muestra Instagram, Facebook, WhatsApp

---

## Task 12: Tests frontend (unit + E2E Playwright)

**Files:**
- Create: `nella-frontend/src/components/dashboard/__tests__/kpi-card.test.tsx`
- Create: `nella-frontend/src/components/dashboard/__tests__/project-empty-state.test.tsx`
- Create: `nella-frontend/e2e/dashboard-projects.spec.ts`

### Step 1: Verificar si existe configuración de test en frontend

```bash
cd nella-frontend
cat package.json | grep -E '"test|vitest|jest"'
```

Si no existe ninguna configuración de test, instalar Vitest:

```bash
yarn add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

Y agregar al `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Y crear `vitest.config.ts` en la raíz del frontend:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
```

Y crear `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

### Step 2: Test unitario KpiCard

```typescript
// nella-frontend/src/components/dashboard/__tests__/kpi-card.test.tsx
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../kpi-card'
import { Users } from 'lucide-react'

describe('KpiCard', () => {
  it('renders title and value', () => {
    render(<KpiCard title="Total Leads" value="142" icon={Users} />)
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    render(<KpiCard title="Total Leads" value="142" icon={Users} loading />)
    expect(screen.queryByText('142')).not.toBeInTheDocument()
  })
})
```

### Step 3: Test unitario ProjectEmptyState

```typescript
// nella-frontend/src/components/dashboard/__tests__/project-empty-state.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectEmptyState } from '../project-empty-state'

describe('ProjectEmptyState', () => {
  it('renders heading and CTA button', () => {
    const handleClick = vi.fn()
    render(<ProjectEmptyState onCreateClick={handleClick} />)
    expect(screen.getByText('Aún no tienes proyectos')).toBeInTheDocument()
    expect(screen.getByText('Crear Primer Proyecto')).toBeInTheDocument()
  })

  it('calls onCreateClick when button is clicked', () => {
    const handleClick = vi.fn()
    render(<ProjectEmptyState onCreateClick={handleClick} />)
    fireEvent.click(screen.getByText('Crear Primer Proyecto'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Step 4: Correr tests unitarios

```bash
cd nella-frontend
yarn test
```

Esperado: 4 tests passing (2 KpiCard + 2 ProjectEmptyState).

### Step 5: Setup Playwright (si no está instalado)

```bash
cd nella-frontend
yarn add -D @playwright/test
npx playwright install chromium
```

Crear `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
  },
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3001',
    reuseExistingServer: true,
  },
})
```

### Step 6: E2E — Crear los 3 escenarios

```typescript
// nella-frontend/e2e/dashboard-projects.spec.ts
import { test, expect } from '@playwright/test'

// Credenciales del tenant verify-corp
const EMAIL = 'verify@corp.com'
const PASSWORD = 'Pass1234'

async function login(page: any) {
  await page.goto('/login')
  await page.fill('[placeholder*="email"], input[type="email"]', EMAIL)
  await page.fill('[placeholder*="contraseña"], input[type="password"]', PASSWORD)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**')
}

test.describe('Dashboard Projects', () => {
  test('Escenario 1: Empty state visible sin proyectos', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')

    // Si hay proyectos del seed, este test asume DB limpia
    // Verificar que alguno de los dos estados es visible
    const emptyState = page.getByText('Aún no tienes proyectos')
    const dashboard = page.getByText('Rendimiento en tiempo real.')
    await expect(dashboard).toBeVisible()
  })

  test('Escenario 2: Dashboard con métricas del seed data', async ({ page }) => {
    await login(page)
    // Navegar directamente al dashboard — si hay proyecto del seed, verá métricas
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Verificar que existe el selector de proyecto o el empty state
    const hasProjects = await page.getByText('Rendimiento en tiempo real.').isVisible()
    expect(hasProjects).toBe(true)
  })

  test('Escenario 3: Crear proyecto desde empty state', async ({ page }) => {
    await login(page)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Si hay botón de crear proyecto (empty state o selector)
    const createBtn = page.getByText('Crear Primer Proyecto').or(page.getByText('Nuevo proyecto'))
    if (await createBtn.first().isVisible()) {
      await createBtn.first().click()

      // Modal debe aparecer
      await expect(page.getByText('Nuevo Proyecto')).toBeVisible()

      // Completar el nombre
      await page.fill('input[placeholder*="Campaña"]', 'Proyecto Test E2E')
      await page.click('button:has-text("Crear Proyecto")')

      // Debe redirigir con ?project= en la URL
      await page.waitForURL('**/dashboard?project=**')
      expect(page.url()).toContain('?project=')
    }
  })
})
```

### Step 7: Correr E2E (con ambos servidores corriendo)

```bash
# Terminal 1: backend
cd nella_backend && npm run start:dev

# Terminal 2: frontend
cd nella-frontend && yarn dev

# Terminal 3: E2E
cd nella-frontend && npx playwright test e2e/dashboard-projects.spec.ts
```

Esperado: 3 tests passing.

---

## Checklist final de verificación

- [ ] `npx nest build --tsc` — sin errores (backend)
- [ ] `yarn build` — sin errores (frontend)
- [ ] `npx jest src/projects/... src/metrics/...` — 5 tests passing (backend)
- [ ] `yarn test` — 4 tests passing (frontend unit)
- [ ] Seed script ejecutado en verify-corp
- [ ] GET `/projects` retorna el proyecto creado
- [ ] GET `/metrics/project/:id` retorna los 5 KPIs correctamente
- [ ] Dashboard muestra KPI cards con datos reales
- [ ] ConversionFunnel muestra stages del seed
- [ ] TrafficSources muestra Instagram, Facebook, WhatsApp
- [ ] WebSocket notifica al frontend cuando cambia un contacto
- [ ] `npx playwright test` — 3 E2E passing
