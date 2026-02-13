# Spec — Módulo 03: Contacts
**Proyecto:** Nella Revenue OS | **Módulo:** Contacts | **Versión:** 1.0
**Audiencia:** Equipo de desarrollo | **Tipo:** Spec funcional

---

## 1. Propósito del Módulo

El módulo de Contactos es el registro centralizado de todos los leads que han llegado al sistema. Tiene dos vistas: el listado general (tabla paginada con búsqueda y filtros) y el perfil individual de cada lead (página de detalle con toda la información disponible). Es el lugar donde el vendedor consulta el historial completo de un prospecto antes de una llamada de cierre.

---

## 2. Usuarios que Interactúan con Este Módulo

| Rol | Qué hace en Contactos |
|-----|-----------------------|
| Admin | Ve todos los contactos del cliente, puede editar, asignar y eliminar |
| Sales Agent | Ve todos los contactos (o solo los asignados), puede editar datos básicos |
| IA (n8n) | Crea contactos nuevos y actualiza campos como `stage`, `ai_summary`, `name` |

---

## 3. Vista 1: Listado de Contactos (`/contacts`)

### 3.1 Tabla de Contactos
Tabla paginada que muestra todos los leads registrados. Cada fila representa un contacto y muestra las siguientes columnas:

| Columna | Dato | Ordenable |
|---------|------|-----------|
| Nombre | `contacts.name` o teléfono si no hay nombre | ✅ |
| Teléfono | `contacts.phone` | ❌ |
| Canal | `contacts.source_channel` con ícono de color | ✅ |
| Etapa | `contacts.stage` con badge de color | ✅ |
| Vendedor | Avatar + nombre del vendedor asignado | ✅ |
| Última actividad | Fecha del último mensaje en `conversations` | ✅ |
| Fecha de entrada | `contacts.created_at` | ✅ |

Al hacer clic en cualquier fila se navega al perfil individual del contacto.

Paginación: 25 contactos por página con controles de navegación (anterior / siguiente / ir a página).

### 3.2 Barra de Búsqueda y Filtros
Ubicada sobre la tabla. Permite combinar múltiples filtros simultáneamente:

- **Búsqueda de texto libre:** filtra por nombre, teléfono o empresa mientras el usuario escribe
- **Etapa:** dropdown multi-selección con las 4 etapas (new, contacted, proposal, closed)
- **Canal de origen:** dropdown multi-selección
- **Vendedor asignado:** dropdown (solo visible para Admin)
- **Rango de fechas:** filtro por `created_at`
- **Botón limpiar filtros:** restablece todos los filtros al estado inicial

### 3.3 Crear Contacto Manual
Botón "Nuevo contacto" en la esquina superior derecha. Abre un modal con un formulario mínimo para crear un contacto que no llegó por una campaña:

Campos requeridos: teléfono
Campos opcionales: nombre, email, empresa, rol, canal de origen, vendedor asignado, notas iniciales

Al guardar, el contacto se crea en la tabla `contacts` con `stage = 'new'` y queda disponible en el listado inmediatamente.

### 3.4 Acciones en Masa
Cuando el usuario selecciona múltiples contactos con el checkbox de cada fila, aparece una barra de acciones en masa:
- Asignar vendedor a los seleccionados
- Cambiar etapa de los seleccionados
- Exportar seleccionados a CSV

---

## 4. Vista 2: Perfil Individual del Contacto (`/contacts/[id]`)

### 4.1 Encabezado del Perfil
Parte superior de la página con la información de identidad del lead:
- Nombre completo (editable inline)
- Número de teléfono
- Canal de origen con ícono
- Badge de etapa actual (editable con dropdown)
- Avatar generado con las iniciales del nombre
- Vendedor asignado (editable con dropdown, solo Admin)
- Botones de acción rápida: "Ir al chat", "Registrar cierre"

### 4.2 Panel de Información del Lead
Sección con los datos del perfil organizados en grupos editables. El vendedor puede editar cualquier campo haciendo clic sobre él (edición inline, no formulario aparte).

**Datos personales:**
- Nombre completo
- Email
- Teléfono

**Datos profesionales:**
- Empresa
- Rol / Cargo dentro de la empresa

**Contexto comercial (generado por la IA, editable por el vendedor):**
- Resumen de la conversación (`ai_summary`)
- Presupuesto / objeciones detectadas (`budget`)
- Notas del vendedor (campo libre)

### 4.3 Resumen IA
Bloque destacado (fondo diferenciado) que muestra el `ai_summary` completo generado por el agente. Incluye una etiqueta que indica cuándo fue la última actualización del resumen. El vendedor puede editar este campo si quiere agregar contexto manual.

### 4.4 Historial de Conversación
Lista cronológica de todos los mensajes de la tabla `conversations` asociados a este contacto. Cada mensaje muestra:
- Quién lo envió (usuario, IA o vendedor humano) con diferenciación visual clara
- Contenido del mensaje (texto, o indicador de tipo si es audio/imagen)
- Hora y fecha de envío

Los mensajes se cargan de más reciente a más antiguo, con scroll hacia arriba para ver el historial completo. Si hay más de 50 mensajes, se cargan en bloques de 50 (infinite scroll hacia arriba).

### 4.5 Línea de Tiempo de Actividad
Sección lateral o inferior que muestra los eventos clave del ciclo de vida del lead en orden cronológico:
- Fecha en que llegó al sistema
- Cada cambio de etapa (quién lo hizo: IA o vendedor)
- Si hubo intervención humana en el chat (vendedor tomó control)
- Si se registró un deal (ganado o perdido)

### 4.6 Registro de Deals
Si el contacto tiene deals asociados, se muestran en una lista compacta con monto, estado (won/lost), fecha y nombre del vendedor que cerró. Botón para agregar un nuevo deal directamente desde el perfil.

---

## 5. Comportamiento en Tiempo Real

El perfil individual de un contacto se actualiza automáticamente cuando n8n modifica el `ai_summary`, cambia el `stage` o agrega nuevos mensajes a `conversations`. Esto es especialmente útil cuando el vendedor tiene el perfil abierto mientras la IA está trabajando en la conversación.

---

## 6. Estados de la Interfaz

| Estado | Comportamiento esperado |
|--------|------------------------|
| Cargando listado | Skeleton de tabla con filas placeholder |
| Sin resultados en búsqueda | Mensaje "No encontramos contactos con esos filtros" con botón para limpiar |
| Listado vacío (sin leads aún) | Estado vacío con ilustración y texto "Aún no hay leads. Las campañas activas comenzarán a llenarlos automáticamente." |
| Cargando perfil individual | Skeleton del layout del perfil |
| Guardando edición inline | Indicador de carga en el campo editado, confirmación visual al guardar |
| Error al guardar | Campo regresa al valor anterior, mensaje de error inline |

---

## 7. Datos que Consume

| Tabla | Operación | Notas |
|-------|-----------|-------|
| `contacts` | SELECT (listado y perfil) | Filtros por client_id, stage, channel, fechas |
| `contacts` | INSERT (crear manual) | Requiere al menos phone |
| `contacts` | UPDATE (edición inline) | Campos editables del perfil |
| `conversations` | SELECT (historial) | Paginado por contact_id, orden por sent_at |
| `deals` | SELECT + INSERT | Asociados al contact_id |
| `users` | SELECT | Para dropdown de asignación |

---

## 8. Criterios de Aceptación

- [ ] El listado carga correctamente con paginación de 25 registros por página
- [ ] La búsqueda por nombre o teléfono filtra resultados mientras se escribe (debounce de 300ms)
- [ ] Al combinar múltiples filtros los resultados son correctos
- [ ] El botón "Nuevo contacto" abre el modal y crea el contacto correctamente en Supabase
- [ ] Al hacer clic en una fila navega al perfil individual del contacto
- [ ] La edición inline guarda cambios en Supabase y muestra confirmación visual
- [ ] El historial de conversación muestra mensajes diferenciados visualmente por remitente (usuario, IA, humano)
- [ ] Si n8n actualiza el `ai_summary` mientras el perfil está abierto, se refleja automáticamente
- [ ] La línea de tiempo de actividad muestra los eventos en orden cronológico correcto
- [ ] En mobile el listado se convierte en tarjetas apiladas y el perfil es navegable con scroll vertical

---

*Spec funcional v1.0 — Nella Revenue OS | Sujeto a ajustes según schema real de Supabase.*
