# 🚀 Comando: Ejecutar PRP (Patrón cempresarial)

## Descripción
Ejecuta un PRP (Product Requirements Prompt) usando el sistema de orquestación automática siguiendo los patrones específicos del proyecto **cempresarial** (Sistema de Gestión Empresarial). Por defecto utiliza el `orchestrator-expert` para coordinar automáticamente todos los agentes especializados, pero permite ejecución directa con agente específico.

- **Ubicación por defecto de PRPs**: `.claude/prps/`
- **Modo por defecto**: Orquestación automática con `orchestrator-expert`
- **Modo alternativo**: Ejecución directa con agente específico
- **Arquitectura**: MVC modular con separación clara de responsabilidades
- **Patrón**: Estructura por módulo siguiendo patrones cempresarial

## Uso
```
/execute-prp [archivo-prp] [opciones]
```

## Parámetros (Patrón cempresarial)
- `[archivo-prp]`: **REQUERIDO** - Nombre o ruta del archivo PRP. Por defecto se busca en `.claude/prps/` (ej: `prp_user_management.md`)
- `--agent [nombre]`: **OPCIONAL** - Agente específico para ejecución directa (ej: `frontend-developer`, `architect-expert`, `testing-expert`). Si no se especifica, usa orquestación automática
- `--orchestrate`: **EXPLÍCITO** - Forzar uso del orquestador (comportamiento por defecto)
- `--validate`: Solo validar el PRP sin ejecutar
- `--dry-run`: Mostrar plan de ejecución sin implementar
- `--interactive`: Modo interactivo paso a paso
- `--module [nombre]`: Especificar módulo afectado (auth, dashboard, entity, roles, shareholdings, user)
- `--mvc`: Validar estructura MVC modular después de implementación
- `--patterns`: Verificar cumplimiento de patrones cempresarial

## Ejemplos (Patrón cempresarial)
```
# Orquestación automática para módulo users (comportamiento por defecto)
/execute-prp prp_user_management.md

# Orquestación explícita para módulo projects
/execute-prp prp_project_dashboard.md --orchestrate

# Ejecución directa con agente específico para módulo roles
/execute-prp prp_role_management.md --agent frontend-developer

# Validación de PRP para módulo auth
/execute-prp prp_auth_system.md --validate

# Modo interactivo para módulo cecos
/execute-prp prp_cecos_module.md --dry-run --interactive

# Ejecución con validación MVC y patrones
/execute-prp prp_user_management.md --module users --mvc --patterns
```

## Proceso de Ejecución (Patrón cempresarial)

### **Modo Orquestación Automática (Por Defecto)**
Cuando NO se especifica `--agent`, el comando delega al `orchestrator-expert` siguiendo patrones cempresarial:

1. **Delegación al Orquestador**: Pasa el PRP al `orchestrator-expert` con contexto del proyecto
2. **Coordinación Automática**: El orquestador coordina todos los agentes necesarios siguiendo patrones cempresarial
3. **Secuencia Completa**: Ejecuta arquitectura → implementación → testing → documentación → validación por módulo
4. **Contexto Compartido**: Mantiene contexto entre todas las fases con información de módulos
5. **Validación Integral**: Valida cada fase antes de continuar, incluyendo estructura MVC modular y patrones específicos

### **Modo Ejecución Directa (Con --agent)**
Cuando se especifica `--agent`, ejecuta directamente con el agente específico siguiendo patrones cempresarial:

1. **Análisis del PRP**: Leer y parsear el archivo PRP identificando módulos afectados
2. **Validación Básica**: Verificar estructura y completitud del PRP
3. **Ejecución Directa**: Ejecutar con el agente específico siguiendo patrones del proyecto
4. **Validación Limitada**: Validar solo reglas del agente específico y patrones cempresarial

## Agentes Involucrados (Patrón cempresarial)

### 🎨 Frontend Developer
- **Cuándo usar**: Componentes UI, páginas, hooks, formularios por módulo
- **Responsabilidades**:
  - Implementar componentes con shadcn/ui siguiendo patrones del proyecto
  - Usar react-hook-form, sonner, lucide-react (librerías estándar)
  - Aplicar arquitectura MVC modular específica del proyecto
  - Reutilizar utilidades de `@shared/utils/*`
  - Crear estructura completa por módulo (components, pages, hooks, services, types)
  - Usar servicios base (`baseService`, `createCRUDService`) exclusivamente en services

### 🏗️ Architect Expert
- **Cuándo usar**: Diseño de arquitectura, refactoring, decisiones técnicas por módulo
- **Responsabilidades**:
  - Validar estructura modular MVC específica del proyecto
  - Aplicar principios SOLID con patrones cempresarial
  - Diseñar servicios y stores siguiendo patrones del proyecto
  - Optimizar arquitectura por módulo
  - Verificar cumplimiento de patrones específicos del proyecto

### 🧪 Testing Expert
- **Cuándo usar**: Implementación de tests unitarios y E2E por módulo
- **Responsabilidades**:
  - Crear tests unitarios organizados por módulo en `tests/unit/modules/[module]/`
  - Implementar tests E2E por módulo en `tests/e2e/modules/`
  - Mantener cobertura del 80%+ por módulo
  - Validar calidad del código por módulo
  - Usar Vitest + Testing Library (Unit), Playwright (E2E)

### 📚 Documentation Expert
- **Cuándo usar**: Documentación técnica y funcional por módulo
- **Responsabilidades**:
  - Generar README.md por módulo en `src/modules/[module]/README.md`
  - Crear guías de uso específicas del módulo
  - Documentar APIs y servicios del módulo
  - Mantener README actualizados por módulo
  - Incluir diagramas Mermaid de arquitectura del módulo

## Estructura de Salida (Patrón cempresarial)

### 📊 Reportes
- **Implementación**: Lista de archivos creados/modificados por módulo
- **Tests**: Cobertura y resultados de testing por módulo
- **Arquitectura**: Validación de principios SOLID y MVC modular por módulo
- **Documentación**: Archivos de documentación generados por módulo (README.md)
- **Validación**: Verificación de patrones cempresarial cumplidos
- **Estructura**: Validación de estructura MVC modular por módulo

## Validaciones Automáticas

### ✅ Reglas Globales (CLAUDE.md)
- [ ] Estructura modular MVC respetada
- [ ] Archivos máximo 500 líneas
- [ ] Uso de yarn para dependencias
- [ ] Importaciones absolutas con alias
- [ ] TypeScript estricto
- [ ] Tailwind CSS para estilos

### ✅ Reglas de Agentes
- [ ] Frontend: shadcn/ui, react-hook-form, sonner, lucide-react
- [ ] Architect: Principios SOLID, separación de responsabilidades
- [ ] Testing: Cobertura 80%+, tests unitarios y E2E
- [ ] Documentation: README completo y actualizado

### ✅ Criterios de Aceptación
- [ ] Funcionalidad implementada según PRP
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Arquitectura validada
- [ ] Código limpio y mantenible

## Ejemplo de Uso Completo

```
/execute-prp prp_user_management.md --interactive
```

**Flujo esperado:**
1. 📋 Analiza PRP de gestión de usuarios
2. 🎯 Identifica agentes: frontend-developer, testing-expert, documentation-expert
3. 🏗️ Implementa:
   - Componentes de UI (UserList, UserForm, UserProfile)
   - Hooks de gestión (useUserManagement)
   - Servicios (UserServices)
   - Tests unitarios y E2E
   - Documentación del módulo
4. ✅ Valida cumplimiento de todas las reglas
5. 📊 Genera reporte final con métricas

## Output Final
- ✅ Implementación completa según PRP
- 📊 Reporte de calidad y cobertura
- 📚 Documentación actualizada
- 🧪 Tests funcionando
- 🏗️ Arquitectura validada
- 📋 Checklist de cumplimiento

## Comparación de Modos

| Característica | Modo Orquestación (Por Defecto) | Modo Directo (--agent) |
|----------------|----------------------------------|-------------------------|
| **Coordinación** | Automática con orchestrator-expert | Manual |
| **Agentes** | Todos los necesarios en secuencia | Solo el especificado |
| **Contexto** | Compartido entre fases | No compartido |
| **Validación** | Completa en cada fase | Limitada al agente |
| **Tiempo** | Más tiempo, mejor calidad | Más rápido, menos completo |
| **Uso recomendado** | PRPs complejos, producción | Tareas simples, prototipos |

## Recomendaciones de Uso

### **Usar Orquestación Automática (Por Defecto) cuando:**
- ✅ PRPs complejos con múltiples componentes
- ✅ Necesitas calidad de producción
- ✅ Quieres documentación completa
- ✅ Necesitas tests unitarios y E2E
- ✅ Es la primera implementación de una feature

### **Usar Ejecución Directa (--agent) cuando:**
- ✅ Tareas simples o prototipos rápidos
- ✅ Solo necesitas un componente específico
- ✅ Estás iterando sobre algo ya implementado
- ✅ Tienes tiempo limitado y necesitas algo rápido
- ✅ Ya tienes la arquitectura definida

## Comandos Relacionados

- **`/orchestrate`**: Comando principal para orquestación completa
- **`/debug`**: Para debugging específico
- **`/test`**: Para testing específico
- **`/analyze-architecture`**: Para análisis arquitectónico
- **`/generate-docs`**: Para documentación específica

---

**Nota**: Por convención, guarda tus PRP en `.claude/prps/`. Este comando los buscará ahí por defecto. Para PRPs complejos, se recomienda usar `/orchestrate` directamente.
