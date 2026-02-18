# Projects + Lead Metrics — Design Document

**Fecha:** 2026-02-18
**Feature:** Dashboard — Creación de Proyectos + Métricas de Leads
**HU:** Métricas de leads por proyecto (total, activos, revenue, fuentes, embudo) con actualización en tiempo real.

---

## Decisiones de diseño (confirmadas)

| Pregunta | Decisión |
|---|---|
| ¿Lead pertenece a proyecto? | Sí — `contacts.project_id` FK duro (nullable en DB, requerido en DTO para nuevos) |
| ¿Visibilidad entre admins del mismo tenant? | Tenant compartido — todos los admins ven todos los proyectos |
| ¿Mecanismo real-time? | **Opción B** — WebSocket como notificación liviana, REST para datos |
| ¿Ámbito de métricas? | Por proyecto seleccionado |
| ¿Campo deal_value? | Ya existe en `contacts` como `DECIMAL(10,2)` nullable |
| ¿ORM o raw SQL? | TypeORM entities + migrations — cero raw SQL |

---

## Modelo de Datos

### Nueva entidad `Project`

```typescript
// nella_backend/src/common/entities/project.entity.ts
@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')   id: string
  @Column({ length: 255 })          name: string
  @Column({ name: 'owner_id', nullable: true }) ownerId: string
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' }) owner: User
  @OneToMany(() => Contact, (c) => c.project) contacts: Contact[]
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date
}
```

### Modificación a `Contact` entity

```typescript
// Agregar a src/common/entities/contact.entity.ts
@Column({ name: 'project_id', nullable: true })
projectId: string

@ManyToOne(() => Project, (p) => p.contacts, { nullable: true, onDelete: 'SET NULL' })
@JoinColumn({ name: 'project_id' })
project: Project
```

### Migraciones TypeORM (dentro de tenant schema)

```
Migration 1: CreateProjectsTable
  → CREATE TABLE projects (id, name, owner_id, created_at, updated_at)

Migration 2: AddProjectIdToContacts
  → ALTER TABLE contacts ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL
```

Ambas migraciones se registran en `TenantService.createTenant()` usando QueryRunner + `SET search_path TO "<schemaName>"`.

---

## Arquitectura Backend

### Módulos nuevos

```
nella_backend/src/
├── projects/
│   ├── projects.module.ts
│   ├── projects.controller.ts    GET /projects, POST /projects
│   ├── projects.service.ts       CRUD: findAll, create (QueryRunner + search_path)
│   └── dto/create-project.dto.ts  { name: string (required, min 1, max 255) }
└── metrics/
    ├── metrics.module.ts
    ├── metrics.controller.ts     GET /metrics/project/:id
    ├── metrics.service.ts        5 QueryBuilder queries (KPIs + funnel + sources)
    └── metrics.gateway.ts        WebSocket Gateway, namespace /metrics
```

### API Endpoints

| Método | Ruta | Auth |
|--------|------|------|
| `GET` | `/projects` | JWT + TenantMiddleware |
| `POST` | `/projects` | JWT + TenantMiddleware |
| `GET` | `/metrics/project/:id` | JWT + TenantMiddleware |

### Respuesta `/metrics/project/:id`

```json
{
  "totalLeads": 142,
  "activeLeads": 98,
  "revenueMonth": 48500.00,
  "trafficSources": [
    { "source": "Instagram", "count": 61 },
    { "source": "Facebook", "count": 45 },
    { "source": "WhatsApp", "count": 36 }
  ],
  "funnel": [
    { "status": "new",         "count": 40 },
    { "status": "qualified",   "count": 28 },
    { "status": "negotiation", "count": 18 },
    { "status": "closed",      "count": 12 }
  ]
}
```

### WebSocket Gateway

```typescript
@WebSocketGateway({ namespace: '/metrics', cors: { origin: '*' } })
export class MetricsGateway {
  @WebSocketServer() server: Server

  notifyProjectUpdate(projectId: string) {
    this.server.to(`project:${projectId}`).emit('metrics:updated', { projectId })
  }

  @SubscribeMessage('join:project')
  handleJoin(client: Socket, projectId: string) {
    client.join(`project:${projectId}`)
  }
}
```

`MetricsService` y `ProjectsService` llaman `gateway.notifyProjectUpdate(projectId)` después de cada mutación sobre contactos.

---

## Arquitectura Frontend

### Archivos nuevos

```
nella-frontend/src/
├── app/api/
│   ├── projects/route.ts                  proxy → GET/POST /projects
│   └── metrics/[projectId]/route.ts       proxy → GET /metrics/project/:id
├── components/dashboard/
│   ├── project-empty-state.tsx
│   ├── create-project-modal.tsx
│   ├── project-selector.tsx
│   ├── metrics-dashboard.tsx
│   ├── kpi-card.tsx
│   ├── leads-line-chart.tsx
│   ├── conversion-funnel.tsx
│   └── traffic-sources.tsx
└── hooks/
    ├── use-projects.ts
    ├── use-metrics.ts
    └── use-metrics-socket.ts
```

### Flujo de pantallas

```
/dashboard
  │
  ├── [cargando]    → skeleton loaders (3 KpiCard + 2 chart skeletons)
  ├── [sin proyectos] → <ProjectEmptyState>
  │                      "Aún no tienes proyectos"
  │                      [Crear Primer Proyecto]  → abre <CreateProjectModal>
  │
  └── [proyectos]   → <ProjectSelector> (URL param ?project=<id>)
                        └── <MetricsDashboard>
                              ├── KpiCard: Total leads
                              ├── KpiCard: Leads activos
                              ├── KpiCard: Revenue del mes
                              ├── LeadsLineChart (leads por día/semana)
                              ├── ConversionFunnel (barras horizontales)
                              └── TrafficSources (BarChart por fuente)
```

### Real-time hook

```typescript
// hooks/use-metrics-socket.ts
export function useMetricsSocket(projectId: string) {
  const queryClient = useQueryClient()
  useEffect(() => {
    const socket = io('/metrics', { path: '/socket.io' })
    socket.emit('join:project', projectId)
    socket.on('metrics:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['metrics', projectId] })
    })
    return () => { socket.disconnect() }
  }, [projectId, queryClient])
}
```

### Estilo visual

- Backgrounds oscuros (`#151515`, `#1e1e1e`) — coherente con dashboard existente
- Highlights en lime `#9EFF00` para valores positivos y CTA principal
- Cards con `glass-panel` — backdrop-blur + border rgba
- Charts: Recharts (ya instalado en el proyecto)

---

## Datos de Prueba (Seed)

La DB no tiene datos. Se crea un **script de seed** que:

1. Crea un proyecto de prueba en el schema del tenant `verify-corp`
2. Inserta 50 contactos con `project_id` asignado, distribuidos:
   - `source`: Instagram (20), Facebook (15), WhatsApp (10), Referral (5)
   - `status`: new (15), qualified (12), negotiation (10), closed (8), lost (5)
   - `deal_value`: entre 500–5000 para los `closed`
   - `created_at`: distribuidos en los últimos 30 días

Script: `nella_backend/src/database/seed-project-metrics.ts`
Ejecución: `npx ts-node src/database/seed-project-metrics.ts`

---

## Testing

### Backend — Tests unitarios (Jest)

| Test | Archivo |
|------|---------|
| `ProjectsService.create()` — crea proyecto y retorna entity | `src/projects/projects.service.spec.ts` |
| `ProjectsService.findAll()` — lista proyectos del tenant | `src/projects/projects.service.spec.ts` |
| `MetricsService.getProjectMetrics()` — calcula los 5 KPIs correctamente | `src/metrics/metrics.service.spec.ts` |
| `MetricsGateway.notifyProjectUpdate()` — emite al room correcto | `src/metrics/metrics.gateway.spec.ts` |

### Frontend — Tests unitarios (Vitest/Jest)

| Test | Archivo |
|------|---------|
| `KpiCard` renderiza título y valor | `components/dashboard/kpi-card.test.tsx` |
| `ProjectEmptyState` muestra botón "Crear Primer Proyecto" | `components/dashboard/project-empty-state.test.tsx` |
| `useProjects` retorna lista vacía cuando no hay proyectos | `hooks/use-projects.test.ts` |

### E2E — Playwright

**Escenario 1: Crear primer proyecto**
```
1. Login → navegar a /dashboard
2. Verificar que se muestra ProjectEmptyState
3. Hacer click en "Crear Primer Proyecto"
4. Completar modal con name "Proyecto Alpha"
5. Verificar que ProjectSelector aparece con "Proyecto Alpha"
6. Verificar URL contiene ?project=<id>
```

**Escenario 2: Ver métricas (con seed data)**
```
1. Login → navegar a /dashboard?project=<seeded-id>
2. Verificar KpiCard "Total leads" = 50
3. Verificar KpiCard "Leads activos" = 37 (50 - closed 8 - lost 5)
4. Verificar que ConversionFunnel muestra 4 stages
5. Verificar que TrafficSources muestra Instagram, Facebook, WhatsApp
```

**Escenario 3: Real-time update**
```
1. Abrir dashboard con proyecto activo
2. Via API (fetch), POST un nuevo contacto al proyecto
3. Verificar que KpiCard "Total leads" se incrementa sin reload
```

---

## Criterios de Aceptación

- [ ] Un tenant puede crear múltiples proyectos
- [ ] Las métricas de un proyecto nunca incluyen contactos de otro proyecto
- [ ] Un proyecto sin contactos muestra métricas en cero (no error)
- [ ] El WebSocket notifica al frontend cuando cambia un contacto
- [ ] La creación de un nuevo tenant incluye la migración de `projects` y `project_id`
- [ ] Los contactos legacy (sin `project_id`) no aparecen en métricas de ningún proyecto
