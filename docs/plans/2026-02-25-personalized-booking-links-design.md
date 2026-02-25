# Diseño: Links Personalizados de Booking

**Fecha:** 2026-02-25
**Feature Branch:** feature/nella-37
**Estado:** Pendiente de implementación en backend

---

## Objetivo

Permitir que n8n envíe al lead un link personalizado para que agende una reunión con el agente que tiene asignado. El lead abre el link, ve la disponibilidad real del agente, selecciona una fecha y hora, y confirma la cita.

---

## Flujo Completo

```
n8n detecta que el lead quiere agendar
    │
    └─► POST /api/v1/booking/invitations
            body: { agentId, leadId, leadName, leadPhone? }
            response: { token: "uuid", bookingUrl: "https://app.nella.co/book/{token}" }
    │
    └─► n8n envía bookingUrl al lead por WhatsApp
    │
Lead abre: https://app.nella.co/book/{token}
    │
    └─► GET /api/v1/public/book/{token}  (sin autenticación)
            Valida: token existe, no expirado, status = 'pending'
            Retorna: datos del agente + nombre del lead + slots disponibles
    │
    └─► Lead selecciona fecha y hora
    │
    └─► POST /api/v1/public/book/{token}/confirm
            body: { scheduledAt: "2026-03-05T10:00:00Z" }
            Crea booking_appointment
            Marca token como 'booked'
```

---

## Base de Datos (PostgreSQL)

### Por qué se necesitan estas tablas

El sistema actual no tiene ninguna infraestructura para booking. La tabla `users` ya existe y contiene los datos del agente, pero necesitamos:

- **`agent_availability`**: Sin esta tabla, no hay forma de saber cuándo está disponible un agente. La UI del `AvailabilityModal` en el dashboard ya existe pero actualmente no persiste datos.
- **`booking_invitations`**: Es el núcleo del sistema de links personalizados. Sin ella, no hay token que relacione a un agente con un lead específico, ni forma de controlar expiración o evitar que un mismo link se use dos veces.
- **`booking_appointments`**: Registra las citas confirmadas. También es necesaria para calcular slots ocupados al mostrar disponibilidad.

---

### Tabla `agent_availability`

Almacena el horario semanal de disponibilidad de cada agente.

```sql
CREATE TABLE agent_availability (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id     UUID NOT NULL,
    agent_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Lunes, 6=Domingo
    start_time    TIME NOT NULL,
    end_time      TIME NOT NULL,
    is_enabled    BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, agent_id, day_of_week)
);

CREATE INDEX idx_agent_availability_agent ON agent_availability (tenant_id, agent_id);
```

---

### Tabla `booking_invitations`

Registra cada invitación generada por n8n. El `token` es el identificador público del link.

```sql
CREATE TABLE booking_invitations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID NOT NULL,
    token        UUID UNIQUE DEFAULT gen_random_uuid(),
    agent_id     UUID NOT NULL REFERENCES users(id),
    lead_id      VARCHAR(255) NOT NULL,
    lead_name    VARCHAR(255) NOT NULL,
    lead_phone   VARCHAR(50),
    status       VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'booked', 'expired')),
    duration_min SMALLINT NOT NULL DEFAULT 30,
    platform     VARCHAR(100) NOT NULL DEFAULT 'Google Meet',
    expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '48 hours'),
    created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_booking_invitations_token ON booking_invitations (token);
CREATE INDEX idx_booking_invitations_agent ON booking_invitations (tenant_id, agent_id);
```

---

### Tabla `booking_appointments`

Registra las citas confirmadas por el lead.

```sql
CREATE TABLE booking_appointments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    invitation_id   UUID REFERENCES booking_invitations(id),
    agent_id        UUID NOT NULL REFERENCES users(id),
    lead_name       VARCHAR(255) NOT NULL,
    scheduled_at    TIMESTAMPTZ NOT NULL,
    duration_min    SMALLINT NOT NULL,
    platform        VARCHAR(100),
    meet_link       TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_booking_appointments_agent ON booking_appointments (tenant_id, agent_id, scheduled_at);
```

---

## API Endpoints (Backend)

### 1. Gestión de Disponibilidad (Autenticado)

**`GET /api/v1/agents/:agentId/availability`**
- Headers: `Authorization: Bearer {token}`, `X-Tenant-Id: {tenantId}`
- Response:
```json
{
  "availability": [
    { "dayOfWeek": 0, "startTime": "09:00", "endTime": "17:00", "isEnabled": true },
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isEnabled": true },
    { "dayOfWeek": 5, "startTime": "09:00", "endTime": "12:00", "isEnabled": false }
  ]
}
```

**`PUT /api/v1/agents/:agentId/availability`**
- Headers: `Authorization: Bearer {token}`, `X-Tenant-Id: {tenantId}`
- Body: mismo formato que la respuesta del GET
- Response: `{ "success": true }`
- Comportamiento: upsert completo (reemplaza todos los registros del agente)

---

### 2. Crear Invitación (Autenticado — llamado por n8n)

**`POST /api/v1/booking/invitations`**
- Headers: `Authorization: Bearer {token}`, `X-Tenant-Id: {tenantId}`
- Body:
```json
{
  "agentId": "uuid-del-agente",
  "leadId": "id-del-lead-en-el-sistema",
  "leadName": "Carlos",
  "leadPhone": "+57300000000",
  "durationMin": 30,
  "platform": "Google Meet"
}
```
- Response:
```json
{
  "token": "f7a9b2c1-4321-abcd-efgh-...",
  "bookingUrl": "https://app.nella.co/book/f7a9b2c1-4321-abcd-efgh-...",
  "expiresAt": "2026-02-27T15:30:00Z"
}
```

---

### 3. Endpoints Públicos (SIN autenticación — para el lead)

**`GET /api/v1/public/book/:token`**

Valida el token y retorna todos los datos necesarios para renderizar la página de booking.

- Validaciones:
  1. Token existe en `booking_invitations`
  2. `status = 'pending'`
  3. `expires_at > now()`

- Lógica de disponibilidad:
  1. Obtener el horario del agente (`agent_availability`)
  2. Calcular slots de 30 min para los próximos **14 días**
  3. Excluir slots ya ocupados (`booking_appointments` donde `agent_id = ?` y `scheduled_at` cae en el slot)
  4. Agrupar por fecha

- Response (200):
```json
{
  "agentName": "Juan Pérez",
  "agentRole": "Sales Agent",
  "agentInitials": "JP",
  "leadName": "Carlos",
  "durationMin": 30,
  "platform": "Google Meet",
  "availability": {
    "2026-03-03": ["09:00", "09:30", "10:00", "11:00"],
    "2026-03-04": ["09:00", "10:30", "14:00", "15:00"],
    "2026-03-05": ["09:00", "09:30"]
  }
}
```

- Response (404): Token no existe
```json
{ "error": "INVITATION_NOT_FOUND" }
```

- Response (410): Token expirado o ya usado
```json
{ "error": "INVITATION_EXPIRED" }
```

---

**`POST /api/v1/public/book/:token/confirm`**

Confirma la cita y bloquea el token.

- Body:
```json
{
  "scheduledAt": "2026-03-05T10:00:00Z"
}
```

- Validaciones (iguales al GET):
  1. Token válido, `status = 'pending'`, no expirado
  2. El slot seleccionado aún está disponible (verificar contra `booking_appointments`)

- Comportamiento en transacción:
  1. Insertar en `booking_appointments`
  2. Actualizar `booking_invitations.status = 'booked'`

- Response (201):
```json
{
  "appointmentId": "uuid",
  "agentName": "Juan Pérez",
  "scheduledAt": "2026-03-05T10:00:00Z",
  "durationMin": 30,
  "platform": "Google Meet"
}
```

- Response (409): Slot ya ocupado
```json
{ "error": "SLOT_NOT_AVAILABLE" }
```

---

## Capa Frontend (Next.js) — Implementación Posterior

> **Nota:** Esta sección se implementa una vez el backend esté listo.

### Nuevas Proxy Routes en Next.js

```
POST /api/book/invitations        → proxies a POST /api/v1/booking/invitations
GET  /api/book/[token]            → proxies a GET /api/v1/public/book/:token
POST /api/book/[token]/confirm    → proxies a POST /api/v1/public/book/:token/confirm
```

Las rutas de disponibilidad ya existen en `/api/calendar/availability` y solo necesitan conectarse al nuevo endpoint del backend.

### Cambios en la página de booking

**`/src/app/(public)/book/[token]/page.tsx`** (Server Component):
- Llama a `GET /api/book/[token]`
- Si token inválido/expirado → renderiza página de error
- Si válido → pasa datos reales a `BookingLayout`

**`/src/components/booking/calendar-picker.tsx`**:
- Recibe `availableDates: Record<string, string[]>` en lugar de mock data
- Mapea fechas reales a los días disponibles en el calendario

**`/src/components/booking/booking-layout.tsx`**:
- Al confirmar, llama a `POST /api/book/[token]/confirm`
- Muestra `BookingConfirmation` con datos reales de la respuesta

---

## Resumen de Responsabilidades

| Componente | Responsabilidad |
|------------|----------------|
| **n8n** | Detectar intención de agendar → llamar `POST /api/v1/booking/invitations` → enviar URL al lead |
| **Backend** | Crear tablas, exponer los 5 endpoints descritos, lógica de slots disponibles |
| **Frontend** | Proxy routes, conectar página `/book/[token]` con datos reales (fase posterior) |

---

## Exposición OpenAPI para n8n

El endpoint `POST /api/v1/booking/invitations` debe quedar disponible como herramienta consumible por n8n. n8n puede integrarse con una API de dos formas:

- **HTTP Request node (manual):** n8n configura la URL, headers y body manualmente. Funciona, pero requiere mantenimiento manual si el contrato cambia.
- **OpenAPI tool (recomendado):** n8n lee el spec OpenAPI del backend y descubre el endpoint automáticamente. Más robusto y escalable.

**Acción requerida por el backend antes de implementar:**

> Verificar si el proyecto ya tiene Swagger/OpenAPI configurado (ej. `/api/docs` o `/api/openapi.json`).
> - **Si ya existe:** agregar el endpoint `POST /api/v1/booking/invitations` al spec existente con su schema de request/response.
> - **Si no existe:** evaluar si vale la pena configurarlo ahora (recomendado) o usar HTTP Request node como solución temporal.

El spec mínimo que necesita este endpoint para n8n:

```yaml
/api/v1/booking/invitations:
  post:
    summary: Crear invitación de booking personalizada
    security:
      - bearerAuth: []
    parameters:
      - in: header
        name: X-Tenant-Id
        required: true
        schema:
          type: string
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [agentId, leadId, leadName]
            properties:
              agentId:    { type: string, format: uuid }
              leadId:     { type: string }
              leadName:   { type: string }
              leadPhone:  { type: string }
              durationMin: { type: integer, default: 30 }
              platform:   { type: string, default: "Google Meet" }
    responses:
      '201':
        content:
          application/json:
            schema:
              type: object
              properties:
                token:      { type: string, format: uuid }
                bookingUrl: { type: string, format: uri }
                expiresAt:  { type: string, format: date-time }
```

---

## Orden de Implementación Recomendado

1. **Backend investiga** si ya tiene OpenAPI/Swagger configurado
2. **Backend crea las 3 tablas** en PostgreSQL
3. **Backend implementa** los 5 endpoints (en orden: disponibilidad → crear invitación → endpoints públicos)
4. **Backend expone** `POST /api/v1/booking/invitations` en el spec OpenAPI (o documenta para uso con HTTP Request node)
5. **Frontend** conecta `AvailabilityModal` con `PUT /api/v1/agents/:id/availability`
6. **n8n** integra `POST /api/v1/booking/invitations` en el flujo de agendamiento
7. **Frontend** conecta la página pública `/book/[token]` con datos reales
