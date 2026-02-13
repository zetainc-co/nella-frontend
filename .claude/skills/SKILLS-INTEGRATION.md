# 🚀 Integración de Skills con Agentes y Comandos

**Proyecto:** Nella Revenue OS
**Fecha:** Febrero 2026
**Objetivo:** Potenciar agentes y comandos con skills especializados

---

## 📚 Skills Disponibles

### 1. **supabase-postgres-best-practices** 🗄️
**Descripción:** Optimización de performance y mejores prácticas de Postgres/Supabase

**Categorías:**
- Query Performance (CRÍTICO)
- Connection Management (CRÍTICO)
- Security & RLS (CRÍTICO)
- Schema Design (ALTO)
- Concurrency & Locking (MEDIO-ALTO)
- Data Access Patterns (MEDIO)
- Monitoring & Diagnostics (BAJO-MEDIO)
- Advanced Features (BAJO)

**31 reglas** organizadas por prioridad

---

### 2. **shadcn-ui** 🎨
**Descripción:** Guía completa de componentes shadcn/ui con Radix UI y Tailwind CSS

**Incluye:**
- Instalación y configuración
- Componentes core (Button, Input, Form, Card, Dialog, Select, Sheet, Table, Toast)
- Patrones avanzados
- Integración con Next.js
- Customización de temas
- Formularios con React Hook Form + Zod

---

### 3. **vercel-react-best-practices** ⚡
**Descripción:** Optimización de performance para React y Next.js (Vercel Engineering)

**Categorías:**
- Eliminating Waterfalls (CRÍTICO)
- Bundle Size Optimization (CRÍTICO)
- Server-Side Performance (ALTO)
- Client-Side Data Fetching (MEDIO-ALTO)
- Re-render Optimization (MEDIO)
- Rendering Performance (MEDIO)
- JavaScript Performance (BAJO-MEDIO)
- Advanced Patterns (BAJO)

**57 reglas** con ejemplos de código

---

### 4. **vercel-composition-patterns** 🧩
**Descripción:** Patrones de composición de componentes React

**Incluye:**
- Compound Components
- Children over Render Props
- Explicit Variants
- State Management
- React 19 patterns (no forwardRef)

---

### 5. **responsive-design** 📱
**Descripción:** Diseño responsivo con estrategias modernas

**Incluye:**
- Breakpoint strategies
- Container queries
- Fluid layouts
- Mobile-first approach

---

### 6. **ui-ux-pro-max** 🎯
**Descripción:** Sistema completo de diseño UI/UX

**Incluye:**
- Charts, Colors, Icons
- Landing pages
- Stacks (Next.js, React, shadcn, etc.)
- Typography, Styles
- UX Guidelines
- Performance React

---

### 7. **e2e-testing-patterns** 🧪
**Descripción:** Patrones de testing E2E

---

### 8. **frontend-design** 🎨
**Descripción:** Principios de diseño frontend

---

## 🎯 Integración con Agentes

### **1. Architect Expert** 🏗️

#### Skills Recomendados:
- ✅ `supabase-postgres-best-practices` - Para diseño de schema y queries
- ✅ `vercel-react-best-practices` - Para decisiones arquitectónicas
- ✅ `vercel-composition-patterns` - Para patrones de componentes

#### Cómo Integrar:
```markdown
# En .claude/agents/architect-expert.md

## Skills Disponibles

### Supabase/Postgres Best Practices
Consultar `.claude/skills/supabase-postgres-best-practices/` para:
- Diseño de schema optimizado
- Índices y queries eficientes
- Row Level Security (RLS)
- Connection pooling

### React Best Practices
Consultar `.claude/skills/vercel-react-best-practices/` para:
- Eliminación de waterfalls
- Optimización de bundle
- Server Components vs Client Components
- Performance patterns

### Composition Patterns
Consultar `.claude/skills/vercel-composition-patterns/` para:
- Compound components
- State management patterns
- Component composition
```

---

### **2. Frontend Developer** 💻

#### Skills Recomendados:
- ✅ `shadcn-ui` - Para componentes UI
- ✅ `vercel-react-best-practices` - Para optimización
- ✅ `responsive-design` - Para diseño responsivo
- ✅ `ui-ux-pro-max` - Para sistema de diseño

#### Cómo Integrar:
```markdown
# En .claude/agents/frontend-developer.md

## Skills Disponibles

### shadcn/ui Components
Consultar `.claude/skills/shadcn-ui/` para:
- Instalación de componentes: `npx shadcn@latest add [component]`
- Patrones de uso con React Hook Form + Zod
- Customización de temas
- Componentes: Button, Input, Form, Card, Dialog, Select, Table, Toast

### React Performance
Consultar `.claude/skills/vercel-react-best-practices/` para:
- Optimización de re-renders
- Lazy loading con `React.lazy`/`Suspense`
- Memoización con `useMemo`/`React.memo`
- Bundle optimization

### Responsive Design
Consultar `.claude/skills/responsive-design/` para:
- Breakpoints de Tailwind
- Container queries
- Fluid layouts
- Mobile-first approach
```

---

### **3. Documentation Expert** 📚

#### Skills Recomendados:
- ✅ `ui-ux-pro-max` - Para guías de UX
- ✅ `frontend-design` - Para principios de diseño

#### Cómo Integrar:
```markdown
# En .claude/agents/documentation-expert.md

## Skills Disponibles

### UI/UX Guidelines
Consultar `.claude/skills/ui-ux-pro-max/` para:
- Principios de diseño
- Guías de UX
- Patrones de UI
- Mejores prácticas de accesibilidad
```

---

### **4. Testing Expert** 🧪

#### Skills Recomendados:
- ✅ `e2e-testing-patterns` - Para testing E2E

#### Cómo Integrar:
```markdown
# En .claude/agents/testing-expert.md

## Skills Disponibles

### E2E Testing Patterns
Consultar `.claude/skills/e2e-testing-patterns/` para:
- Patrones de testing con Playwright
- Estrategias de testing E2E
- Mejores prácticas
```

---

## 🔧 Integración con Comandos

### **1. /execute-prp** - Ejecutar PRP

#### Skills a Consultar Automáticamente:

**Fase 1 - Arquitectura:**
- `supabase-postgres-best-practices` - Schema design
- `vercel-react-best-practices` - Architecture patterns
- `vercel-composition-patterns` - Component patterns

**Fase 2 - Implementación:**
- `shadcn-ui` - UI components
- `vercel-react-best-practices` - Performance
- `responsive-design` - Responsive patterns

**Fase 3 - Testing:**
- `e2e-testing-patterns` - E2E patterns

**Fase 4 - Documentación:**
- `ui-ux-pro-max` - UX guidelines
- `frontend-design` - Design principles

---

### **2. /generate-docs** - Generar Documentación

#### Skills a Consultar:
- `ui-ux-pro-max` - Para guías de UX
- `frontend-design` - Para principios de diseño
- `shadcn-ui` - Para documentar componentes

---

### **3. /analyze-architecture** - Analizar Arquitectura

#### Skills a Consultar:
- `supabase-postgres-best-practices` - Para análisis de queries
- `vercel-react-best-practices` - Para análisis de performance
- `vercel-composition-patterns` - Para análisis de componentes

---

## 📋 Actualización de Agentes

### Actualizar `architect-expert.md`:

```markdown
## 🎓 Skills de Referencia

### Supabase/Postgres Best Practices
**Ubicación:** `.claude/skills/supabase-postgres-best-practices/`

**Cuándo consultar:**
- Diseñar schema de base de datos
- Optimizar queries
- Implementar RLS (Row Level Security)
- Configurar connection pooling

**Referencias clave:**
- `references/query-missing-indexes.md` - Índices faltantes
- `references/schema-primary-keys.md` - Claves primarias
- `references/security-rls-basics.md` - RLS básico
- `references/conn-pooling.md` - Connection pooling

### React Best Practices
**Ubicación:** `.claude/skills/vercel-react-best-practices/`

**Cuándo consultar:**
- Optimizar performance
- Eliminar waterfalls
- Reducir bundle size
- Implementar Server Components

**Referencias clave:**
- `rules/async-parallel.md` - Paralelización
- `rules/bundle-dynamic-imports.md` - Dynamic imports
- `rules/server-parallel-fetching.md` - Parallel fetching
- `rules/rerender-memo.md` - Memoización
```

---

### Actualizar `frontend-developer.md`:

```markdown
## 🎓 Skills de Referencia

### shadcn/ui Components
**Ubicación:** `.claude/skills/shadcn-ui/`

**Cuándo consultar:**
- Instalar componentes UI
- Implementar formularios
- Customizar temas
- Integrar con Next.js

**Comandos útiles:**
```bash
# Instalar componente
npx shadcn@latest add button

# Instalar múltiples
npx shadcn@latest add button input form card dialog
```

**Referencias clave:**
- `SKILL.md` - Guía principal
- `reference.md` - Referencia completa
- `ui-reference.md` - Componentes UI

### React Performance
**Ubicación:** `.claude/skills/vercel-react-best-practices/`

**Cuándo consultar:**
- Optimizar re-renders
- Implementar lazy loading
- Reducir bundle size
- Mejorar performance

**Referencias clave:**
- `rules/rerender-memo.md` - Memoización
- `rules/bundle-dynamic-imports.md` - Dynamic imports
- `rules/rendering-conditional-render.md` - Conditional rendering
- `rules/async-suspense-boundaries.md` - Suspense

### Responsive Design
**Ubicación:** `.claude/skills/responsive-design/`

**Cuándo consultar:**
- Implementar diseño responsivo
- Usar breakpoints
- Container queries
- Fluid layouts

**Referencias clave:**
- `references/breakpoint-strategies.md` - Estrategias de breakpoints
- `references/container-queries.md` - Container queries
- `references/fluid-layouts.md` - Layouts fluidos
```

---

## 🚀 Flujo de Trabajo Potenciado

### **Ejemplo: Implementar Módulo Dashboard**

#### **1. Fase de Arquitectura (architect-expert)**

**Skills consultados:**
- `supabase-postgres-best-practices` → Diseñar queries optimizadas
- `vercel-react-best-practices` → Decidir Server vs Client Components
- `vercel-composition-patterns` → Patrones de composición

**Resultado:**
- Schema de base de datos optimizado
- Índices correctos
- Arquitectura de componentes eficiente
- Decisiones de performance documentadas

---

#### **2. Fase de Implementación (frontend-developer)**

**Skills consultados:**
- `shadcn-ui` → Componentes UI (Card, Button, Table)
- `vercel-react-best-practices` → Optimización de re-renders
- `responsive-design` → Diseño mobile-first

**Resultado:**
- Componentes implementados con shadcn/ui
- Performance optimizado
- Diseño responsivo
- Código limpio y mantenible

---

#### **3. Fase de Testing (testing-expert)**

**Skills consultados:**
- `e2e-testing-patterns` → Patrones de testing E2E

**Resultado:**
- Tests unitarios completos
- Tests E2E implementados
- Cobertura 80%+

---

#### **4. Fase de Documentación (documentation-expert)**

**Skills consultados:**
- `ui-ux-pro-max` → Guías de UX
- `frontend-design` → Principios de diseño

**Resultado:**
- Documentación completa del módulo
- Guías de uso
- Ejemplos de código

---

## 📊 Matriz de Skills por Agente

| Agente | Skills Principales | Skills Secundarios |
|--------|-------------------|-------------------|
| **Architect Expert** | `supabase-postgres-best-practices`<br>`vercel-react-best-practices` | `vercel-composition-patterns` |
| **Frontend Developer** | `shadcn-ui`<br>`vercel-react-best-practices` | `responsive-design`<br>`ui-ux-pro-max` |
| **Testing Expert** | `e2e-testing-patterns` | - |
| **Documentation Expert** | `ui-ux-pro-max` | `frontend-design` |
| **Orchestrator Expert** | Todos (coordina) | - |

---

## 🎯 Comandos Mejorados

### **Nuevo: /execute-prp con skills**

```bash
# Ejecutar PRP con skills automáticos
/execute-prp prp_dashboard.md --with-skills

# Ejecutar con skills específicos
/execute-prp prp_dashboard.md --skills supabase-postgres-best-practices,shadcn-ui

# Listar skills disponibles
/execute-prp --list-skills
```

---

### **Nuevo: /optimize-code con skills**

```bash
# Optimizar código con skills de performance
/optimize-code components/dashboard/ --skills vercel-react-best-practices

# Optimizar queries de Supabase
/optimize-code lib/db.ts --skills supabase-postgres-best-practices
```

---

### **Nuevo: /validate-patterns con skills**

```bash
# Validar patrones de código
/validate-patterns --skills vercel-react-best-practices,vercel-composition-patterns

# Validar queries de base de datos
/validate-patterns lib/ --skills supabase-postgres-best-practices
```

---

## 💡 Mejores Prácticas

### **1. Consultar Skills Antes de Implementar**
- Revisar skills relevantes antes de comenzar
- Identificar patrones aplicables
- Evitar anti-patrones conocidos

### **2. Usar Skills en Revisiones de Código**
- Validar contra mejores prácticas
- Identificar oportunidades de optimización
- Asegurar consistencia

### **3. Actualizar Skills Regularmente**
- Mantener skills actualizados
- Agregar nuevos patrones
- Documentar lecciones aprendidas

### **4. Combinar Skills**
- Usar múltiples skills complementarios
- Aplicar patrones de diferentes categorías
- Optimizar holísticamente

---

## 🔗 Referencias Rápidas

### **Supabase/Postgres**
```bash
.claude/skills/supabase-postgres-best-practices/references/
├── query-missing-indexes.md
├── schema-primary-keys.md
├── security-rls-basics.md
└── conn-pooling.md
```

### **shadcn/ui**
```bash
.claude/skills/shadcn-ui/
├── SKILL.md
├── reference.md
└── ui-reference.md
```

### **React Performance**
```bash
.claude/skills/vercel-react-best-practices/rules/
├── async-parallel.md
├── bundle-dynamic-imports.md
├── rerender-memo.md
└── server-parallel-fetching.md
```

---

## 🎉 Resultado Final

Con esta integración, los agentes y comandos de Claude Code están potenciados con:

✅ **31 reglas** de Supabase/Postgres
✅ **57 reglas** de React/Next.js performance
✅ **Guía completa** de shadcn/ui
✅ **Patrones de composición** de componentes
✅ **Estrategias de diseño** responsivo
✅ **Sistema completo** de UI/UX
✅ **Patrones de testing** E2E

**Total:** Más de **100 mejores prácticas** integradas en el ecosistema de desarrollo! 🚀

---

*Documento vivo — Actualizar al agregar nuevos skills o patrones.*

