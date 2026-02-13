# Spec — Módulo 01: Dashboard
**Proyecto:** Nella Revenue OS | **Módulo:** Dashboard | **Versión:** 1.0
**Audiencia:** Equipo de desarrollo | **Tipo:** Spec funcional

---

## 1. Propósito del Módulo

El Dashboard es la pantalla de inicio del MVP. Su función es darle al usuario (vendedor o admin) una lectura instantánea del estado comercial: cuántos leads han llegado, en qué etapa están, cuánto dinero se ha generado y desde qué canales llega el tráfico. Todos los datos deben reflejar el estado real en tiempo real, sin necesidad de recargar la página.

---

## 2. Usuarios que Interactúan con Este Módulo

| Rol | Qué hace en el Dashboard |
|-----|--------------------------|
| Admin | Ve métricas globales de todos los leads y campañas del cliente |
| Sales Agent | Ve métricas filtradas a sus leads asignados (si aplica) |

---

## 3. Secciones y Componentes

### 3.1 Barra de Filtros
Permite al usuario segmentar todos los datos del dashboard por rango de fechas (hoy, esta semana, este mes, rango personalizado), canal de origen (todos / Instagram / Facebook / TikTok / WhatsApp directo) y vendedor asignado (solo visible para el rol Admin). Cuando el usuario cambia un filtro, todos los componentes del dashboard se actualizan simultáneamente. El filtro activo se mantiene visible en pantalla en todo momento.

---

### 3.2 KPI Cards
Cuatro tarjetas en fila horizontal. Cada una muestra un indicador clave con su valor actual y una comparación porcentual respecto al período anterior (flecha verde si sube, roja si baja).

| Tarjeta | Dato que muestra | Fuente |
|---------|-----------------|--------|
| Total de Leads | Cantidad de contactos creados en el período | Tabla `contacts` |
| Leads Activos | Contactos en stage distinto a 'closed' o 'lost' | Tabla `contacts` |
| Ingresos del Período | Suma de `amount` de deals con status 'won' | Tabla `deals` |
| Tasa de Cierre | % de leads que llegaron a 'closed' vs total | `contacts` + `deals` |

---

### 3.3 Gráfica de Ingresos por Mes
Gráfica de línea que muestra la evolución de ingresos mes a mes. El usuario puede hacer hover sobre cualquier punto para ver el valor exacto. Si no hay datos de un mes, la línea muestra cero sin romper la gráfica. Muestra los últimos 6 meses por defecto.

Dato: suma de `deals.amount` agrupada por mes de `closed_at`.

---

### 3.4 Leads por Canal
Gráfica de torta o barras horizontales con la distribución porcentual de leads según `source_channel`. Colores fijos por canal: Instagram (morado), Facebook (azul), TikTok (negro/rojo), WhatsApp directo (verde). El usuario puede hacer clic en un canal para filtrar el resto del dashboard.

Dato: count de `contacts` agrupado por `source_channel`.

---

### 3.5 Embudo de Conversión
Visualiza cuántos leads hay en cada etapa: Nuevo → Contactado → En Propuesta → Cierre. Cada etapa muestra el número absoluto y el porcentaje de conversión respecto a la etapa anterior.

Dato: count de `contacts` agrupado por `stage`.

---

### 3.6 Actividad Reciente
Lista con los últimos 10 eventos relevantes ordenados por tiempo. Cada evento muestra tipo de evento, nombre del lead involucrado y tiempo transcurrido (ej. "hace 5 minutos").

Tipos de eventos:
- Nuevo lead llegó desde [canal]
- Lead [nombre] avanzó a etapa [etapa]
- Venta cerrada con [nombre] por [monto]
- Vendedor [nombre] tomó control de conversación con [lead]

Dato: combinación de inserts/updates recientes en `contacts`, `deals` y `conversations`.

---

## 4. Comportamiento en Tiempo Real

El Dashboard se actualiza automáticamente (sin recargar) cuando n8n crea un nuevo contacto, cuando n8n actualiza el `stage` de un contacto, y cuando el vendedor registra un nuevo deal. Se implementa vía Supabase Realtime suscrito a `contacts` y `deals`. Solo se actualiza el componente afectado, no toda la página.

---

## 5. Estados de la Interfaz

| Estado | Comportamiento esperado |
|--------|------------------------|
| Cargando | Skeleton loaders en cada componente |
| Sin datos | Estado vacío con mensaje descriptivo por componente |
| Error de conexión | Banner no intrusivo indicando que los datos pueden no estar actualizados |
| Tiempo real activo | Punto verde sutil que confirma la conexión en vivo |

---

## 6. Navegación desde el Dashboard

- Clic en KPI Card → va a Contactos filtrado por ese criterio
- Clic en barra del embudo → va a Kanban filtrado por esa etapa
- Clic en evento de actividad reciente → va al perfil del lead correspondiente

---

## 7. Datos que Consume

| Tabla | Operación | Filtros |
|-------|-----------|---------|
| `contacts` | COUNT, GROUP BY stage, GROUP BY source_channel | client_id, rango de fechas |
| `deals` | SUM(amount), COUNT, GROUP BY mes | client_id, rango de fechas, status = 'won' |
| `conversations` | SELECT recientes | client_id, últimas 10 por updated_at |

---

## 8. Criterios de Aceptación

- [ ] Todos los KPI Cards muestran datos reales desde Supabase al cargar
- [ ] Los filtros de fecha y canal actualizan todos los componentes simultáneamente
- [ ] Un nuevo lead de n8n aparece en el Dashboard en menos de 3 segundos sin recargar
- [ ] La gráfica de ingresos muestra correctamente meses sin datos (valor cero, sin romper)
- [ ] El embudo calcula correctamente el porcentaje de conversión entre etapas
- [ ] En mobile los KPI Cards se apilan verticalmente y las gráficas son legibles
- [ ] El estado vacío se muestra cuando no hay datos para el filtro seleccionado

---

*Spec funcional v1.0 — Nella Revenue OS | Sujeto a ajustes según schema real de Supabase.*
