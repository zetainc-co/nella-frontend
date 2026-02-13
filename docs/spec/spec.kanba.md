# Spec — Módulo 02: Kanban
**Proyecto:** Nella Revenue OS | **Módulo:** Kanban | **Versión:** 1.0
**Audiencia:** Equipo de desarrollo | **Tipo:** Spec funcional

---

## 1. Propósito del Módulo

El Kanban es la vista de gestión activa de leads. Permite al equipo de ventas ver en qué etapa del proceso comercial está cada prospecto, mover leads manualmente entre etapas con drag-and-drop, y observar cómo la IA avanza los leads automáticamente en tiempo real. Es la pantalla que el vendedor va a tener abierta durante su jornada laboral.

---

## 2. Usuarios que Interactúan con Este Módulo

| Rol | Qué hace en el Kanban |
|-----|-----------------------|
| Admin | Ve todos los leads del cliente, puede reasignar y mover cualquier tarjeta |
| Sales Agent | Ve todos los leads (o solo los asignados según configuración), puede mover tarjetas |
| IA (n8n) | Mueve tarjetas automáticamente al actualizar el campo `stage` en la base de datos |

---

## 3. Estructura del Tablero

El tablero tiene cuatro columnas fijas en este orden. No se pueden agregar, eliminar ni reordenar columnas en el MVP.

| Columna | Valor de `stage` | Descripción |
|---------|-----------------|-------------|
| Nuevo | `new` | Lead acaba de llegar, la IA aún no ha interactuado o está en el primer mensaje |
| Contactado | `contacted` | La IA ha iniciado conversación y el lead está respondiendo |
| En Propuesta | `proposal` | La IA ha presentado el producto/servicio y hay interés activo |
| Cierre | `closed` | El lead aceptó agendar llamada o ya cerró negocio |

Cada columna muestra en su encabezado el nombre de la etapa y el conteo de leads que contiene en ese momento.

---

## 4. Tarjeta de Lead

Cada lead se representa como una tarjeta dentro de su columna correspondiente. La tarjeta muestra la siguiente información en orden de prioridad visual:

- **Nombre del lead** (o número de teléfono si aún no se tiene el nombre)
- **Canal de origen** con ícono de color (Instagram, Facebook, TikTok, WhatsApp)
- **Resumen IA** — fragmento corto del `ai_summary` (máximo 2 líneas)
- **Tiempo en etapa actual** — hace cuánto tiempo llegó a esta columna (ej. "hace 2 horas")
- **Avatar del vendedor asignado** — si tiene vendedor asignado, muestra su inicial o foto
- **Indicador de conversación activa** — punto animado si la IA está respondiendo en este momento

---

## 5. Comportamiento del Drag-and-Drop

El vendedor puede arrastrar cualquier tarjeta de una columna a otra. Al soltar la tarjeta:
1. La interfaz actualiza visualmente la posición de forma inmediata (optimistic update)
2. Se escribe el nuevo valor de `stage` en la tabla `contacts` en Supabase
3. Si la escritura falla, la tarjeta regresa a su posición original y se muestra un mensaje de error

Restricciones del MVP:
- No se puede mover una tarjeta a una columna anterior (no se puede "retroceder" un lead). Esta restricción puede levantarse en Fase 2.
- Solo el rol Admin puede mover tarjetas a la columna Cierre.

---

## 6. Comportamiento en Tiempo Real

Cuando n8n actualiza el `stage` de un contacto en Supabase, la tarjeta correspondiente se mueve automáticamente a la columna correcta sin que el vendedor tenga que hacer nada. La animación de movimiento debe ser visible y suave para que el vendedor note el cambio.

Cuando n8n crea un nuevo contacto, aparece una nueva tarjeta en la columna "Nuevo" de forma automática, con una animación de entrada sutil.

Esto se implementa vía Supabase Realtime suscrito a INSERT y UPDATE en la tabla `contacts`.

---

## 7. Acciones Disponibles en una Tarjeta

Al hacer clic en una tarjeta (no drag, sino clic), se abre un panel lateral (no una página nueva) con las siguientes acciones disponibles:

- **Ver perfil completo** — enlace que lleva a la página `/contacts/[id]`
- **Ir al chat** — enlace que lleva a la conversación del lead en el módulo de Chat
- **Asignar vendedor** — dropdown para asignar o cambiar el vendedor responsable (solo Admin)
- **Registrar cierre** — formulario rápido para registrar un deal ganado o perdido con monto y notas
- **Ver resumen IA completo** — expansión del `ai_summary` completo generado por el agente

---

## 8. Filtros del Kanban

En la parte superior del tablero hay una barra de filtros que permite reducir las tarjetas visibles:

- **Buscar por nombre o teléfono** — campo de texto que filtra tarjetas en tiempo real mientras el usuario escribe
- **Canal de origen** — dropdown multi-selección
- **Vendedor asignado** — dropdown (solo visible para Admin)
- **Solo mis leads** — toggle rápido para Sales Agent (muestra solo los leads asignados al usuario actual)

Los filtros no afectan los datos en la base de datos, solo la vista local.

---

## 9. Estados de la Interfaz

| Estado | Comportamiento esperado |
|--------|------------------------|
| Cargando inicial | Skeleton de columnas con tarjetas placeholder |
| Columna vacía | Mensaje dentro de la columna: "No hay leads en esta etapa" con ícono |
| Tarjeta en movimiento (drag) | Sombra elevada en la tarjeta, columnas destino se iluminan como zona de drop |
| Error al mover | Tarjeta regresa a origen, toast de error en pantalla |
| Nuevo lead en tiempo real | Tarjeta aparece en columna "Nuevo" con animación de entrada y highlight breve |
| Lead movido por IA | Tarjeta se desplaza con animación visible y badge temporal "Movido por IA" |

---

## 10. Datos que Consume

| Tabla | Operación | Filtros |
|-------|-----------|---------|
| `contacts` | SELECT todos los campos de tarjeta | client_id, stage (todos) |
| `contacts` | UPDATE stage | id del contacto |
| `users` | SELECT name, avatar | client_id (para dropdown de asignación) |
| `deals` | INSERT | contact_id (al registrar cierre desde panel lateral) |

---

## 11. Criterios de Aceptación

- [ ] El tablero carga con las 4 columnas y las tarjetas en su etapa correcta
- [ ] El conteo de leads en cada columna es correcto y se actualiza en tiempo real
- [ ] Drag-and-drop funciona en desktop y actualiza `stage` en Supabase correctamente
- [ ] Si n8n cambia el stage de un lead, la tarjeta se mueve automáticamente en menos de 3 segundos
- [ ] Si n8n crea un nuevo lead, aparece en la columna "Nuevo" sin recargar la página
- [ ] El panel lateral se abre al hacer clic en una tarjeta con todos sus datos cargados
- [ ] El filtro de búsqueda por nombre filtra las tarjetas en tiempo real mientras se escribe
- [ ] Si el movimiento de una tarjeta falla, la tarjeta regresa a su posición original
- [ ] En tablet el tablero hace scroll horizontal entre columnas de forma fluida

---

*Spec funcional v1.0 — Nella Revenue OS | Sujeto a ajustes según schema real de Supabase.*
