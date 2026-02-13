# 🏛️ DOCUMENTACIÓN MAESTRA: NELLA REVENUE OS

**Versión:** 2.0 (Production Ready)
**Arquitectura:** Event-Driven Microservices
**Objetivo:** Infraestructura Operativa de Ingresos (High-Ticket)
**Infraestructura:** Single-Tenant (Aislamiento total de DB y ejecución por cliente)

---

## 1. STACK TECNOLÓGICO (LA CAJA NEGRA)

- **Host:** Hetzner Cloud (High Performance) gestionado vía Easypanel/Docker
- **Logic Core:** n8n (Orquestación de workflows asíncronos)
- **Persistence Layer:** PostgreSQL (Relacional + Vectorial pgvector)
- **Human Interface:** Chatwoot Self-Hosted (Consola de Operación)
- **Config Layer:** Tabla `system_config` (System Prompts dinámicos y ajustes globales)
- **BI & Analytics:** Metabase (Dashboard Cliente Final)
  - *Nota: Alias de datos formateados para lectura ejecutiva*

---

## 2. ESTRUCTURA DE DATOS CRÍTICA (PostgreSQL)

### A. TABLA MAESTRA: `contacts` (El Activo)

**El CRM vivo que respira con cada interacción.**

#### Identidad
- `id` (Serial)
- `phone` (Unique PK)
- `name`
- `email`

#### Termómetro de Venta
- **`lead_status`** (Enum: `'COLD'`, `'WARM'`, `'HOT'`, `'CLIENT'`)
  - Actualizado automáticamente por The Strategist

#### Semáforo de Control
- **`handoff_active`** (Boolean)
  - Si es `TRUE`, el Módulo 2 bloquea la inferencia de IA para respetar al humano

#### Inteligencia Estratégica
- **`ai_summary`** (Text)
  - Bitácora evolutiva; la IA resume lo que sabe del lead tras cada charla

#### Motores de Growth
- **`last_interaction_at`** (Timestamp)
  - Vital para cron jobs de reactivación
- **`next_purchase_prediction`** (Date)
- **`referral_code`** (String)

### B. TABLAS DE INFRAESTRUCTURA

#### `inbox_queue`
Buffer de entrada de alta velocidad.

**Estados:** `PENDING` → `NORMALIZED` → `PROCESSING` → `PROCESSED` → `COMPLETED`

#### `conversations`
Historial de chat granular (User + Assistant) y almacenamiento de vectores para RAG.

#### `system_config`
Cerebro configurable. Permite ajustar la personalidad de la IA sin tocar código.

---

## 3. FLUJO DE DATOS Y LÓGICA MODULAR (The OS Architecture)

### 📥 MÓDULO 1: GATEWAY & SENSES (Ingesta)

**Misión:** Recibir, proteger (Buffer) y estandarizar.

#### Recepción
Webhook Meta (Cloud API) → Respuesta inmediata HTTP 200 OK (Para evitar retries de Meta) → Inserción en `inbox_queue` (Estado `PENDING`)

#### Worker (Normalización)
Cron de micro-segundos que procesa la cola.

#### Sentidos Multimodales
- **Audio:** Transcripción vía OpenAI Whisper
- **Visión:** Análisis vía GPT-4o Vision (Clasificación: VENTA vs RUIDO)
- **Texto:** Extracción limpia

#### Flag Crítico
Si detecta Multimedia de venta (Comprobante) o Documento, marca `handoff_needed = TRUE`

#### Cierre
Actualiza fila a `NORMALIZED` con JSON enriquecido.

---

### 🧠 MÓDULO 2: THE ORCHESTRATOR ("THE HIVE")

**Misión:** Cerebro central. Coordina Datos, Lógica y Tiempos.

#### A. TRIGGER & CONTEXT AGGREGATION (Anti-Spam)

- **Polling Inteligente:** Lee `inbox_queue` (`NORMALIZED`) usando `FOR UPDATE SKIP LOCKED` (Evita colisiones)
- **Lógica de Agregación:** Si un usuario envía 3 mensajes seguidos ("Hola" + "Precio" + "Foto"), el nodo de código los agrupa en un solo "Bloque de Contexto". La IA procesa 1 vez, no 3.

#### B. LOGIC GATE (Aduana)

- **Verificación de Seguridad:** ¿`handoff_needed` (M1) es TRUE? O ¿`handoff_active` (DB) es TRUE?
- **Decisión:** Define ruta `SALES MODE` (IA responde) o `ALERT MODE` (Notifica al equipo)

#### C. SUB-WORKFLOW A: "THE PROFILER" (Datos)

- Identificación o Creación del contacto en DB
- Enriquecimiento de perfil (Nombre, Scoring inicial)

#### D. SUB-WORKFLOW B: "THE STRATEGIST" (Generación)

- Consulta RAG (Historial) + System Prompt Dinámico
- Genera `response_message` y define `ai_clasificacion`

#### E. THE FORK PROTOCOL (Ejecución Paralela)

**Aquí ocurre la magia de la latencia baja.** Una vez generado el mensaje, el flujo se bifurca:

##### Carril Rápido (User First)
Pasa directo a Preparar Datos → Invoca al Módulo 3 (Delivery). El usuario recibe respuesta en ~200ms.

##### Carril de Registro (System Second)
- Ejecuta **SUB-WORKFLOW C: "THE MIRROR"**: Inyecta el mensaje en Chatwoot (Outgoing) para visibilidad del agente
- Actualiza CRM (`contacts`) con nuevo resumen y estado
- Marca mensajes originales como `PROCESSED`

---

### 📤 MÓDULO 3: DELIVERY (Transportista Agnóstico)

**Misión:** Entregar el mensaje a WhatsApp.

- **Input:** Recibe `{ target_phone, message_body }`
- **Lógica:** Cero lógica de negocio. Solo ejecuta POST a Meta WhatsApp API
- **Dependencia:** Aislado. No sabe qué es Chatwoot ni Postgres. Solo cumple órdenes

---

### 🌱 MÓDULO 4: GROWTH SATELLITES (Async - Background)

**Misión:** Tareas de fondo que no bloquean la operación.

#### CAPI Bridge
Listener que detecta cambios a `lead_status = HOT` y dispara evento a Meta Ads (Optimización de Pixel).

#### Re-Engagement
Cron Job nocturno. Si `last_interaction_at > 24h` y el lead sigue tibio, dispara reactivación automática.

---

### 🌉 MÓDULO 5: THE HUMAN BRIDGE (Intervención)

**Misión:** Permitir que el humano "tome el volante" sin romper el coche.

#### Trigger
Webhook de Chatwoot (`message_created`)

#### Gatekeeper (Seguridad)
- ¿Es mensaje de salida (`outgoing`)?
- ¿Es `private == false`? (Filtra notas internas)

#### Switch de Control
Al detectar respuesta humana, actualiza `contacts → handoff_active = TRUE`. Esto silencia al Módulo 2 inmediatamente.

#### Acción
Limpia el texto y lo envía al Módulo 3 (Delivery) para que llegue al usuario final por WhatsApp.

---

## 🏛️ FILOSOFÍA DE ARQUITECTURA (POR QUÉ ES UN OS)

### Agnosticismo de Componentes
Si mañana Meta desaparece y usamos Telegram, solo cambiamos el Módulo 1 y 3. El Cerebro (M2) y el CRM siguen intactos.

### User-Centric Latency
Gracias al **Fork Protocol**, la experiencia del usuario final es prioritaria sobre la burocracia de la base de datos.

### State Management
El sistema no "adivina" el estado. Lo lee de una base de datos persistente (`handoff_active`), permitiendo transiciones fluidas entre Robot y Humano.

---

