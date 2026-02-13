# 🚀 Guía de Inicio Rápido — Nella Revenue OS

**Todo lo que necesitas saber para empezar a desarrollar en 5 minutos**

---

## 📚 ¿Por Dónde Empezar?

### Si eres NUEVO en el proyecto:

**Paso 1:** Lee esto primero 👇
- [`README.md`](../README.md) - Visión general del proyecto

**Paso 2:** Entiende la arquitectura (15 min)
- [`docs/arquitectura.md`](arquitectura.md) - Decisiones técnicas y flujo de datos

**Paso 3:** Aprende las reglas de desarrollo (20 min) ⭐
- [`CLAUDE.md`](../CLAUDE.md) - **DOCUMENTO MÁS IMPORTANTE**

**Paso 4:** Ten a mano durante el desarrollo
- [`docs/quick-reference.md`](quick-reference.md) - Referencia rápida
- [`docs/code-examples.md`](code-examples.md) - Ejemplos de código

---

### Si vas a implementar un MÓDULO específico:

#### Dashboard
1. [`docs/spec/spec.dashboard.md`](spec/spec.dashboard.md) - Qué debe hacer
2. [`docs/code-examples.md`](code-examples.md) - Cómo implementarlo
3. [`docs/modelo-datos.md`](modelo-datos.md) - Tablas: `contacts`, `deals`

#### Kanban
1. [`docs/spec/spec.kanba.md`](spec/spec.kanba.md) - Qué debe hacer
2. [`CLAUDE.md`](../CLAUDE.md) - Client Components (drag-and-drop)
3. [`docs/modelo-datos.md`](modelo-datos.md) - Tabla: `contacts` (campo `stage`)

#### Contactos
1. [`docs/spec/spec.contact.md`](spec/spec.contact.md) - Qué debe hacer
2. [`docs/code-examples.md`](code-examples.md) - Listado + perfil
3. [`docs/modelo-datos.md`](modelo-datos.md) - Tablas: `contacts`, `conversations`, `deals`

#### Chat
1. [`docs/spec/spec.chat.md`](spec/spec.chat.md) - Qué debe hacer
2. [`docs/arquitectura.md`](arquitectura.md) - Estrategia de integración con Chatwoot
3. MVP: Iframe embebido | Fase 2: UI propia

---

## 📖 Índice Completo de Documentación

### 🎯 Documentos Esenciales (Leer primero)

| Documento | Qué contiene | Cuándo leerlo |
|-----------|--------------|---------------|
| [`../README.md`](../README.md) | Visión general, stack, estructura | Primer día |
| [`../CLAUDE.md`](../CLAUDE.md) ⭐ | **Reglas de desarrollo** | **Antes de escribir código** |
| [`arquitectura.md`](arquitectura.md) | Decisiones técnicas, flujo de datos | Antes de implementar features |

---

### 📋 Especificaciones Funcionales (Qué construir)

| Módulo | Spec | Complejidad | Ruta |
|--------|------|-------------|------|
| Dashboard | [`spec.dashboard.md`](spec/spec.dashboard.md) | Media | `/dashboard` |
| Kanban | [`spec.kanba.md`](spec/spec.kanba.md) | Alta | `/kanban` |
| Contactos | [`spec.contact.md`](spec/spec.contact.md) | Media-Alta | `/contacts` |
| Chat | [`spec.chat.md`](spec/spec.chat.md) | Baja (MVP) | `/chat` |

---

### 🔧 Guías de Implementación (Cómo construir)

| Documento | Qué contiene | Cuándo usarlo |
|-----------|--------------|---------------|
| [`quick-reference.md`](quick-reference.md) | Referencia rápida de comandos y patrones | Durante el desarrollo |
| [`code-examples.md`](code-examples.md) | Ejemplos prácticos de código | Al implementar features |
| [`modelo-datos.md`](modelo-datos.md) | Schema de base de datos | Al acceder a datos |

---

### 📊 Documentación Técnica (Referencia)

| Documento | Qué contiene |
|-----------|--------------|
| [`general.md`](general.md) | Información general del proyecto |
| [`flows-n8n/`](flows-n8n/) | Flujos de n8n (JSON) |
| [`plans/`](plans/) | Planes de desarrollo |
| [`reports/`](reports/) | Reportes y estrategias |

---

## 🛠️ Setup Inicial (5 minutos)

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
```bash
# Crear archivo .env.local
cp .env.example .env.local

# Editar con tus credenciales
# - Supabase URL y keys
# - Chatwoot URL y API key
# - NextAuth secret
```

### 3. Levantar Servidor de Desarrollo
```bash
npm run dev
```

**Acceso:** http://localhost:3000

---

## 🎯 Flujo de Trabajo Recomendado

### Para cada nueva feature:

**1. Leer la spec funcional** (5-10 min)
- ¿Qué debe hacer?
- ¿Qué datos necesita?
- ¿Qué estados tiene?

**2. Revisar el modelo de datos** (5 min)
- ¿Qué tablas necesito?
- ¿Qué campos tiene cada tabla?
- ¿Cómo se relacionan?

**3. Decidir Server vs Client Component** (2 min)
- ¿Necesita interactividad? → Client Component
- ¿Solo muestra datos? → Server Component

**4. Implementar** (tiempo variable)
- Seguir convenciones de [`CLAUDE.md`](../CLAUDE.md)
- Consultar ejemplos en [`code-examples.md`](code-examples.md)
- Usar [`quick-reference.md`](quick-reference.md) para sintaxis

**5. Verificar antes de commit**
```bash
npm run build  # Sin errores
npm run lint   # Sin warnings
```

---

## 🔑 Conceptos Clave

### Server Components vs Client Components

```typescript
// ✅ Server Component (por defecto)
// NO agregar "use client"
export default async function Page() {
  const data = await fetchData() // Fetch directo
  return <Component data={data} />
}

// ✅ Client Component (solo si necesitas)
"use client" // ⚠️ Solo si usa hooks, eventos, estado

export function Component() {
  const [state, setState] = useState()
  return <div onClick={...}>...</div>
}
```

### Flujo de Datos

```
n8n → PostgreSQL/Supabase → Next.js API Routes → Frontend
                    ↓
              Supabase Realtime
                    ↓
         Client Components (updates automáticos)
```

### Regla de Oro

> **n8n escribe leads → Frontend solo lee y visualiza**

---

## 📝 Checklists

### ✅ Antes de Crear un Componente
- [ ] ¿Es Server o Client Component?
- [ ] ¿Necesita datos? → API Route o fetch directo
- [ ] ¿Es reutilizable? → `components/` | ¿Específico? → `components/[modulo]/`
- [ ] Nombre en kebab-case: `kpi-card.tsx`

### ✅ Antes de Crear una API Route
- [ ] ¿Valida datos con Zod?
- [ ] ¿Maneja errores correctamente?
- [ ] ¿Usa credenciales server-side?
- [ ] ¿Retorna JSON con status codes?
- [ ] ¿Filtra por `client_id` (multi-tenant)?

### ✅ Antes de Hacer Commit
- [ ] `npm run build` sin errores
- [ ] `npm run lint` sin warnings
- [ ] Nombres siguen convenciones
- [ ] Variables de entorno no en el código
- [ ] Comentarios útiles (no obvios)

---

## 🚨 Errores Comunes

### "Module not found"
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### "Supabase connection failed"
- Verificar `.env.local` existe
- Verificar credenciales correctas
- Verificar proyecto Supabase activo

### "Hydration error"
- Estás usando browser APIs en Server Component
- Solución: Agregar `"use client"` al componente

### "Cannot read property of undefined"
- Agregar optional chaining: `data?.field`
- Agregar loading state antes de renderizar

---

## 🔗 Enlaces Rápidos

### Documentación Interna
- **Reglas de desarrollo:** [`CLAUDE.md`](../CLAUDE.md) ⭐
- **Arquitectura:** [`arquitectura.md`](arquitectura.md)
- **Referencia rápida:** [`quick-reference.md`](quick-reference.md)
- **Ejemplos de código:** [`code-examples.md`](code-examples.md)
- **Modelo de datos:** [`modelo-datos.md`](modelo-datos.md)

### Documentación Externa
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query)

---

## 💡 Tips de Productividad

### 1. Ten estos archivos abiertos siempre:
- [`CLAUDE.md`](../CLAUDE.md) - Reglas
- [`quick-reference.md`](quick-reference.md) - Sintaxis rápida
- La spec del módulo que estás implementando

### 2. Usa los ejemplos de código:
- No reinventes la rueda
- Copia y adapta de [`code-examples.md`](code-examples.md)

### 3. Consulta el modelo de datos:
- Antes de hacer cualquier query
- [`modelo-datos.md`](modelo-datos.md)

### 4. Verifica el tipo de componente:
- ¿Necesito `"use client"`?
- Ver reglas en [`CLAUDE.md`](../CLAUDE.md)

---

## 📅 Plan de Entrega MVP (5 Días)

| Día | Módulo | Documentos clave |
|-----|--------|------------------|
| **1** | Scaffold + Auth + Layout | [`arquitectura.md`](arquitectura.md), [`CLAUDE.md`](../CLAUDE.md) |
| **2** | Dashboard | [`spec.dashboard.md`](spec/spec.dashboard.md) |
| **3** | Kanban | [`spec.kanba.md`](spec/spec.kanba.md) |
| **4** | Contactos | [`spec.contact.md`](spec/spec.contact.md) |
| **5** | Chat + Deploy | [`spec.chat.md`](spec/spec.chat.md) |

---

## 🤝 ¿Necesitas Ayuda?

### Dudas técnicas:
1. Busca en [`CLAUDE.md`](../CLAUDE.md)
2. Revisa [`code-examples.md`](code-examples.md)
3. Consulta la documentación oficial del stack

### Dudas funcionales:
1. Lee la spec del módulo en [`spec/`](spec/)
2. Revisa [`arquitectura.md`](arquitectura.md)

### Dudas de datos:
1. Consulta [`modelo-datos.md`](modelo-datos.md)

---

**¡Listo para empezar! 🚀**

*Recuerda: [`CLAUDE.md`](../CLAUDE.md) es tu mejor amigo durante el desarrollo.*

