# Spec — Módulo 04: Chat
**Proyecto:** Nella Revenue OS | **Módulo:** Chat | **Versión:** 1.0
**Audiencia:** Equipo de desarrollo | **Tipo:** Spec funcional

---

## 1. Propósito del Módulo

El módulo de Chat es la ventana de monitoreo y control de las conversaciones activas de WhatsApp. Su función principal es permitir al vendedor observar en tiempo real lo que la IA está respondiendo, intervenir cuando sea necesario tomando el control de la conversación, y responder directamente sin salir de la plataforma. Es el puente entre la automatización y la atención humana.

---

## 2. Usuarios que Interactúan con Este Módulo

| Rol | Qué hace en el Chat |
|-----|---------------------|
| Admin | Monitorea todas las conversaciones activas, puede intervenir en cualquiera |
| Sales Agent | Monitorea sus conversaciones asignadas, interviene cuando la IA lo notifica |
| IA (n8n) | Escribe mensajes automáticamente, marca conversaciones que requieren atención humana |

---

## 3. Estrategia de Implementación por Fases

### MVP (Fase 1) — Iframe de Chatwoot
Para cumplir con los tiempos de entrega, el módulo de Chat en el MVP se implementa embebiendo el panel de Chatwoot directamente dentro del layout de Nella mediante un iframe. Chatwoot ya tiene todas las conversaciones de WhatsApp, el historial y la capacidad de respuesta humana.

El iframe debe:
- Ocupar el 100% del área de contenido disponible dentro del layout de Nella
- Aplicar estilos CSS que reduzcan la visibilidad del header propio de Chatwoot (para que no se vea como una aplicación incrustada sino parte de Nella)
- Pre-autenticar al usuario de Nella en Chatwoot de forma transparente (SSO o token compartido) para que no tenga que iniciar sesión dos veces

**Limitación conocida del MVP:** La barra de navegación y el sidebar de Chatwoot son visibles. Se acepta esta limitación para el MVP.

### Fase 2 — UI Propia con API de Chatwoot
En Fase 2 se reemplaza el iframe por una interfaz construida en Next.js que consume la API REST y el WebSocket de Chatwoot. Esto permite una experiencia completamente unificada con el diseño de Nella.

El resto de esta spec describe el comportamiento funcional que aplica tanto al MVP (en lo que Chatwoot ya soporta) como a la Fase 2 (UI propia).

---

## 4. Layout del Módulo

El módulo de Chat tiene tres paneles:

**Panel izquierdo — Lista de conversaciones (30% del ancho)**
Lista de todas las conversaciones activas, ordenadas por la más reciente primero. Cada conversación en la lista muestra:
- Nombre del lead (o teléfono si no hay nombre)
- Fragmento del último mensaje (máximo 1 línea)
- Tiempo del último mensaje
- Indicador de estado: "IA activa" (azul) o "Requiere atención" (rojo) o "Humano en control" (verde)
- Canal de origen con ícono

**Panel central — Conversación activa (70% del ancho)**
Vista del hilo de mensajes de la conversación seleccionada en el panel izquierdo. Los mensajes se muestran en formato burbuja diferenciando visualmente:
- Mensajes del lead (izquierda, fondo gris)
- Mensajes de la IA (derecha, fondo azul claro con etiqueta "IA")
- Mensajes del vendedor humano (derecha, fondo verde con etiqueta con el nombre del vendedor)

**Panel derecho — Información del lead (solo en Fase 2)**
En Fase 2, panel colapsable con el resumen del lead, su etapa actual y enlace al perfil completo. En MVP esta info no está disponible dentro del chat.

---

## 5. Estados de una Conversación

Cada conversación tiene un estado que determina quién tiene el control:

| Estado | Quién responde | Indicador visual |
|--------|---------------|-----------------|
| IA Activa | El agente de n8n responde automáticamente | Badge azul "IA" |
| Requiere Atención | La IA detectó que necesita intervención humana y pausó sus respuestas | Badge rojo parpadeante "Atención" |
| Humano en Control | Un vendedor tomó el control, la IA está pausada | Badge verde con nombre del vendedor |
| Resuelta | La conversación fue marcada como cerrada | Badge gris "Cerrada" |

---

## 6. Intervención Humana (Handoff)

### 6.1 Cómo se activa "Requiere Atención"
Cuando el agente de n8n detecta que una situación supera su capacidad (objeción compleja, solicitud fuera del script, señal de cierre de alto valor), escribe en la tabla `conversations` un registro con `role = 'system'` y un flag de alerta. El sistema de Nella capta este evento vía Supabase Realtime y cambia el estado de la conversación a "Requiere Atención", mostrando una notificación push al vendedor asignado.

### 6.2 Cómo el vendedor toma el control
El vendedor hace clic en el botón "Tomar control" visible en la conversación con estado "Requiere Atención". Al activarlo:
1. El estado de la conversación cambia a "Humano en Control"
2. n8n deja de enviar respuestas automáticas para ese contacto
3. El vendedor puede escribir y enviar mensajes directamente desde la interfaz
4. Los mensajes del vendedor se guardan en `conversations` con `role = 'human_agent'`

### 6.3 Cómo el vendedor devuelve el control a la IA
Botón "Devolver a IA" visible cuando el estado es "Humano en Control". Al activarlo, el estado regresa a "IA Activa" y n8n retoma las respuestas automáticas con el contexto completo de lo que escribió el vendedor.

---

## 7. Composición de Mensajes (Cuando el Vendedor Tiene el Control)

Cuando una conversación está en estado "Humano en Control", el panel central muestra una caja de texto en la parte inferior para que el vendedor redacte y envíe mensajes.

Funcionalidades de la caja de texto:
- Texto libre con soporte para saltos de línea (Shift + Enter para nueva línea, Enter para enviar)
- Indicador de caracteres si aplica el límite de WhatsApp (1024 caracteres por mensaje de plantilla, sin límite en mensajes de sesión activa)
- Botón de envío con estado de carga mientras el mensaje se procesa

El mensaje viaja por la API Route `/api/chat` de Next.js, que lo entrega a Chatwoot y de Chatwoot a la API de WhatsApp.

---

## 8. Notificaciones

Cuando una conversación cambia a estado "Requiere Atención", el sistema debe notificar al vendedor asignado de las siguientes formas:

- **In-app:** Badge rojo con número en el ícono del módulo de Chat en el sidebar de navegación
- **Toast:** Notificación emergente en la pantalla del vendedor con el nombre del lead y el último mensaje, con botón de acción directa "Ver conversación"
- **Sonido (opcional, configurable):** Sonido de notificación sutil que el usuario puede desactivar en su perfil

---

## 9. Filtros de la Lista de Conversaciones

Sobre el panel izquierdo, filtros para reducir las conversaciones visibles:

- **Búsqueda:** por nombre del lead o teléfono
- **Estado:** todos / IA activa / requiere atención / humano en control / resueltas
- **Canal:** todos / Instagram / Facebook / TikTok / WhatsApp directo
- **Mis conversaciones:** toggle para ver solo las asignadas al usuario actual

---

## 10. Comportamiento en Tiempo Real

Los siguientes eventos deben reflejarse en el Chat sin recargar la página:

| Evento | Origen | Efecto en la UI |
|--------|--------|-----------------|
| Nuevo mensaje del lead | n8n escribe en `conversations` | Aparece en el hilo de la conversación activa y actualiza el preview en la lista |
| Nuevo mensaje de la IA | n8n escribe en `conversations` | Aparece en el hilo con badge "IA" |
| Conversación requiere atención | n8n escribe flag de alerta | Badge cambia a rojo, notificación push al vendedor |
| Nueva conversación (lead nuevo) | n8n crea contacto | Aparece en la lista de conversaciones |

Implementación: Supabase Realtime suscrito a INSERT en `conversations`, filtrado por `client_id`.

---

## 11. Estados de la Interfaz

| Estado | Comportamiento esperado |
|--------|------------------------|
| Sin conversaciones | Estado vacío con texto "No hay conversaciones activas. Las campañas activas comenzarán a generar conversaciones automáticamente." |
| Cargando conversación | Skeleton de burbujas mientras se carga el historial |
| Enviando mensaje | Burbuja del mensaje aparece inmediatamente con indicador de "enviando..." que se resuelve al confirmar entrega |
| Error de envío | Burbuja muestra ícono de error con opción de reintentar |
| Conexión perdida | Banner de advertencia indicando que los mensajes nuevos pueden no estar llegando |

---

## 12. Datos que Consume

| Tabla / API | Operación | Notas |
|-------------|-----------|-------|
| `conversations` | SELECT historial | Por contact_id, orden por sent_at |
| `conversations` | INSERT mensaje humano | role = 'human_agent' |
| `conversations` | Realtime suscripción | INSERT para nuevos mensajes en tiempo real |
| `contacts` | SELECT nombre, stage, channel | Para mostrar info del lead en la lista |
| Chatwoot API | POST mensaje | Envío real a WhatsApp vía Chatwoot |
| Chatwoot API | GET conversaciones | Solo en Fase 2 (MVP usa iframe) |

---

## 13. Criterios de Aceptación

- [ ] El iframe de Chatwoot carga correctamente dentro del layout de Nella sin mostrar doble scroll
- [ ] El usuario de Nella no tiene que iniciar sesión por separado en Chatwoot
- [ ] Las conversaciones con estado "Requiere Atención" muestran el badge rojo claramente
- [ ] Al hacer clic en "Tomar control", n8n deja de responder y el vendedor puede escribir
- [ ] Al hacer clic en "Devolver a IA", n8n retoma las respuestas correctamente
- [ ] Un mensaje nuevo de un lead aparece en el hilo en menos de 3 segundos sin recargar
- [ ] La notificación in-app aparece cuando una conversación requiere atención
- [ ] El filtro de búsqueda por nombre filtra la lista de conversaciones en tiempo real
- [ ] En mobile el layout colapsa a una sola columna (lista de conversaciones → conversación activa)

---

## 14. Deuda Técnica Aceptada en el MVP

Estos puntos se resuelven en Fase 2 y están documentados como deuda técnica conocida:

- La UI del Chat en MVP hereda el diseño visual de Chatwoot (no el de Nella)
- No hay panel de información del lead dentro del chat en MVP
- El filtro por estado (IA activa / requiere atención) en MVP depende de la implementación en Chatwoot, no de Nella

---

*Spec funcional v1.0 — Nella Revenue OS | Sujeto a ajustes según schema real de Supabase y configuración de Chatwoot.*
