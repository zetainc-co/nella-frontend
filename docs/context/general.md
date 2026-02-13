# Nella Revenue OS — Reporte de Contexto General del Proyecto
**Fecha:** Febrero 2026 | **Estado:** MVP en desarrollo activo

---

## 1. ¿Qué es Nella?

Nella no es un chatbot ni un SaaS tradicional. Es un **Sistema Operativo de Ingresos (Revenue OS)** — una infraestructura tecnológica centralizada que reemplaza el stack fragmentado del área comercial (CRM + chatbots + Ads Manager + email marketing) por un único sistema que gestiona todo el ciclo de vida del cliente: desde el clic en el anuncio hasta el cierre de la venta y la recompra.

**Filosofía central: "Closed-Loop Marketing"**
La data de las ventas reales se inyecta de vuelta a Meta vía API de Conversiones (CAPI) para optimizar automáticamente la inversión publicitaria. El sistema aprende y mejora solo.

**El cambio de paradigma:**
- De: `Anuncio → Lead → Abismo` (el modelo actual roto del mercado)
- A: `Anuncio → Lead → Calificación IA → Cierre → Data → Mejor Anuncio` (circularidad)

---

## 2. El Problema que Resuelve

Las empresas pierden ventas porque no responden rápido a los clientes interesados. El equipo de ventas está ocupado, tarda horas o días en responder por WhatsApp, y el prospecto se va. Nella automatiza ese primer contacto con una IA que se siente humana, cualifica al lead y agenda la llamada de cierre — para que el vendedor humano solo intervenga cuando el prospecto ya está listo para comprar.

---

## 3. Arquitectura Técnica del Sistema

El sistema opera bajo una arquitectura de **microservicios orquestados por eventos**.

### Módulos del Backend

| Módulo | Nombre | Función | Estado |
|--------|--------|---------|--------|
| M1 | Gateway & Worker (Ingesta) | Recibe, normaliza y encola tráfico de WhatsApp. Soporta texto, audio (Whisper) e imagen (Vision). | ✅ 100% Listo |
| M2 | Orquestador (IA) | Motor de inteligencia central. Incluye The Profiler (gestión de usuarios) y The Strategist (GPT-4o con control de alucinaciones y scripts de venta dinámicos). | ✅ 100% Listo |
| M3 | Delivery (Meta) | Conectividad robusta con la API oficial de WhatsApp Business. Gestión de errores y reintentos. | ✅ 100% Listo |
| M5 | Human Bridge | Pasarela bidireccional con Chatwoot. Permite intervención humana sin romper el flujo de automatización. | ✅ 100% Listo |
| Base de Datos | CRM Core | Estructura relacional en PostgreSQL (tablas: contacts, conversations, inbox_queue). | ✅ 100% Listo |
| M6 | Growth Loop (CAPI) | Conexión de ventas reales hacia Meta Ads para optimización automática del pixel. | 📅 Pendiente |
| — | Ad-Launcher | Creación automática de campañas en Meta/Google/TikTok desde la interfaz. | 📅 Pendiente |
| — | Dashboard Cliente | WebApp para que el cliente visualice su ROI y gestione leads. | 📅 En construcción |
| — | Voice AI | Agentes telefónicos con voz humana para confirmación de citas y reactivación. | 📅 Pendiente |

### Stack Tecnológico

- **Orquestación de flujos:** n8n (self-hosted)
- **Base de datos:** PostgreSQL / Supabase
- **IA & NLP:** OpenAI GPT-4o, Whisper (audio), Vision (imágenes)
- **Mensajería:** WhatsApp Business API (Cloud API oficial de Meta)
- **CRM / Chat:** Chatwoot (self-hosted, soberanía de datos)
- **Infraestructura:** Servidores dedicados vía Easypanel / Docker

---

## 4. Hoja de Ruta: MVP vs. Visión Final

### 🟢 Fase 1 — El MVP (Operación Híbrida)
**Objetivo:** Generar rentabilidad desde el Día 1 con intervención técnica mínima.

El MVP es una interfaz web unificada con cuatro secciones principales que centraliza lo que hoy está disperso entre n8n, Supabase y Chatwoot:

- **Dashboard** — Métricas clave en tiempo real: leads totales, leads activos, ingresos por mes, canales de origen (Instagram, TikTok, Meta), embudo de conversión (nuevo → contactado → propuesta → cierre).
- **Kanban** — Vista de leads por etapa, actualizable automáticamente por la IA o manualmente por el vendedor.
- **Contactos** — Perfil de cada lead: nombre, empresa, rol, datos de contacto, resumen de conversación generado por IA.
- **Chat** — Conversaciones de WhatsApp integradas nativamente (actualmente en Chatwoot, meta es traerlas al MVP).

**Modelo operativo:** La IA cualifica y filtra el 90% del tráfico. El humano solo interviene en casos de alta complejidad o para el cierre final.

**Generación de campañas en Fase 1:** Manual, ejecutada por el equipo, pero conectada al cierre automático.

### 🟣 Fase 2 — Revenue OS (Operación Autónoma — 2026)

- **Ad-Launcher:** El OS crea, redacta y lanza campañas en Meta/Google/TikTok vía API sin intervención humana.
- **Growth Loop Completo (M6):** CAPI en tiempo real. El sistema le reporta a Facebook qué leads compraron para optimizar el pixel automáticamente.
- **Dashboard App Propio:** WebApp propietaria donde el cliente ve su ROI, gestiona flujos y recarga créditos.
- **Voice AI:** Agentes telefónicos para confirmación de citas y reactivación de bases de datos.
- **Marketplace de Flujos:** Librería de estrategias pre-cargadas activables con un clic.

---

## 5. Modelo de Negocio

### B2B — Infrastructure Licensing
Licenciamiento del Sistema Operativo para agencias o corporativos que requieren procesar altos volúmenes de leads con infraestructura propia. Modalidad **White Label**.

### B2C — Growth Performance
Implementación del OS directamente en empresas finales para maximizar el LTV (Life Time Value) y reducir el CAC (Costo de Adquisición) mediante automatización total.

---

## 6. Principios de Diseño No Negociables

1. **Escalabilidad:** Instalar Nella en un nuevo cliente debe ser enchufar y listo — sin desarrollos a medida cada vez.
2. **Estabilidad:** Infraestructura robusta en servidores dedicados. Cero dependencia de herramientas no oficiales de WhatsApp que puedan ser bloqueadas por Meta.
3. **Seguridad:** Datos sensibles de clientes protegidos. Chatwoot self-hosted para soberanía total de la información.
4. **Velocidad de salida:** El mercado de automatización con IA está acelerando. Salir tarde es perder oportunidad. El MVP debe salir en días, no meses.

---

## 7. Riesgos y Consideraciones Técnicas

- **WhatsApp masivo:** Meta restringe el envío masivo instantáneo vía API oficial. Los mensajes deben espaciarse (~100 segundos entre envíos) para evitar bloqueos por spam.
- **No usar herramientas no oficiales de WhatsApp:** Plataformas de terceros que automatizan WhatsApp con QR son inestables y pueden ser bloqueadas por Meta en cualquier momento. Nella usa exclusivamente la API oficial.
- **Control de alucinaciones del agente IA:** El agente no debe desviarse hacia temas irrelevantes. Requiere prompts robustos y manejo estricto del contexto de conversación.
- **Handoff humano:** El sistema debe detectar cuándo una conversación requiere atención humana y notificar al vendedor sin interrumpir el flujo de automatización.

---

*Documento generado para uso interno del equipo Nella. Actualizar con cada sprint.*
