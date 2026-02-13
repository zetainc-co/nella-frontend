# Nella Revenue OS — Modelo de Datos MVP
**Fecha:** Febrero 2026 | **DB:** PostgreSQL / Supabase | **Estrategia:** Schema unificado, responsabilidades separadas

---

## 1. Decisión Estratégica: Un Solo Schema

**No se crea un modelo de datos separado para el frontend.** El MVP de Nella extiende el schema que ya alimenta n8n en Supabase, agregando las tablas necesarias para multi-tenancy, autenticación y métricas de negocio.

**Por qué:**
- Dos bases de datos significan sincronización frágil y bugs garantizados.
- n8n ya es la fuente de verdad. El frontend solo lee y complementa.
- Agregar tablas nuevas no rompe los flujos existentes de n8n.

**Regla de oro:** n8n escribe los datos operativos del agente IA. Next.js lee esos datos y escribe únicamente lo que el humano gestiona (cierres, ediciones manuales, configuración).

---

## 2. Estrategia de Responsabilidades

```
n8n escribe     →  Tablas core (inbox_queue, conversations, contacts stage/summary)
Next.js escribe →  Tablas de gestión (deals, users, clients, ediciones manuales)
Ambos comparten →  contacts (n8n crea y actualiza IA, vendedor edita manualmente)
```

---

## 3. Tablas Core (Ya Existen — Alimentadas por n8n)

Estas tablas ya están en producción. El MVP las consume sin modificar su estructura base. Solo se agregan columnas nuevas vía migraciones no destructivas.

---

### 3.1 `contacts`
Un registro por número de WhatsApp. Es la tabla central del sistema.

```sql
id                UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id         UUID NOT NULL              -- multi-tenancy
phone             VARCHAR(20) UNIQUE NOT NULL -- identificador principal
name              VARCHAR(255)
email             VARCHAR(255)
company           VARCHAR(255)
role              VARCHAR(255)               -- cargo dentro de la empresa
source_channel    VARCHAR(50)                -- 'instagram' | 'facebook' | 'tiktok' | 'whatsapp_direct'
stage             VARCHAR(50) DEFAULT 'new'  -- 'new' | 'contacted' | 'proposal' | 'closed' | 'lost'
ai_summary        TEXT                       -- resumen generado por la IA
budget            VARCHAR(255)               -- presupuesto / objeciones detectadas
assigned_to       UUID                       -- FK a users (vendedor asignado)
created_at        TIMESTAMP DEFAULT now()
updated_at        TIMESTAMP DEFAULT now()
```

**Quién escribe qué:**
- n8n: crea el contacto, actualiza `stage`, `ai_summary`, `budget`, `name`
- Next.js: actualiza `assigned_to`, ediciones manuales del vendedor, cambios de `stage` por drag-and-drop en el kanban

---

### 3.2 `conversations`
Historial completo de mensajes. Es la memoria del agente IA y el registro de intervenciones humanas.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
contact_id      UUID NOT NULL              -- FK a contacts
client_id       UUID NOT NULL
role            VARCHAR(20) NOT NULL       -- 'user' | 'assistant' | 'human_agent'
content         TEXT NOT NULL
message_type    VARCHAR(20) DEFAULT 'text' -- 'text' | 'audio' | 'image'
media_url       VARCHAR(500)               -- URL si es audio o imagen
chatwoot_id     VARCHAR(100)               -- ID del mensaje en Chatwoot (sincronía)
sent_at         TIMESTAMP DEFAULT now()
```

**Quién escribe qué:**
- n8n: toda la conversación IA (role = 'user' y role = 'assistant')
- Next.js: mensajes del vendedor humano (role = 'human_agent') cuando toma control desde el chat

---

### 3.3 `inbox_queue`
Cola asíncrona de mensajes entrantes. Sala de espera de n8n antes de procesar.

```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id           UUID NOT NULL
phone               VARCHAR(20) NOT NULL
raw_message         JSONB NOT NULL          -- mensaje crudo de Meta API
status              VARCHAR(20) DEFAULT 'pending'
                                            -- 'pending' | 'normalized' | 'processing' | 'done'
normalized_content  TEXT                    -- mensaje procesado para la IA
created_at          TIMESTAMP DEFAULT now()
processed_at        TIMESTAMP
```

**Quién escribe qué:**
- n8n: todo. Esta tabla es exclusiva de n8n.
- Next.js: solo lectura, para monitoreo de la cola en tiempo real si se necesita.

---

## 4. Tablas Nuevas (Agrega el MVP)

Estas tablas no existen aún. Se crean con migraciones sin tocar las tablas core.

---

### 4.1 `clients`
Multi-tenancy. Cada empresa que contrata Nella es un cliente.

```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
name                VARCHAR(255) NOT NULL
plan                VARCHAR(50) DEFAULT 'mvp'  -- 'mvp' | 'growth' | 'enterprise'
meta_phone_id       VARCHAR(100)               -- ID del número WhatsApp Business en Meta
chatwoot_inbox_id   VARCHAR(100)               -- ID del inbox en Chatwoot
created_at          TIMESTAMP DEFAULT now()
```

> **Crítico:** Esta tabla debe existir desde el Día 1. Agregar multi-tenancy después es costoso y requiere migración masiva de datos.

---

### 4.2 `users`
Vendedores y administradores por cliente. Integra con NextAuth.js.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id       UUID NOT NULL       -- FK a clients
email           VARCHAR(255) UNIQUE NOT NULL
name            VARCHAR(255)
role            VARCHAR(20) DEFAULT 'sales_agent'  -- 'admin' | 'sales_agent'
created_at      TIMESTAMP DEFAULT now()
```

---

### 4.3 `deals`
Registro de cierres y valor económico. Fuente de las métricas de ingresos del dashboard.

```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
contact_id      UUID NOT NULL       -- FK a contacts
client_id       UUID NOT NULL
amount          DECIMAL(12, 2)
status          VARCHAR(20)         -- 'won' | 'lost'
closed_at       TIMESTAMP
notes           TEXT
created_by      UUID                -- FK a users (vendedor que cerró)
created_at      TIMESTAMP DEFAULT now()
```

---

### 4.4 `campaigns`
Registro de campañas publicitarias. Se crea ahora para el Ad-Launcher de Fase 2, pero en Fase 1 se alimenta manualmente.

```sql
id                  UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id           UUID NOT NULL
name                VARCHAR(255) NOT NULL
platform            VARCHAR(50)     -- 'meta' | 'google' | 'tiktok'
status              VARCHAR(50)     -- 'active' | 'paused' | 'completed'
budget              DECIMAL(12, 2)
leads_generated     INTEGER DEFAULT 0
created_at          TIMESTAMP DEFAULT now()
```

---

## 5. Diagrama de Relaciones

```
clients
   │
   ├──── users (vendedores y admins)
   │         │
   │         └──── contacts.assigned_to (vendedor asignado al lead)
   │
   ├──── contacts (leads)
   │         │
   │         ├──── conversations (historial IA + humano)
   │         ├──── inbox_queue (mensajes entrantes)
   │         └──── deals (cierres)
   │
   └──── campaigns (origen de los leads, Fase 1 manual)
```

---

## 6. Matriz de Responsabilidades

| Tabla | n8n escribe | Next.js escribe | Next.js lee |
|-------|:-----------:|:---------------:|:-----------:|
| `inbox_queue` | ✅ Todo | ❌ | ✅ Monitoreo |
| `contacts` | ✅ Crea, stage, ai_summary | ✅ Edición manual, kanban | ✅ Kanban, contactos |
| `conversations` | ✅ Historial IA | ✅ Mensajes vendedor humano | ✅ Chat, perfil |
| `deals` | ❌ | ✅ Vendedor registra cierres | ✅ Dashboard métricas |
| `clients` | ❌ | ✅ Setup inicial | ✅ Configuración |
| `users` | ❌ | ✅ Auth y gestión | ✅ Asignaciones |
| `campaigns` | ❌ Por ahora | ✅ Manual Fase 1 | ✅ Dashboard |

---

## 7. Tiempo Real con Supabase Realtime

Las siguientes tablas deben tener **Row Level Security (RLS)** habilitado y suscripciones activas para actualizar el frontend automáticamente cuando n8n escribe:

| Tabla | Evento a escuchar | Sección del MVP que se actualiza |
|-------|------------------|----------------------------------|
| `contacts` | INSERT, UPDATE | Kanban (nueva tarjeta o cambio de etapa) |
| `contacts` | UPDATE (stage) | Dashboard (embudo de conversión) |
| `conversations` | INSERT | Chat (nuevo mensaje en tiempo real) |
| `deals` | INSERT | Dashboard (ingresos del mes) |
| `inbox_queue` | INSERT | Monitoreo de cola (opcional en MVP) |

---

## 8. Migraciones Recomendadas

Para no romper los flujos actuales de n8n, los cambios al schema existente se hacen como **adiciones no destructivas** (nunca eliminar ni renombrar columnas que n8n ya usa):

```sql
-- Paso 1: Crear tablas nuevas
CREATE TABLE clients (...);
CREATE TABLE users (...);
CREATE TABLE deals (...);
CREATE TABLE campaigns (...);

-- Paso 2: Agregar client_id a tablas existentes (si no existe)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS client_id UUID;
ALTER TABLE inbox_queue ADD COLUMN IF NOT EXISTS client_id UUID;

-- Paso 3: Agregar columnas nuevas a contacts (si no existen)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS role VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source_channel VARCHAR(50);

-- Paso 4: Habilitar Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Paso 5: Habilitar Realtime en las tablas clave
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE deals;
```

---

## 9. Paso Previo Obligatorio Antes de Escribir Código

Giovanny debe correr esta consulta en el SQL Editor de Supabase para obtener el schema real actual y validar que las columnas propuestas no colisionen con lo que n8n ya usa:

```sql
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

Con ese output se confirma el modelo final y se ajustan las migraciones antes de tocar nada en producción.

---

## 10. Consideraciones de Seguridad

- **Row Level Security (RLS) desde el día 1:** Cada cliente solo puede ver sus propios datos. La política RLS filtra por `client_id` en todas las tablas.
- **Credenciales de n8n en servidor:** Las credenciales de Supabase que usa n8n (service role key) nunca se exponen al frontend. El frontend usa la anon key con RLS.
- **Datos sensibles:** Números de teléfono, conversaciones y datos de empresa se almacenan solo en Supabase self-hosted o Supabase Cloud con cifrado en reposo activado.
- **Chatwoot self-hosted:** Las conversaciones de WhatsApp no pasan por servidores de terceros. Soberanía total de los datos del cliente.

---

*Documento técnico interno — Equipo Nella | Validar contra schema real de Supabase antes de ejecutar migraciones.*
