# 🎼 Comando: Orquestar Ecosistema Claude Code (Patrón cempresarial)

## Descripción
Comando maestro que orquesta automáticamente la secuencia completa de agentes especializados para ejecutar PRPs de forma coordinada y eficiente siguiendo los patrones específicos del proyecto **cempresarial** (Sistema de Gestión Empresarial). Es el punto de entrada principal para el ecosistema de Claude Code.

- **Ubicación por defecto de PRPs**: `.claude/prps/`
- **Agente principal**: `orchestrator-expert`
- **Arquitectura**: MVC modular con separación clara de responsabilidades
- **Patrón de módulos**: `src/modules/[module]/` con estructura completa

## Uso
```
/orchestrate [archivo-prp] [opciones]
```

## Parámetros
- `[archivo-prp]`: **REQUERIDO** - Nombre o ruta del archivo PRP. Por defecto se busca en `.claude/prps/` (ej: `prp_user_management.md`)
- `--dry-run`: Mostrar plan de orquestación completo sin ejecutar
- `--interactive`: Modo interactivo paso a paso con confirmación en cada fase
- `--skip-phase [fase]`: Saltar fase específica (architect, frontend, testing, docs, validation)
- `--force-rollback`: Forzar rollback a la fase anterior
- `--validate-only`: Solo validar PRP y mostrar plan sin implementar
- `--agent [nombre]`: Ejecutar solo con agente específico (modo no-orquestado)
- `--context-file [archivo]`: Usar archivo de contexto específico

## Ejemplos (Patrón cempresarial)
```
# Orquestación completa para módulo users (recomendado)
/orchestrate prp_user_management.md

# Modo interactivo para módulo projects
/orchestrate prp_project_dashboard.md --interactive

# Solo mostrar plan para módulo roles
/orchestrate prp_role_management.md --dry-run

# Saltar fase de documentación para módulo auth
/orchestrate prp_auth_system.md --skip-phase docs

# Solo validar PRP para módulo cecos
/orchestrate prp_cecos_module.md --validate-only

# Modo no-orquestado (comportamiento anterior)
/orchestrate prp_simple_component.md --agent frontend-developer
```

## Proceso de Orquestación

### **Fase 0: Análisis y Planificación (Patrón cempresarial)** 🎯
1. **Leer PRP** desde `.claude/prps/`
2. **Identificar módulos afectados** (auth, dashboard, entity, roles, shareholdings, user)
3. **Analizar estructura** y completitud del PRP
4. **Identificar agentes necesarios** según tipo de funcionalidad
5. **Crear plan de ejecución** con timeline y dependencias por módulo
6. **Validar alineación** con patrones específicos del proyecto cempresarial
7. **Generar contexto inicial** para agentes con información de módulos

### **Fase 1: Arquitectura (Patrón cempresarial)** 🏗️
- **Agente**: `architect-expert`
- **Duración estimada**: 15-30 minutos
- **Responsabilidades**:
  - Diseñar estructura modular MVC específica del proyecto
  - Aplicar principios SOLID con patrones cempresarial
  - Validar arquitectura propuesta por módulo
  - Establecer patrones de diseño específicos del proyecto
  - Definir estructura `src/modules/[module]/` completa
- **Entregables**: Estructura de módulos, decisiones arquitectónicas, patrones específicos
- **Validación**: Cumplimiento de patrones cempresarial, principios SOLID, estructura MVC modular

### **Fase 2: Implementación (Patrón cempresarial)** 🎨
- **Agente**: `frontend-developer`
- **Duración estimada**: 30-60 minutos
- **Responsabilidades**:
  - Implementar componentes con shadcn/ui siguiendo patrones del proyecto
  - Crear hooks en `modules/*/hooks/` con estructura específica
  - Desarrollar servicios en `modules/*/services/` usando `baseService` y `createCRUDService`
  - Crear tipos en `modules/*/types/[module]Types.ts` (un archivo por módulo)
  - Implementar páginas en `modules/*/pages/`
  - Aplicar arquitectura MVC establecida con patrones cempresarial
  - Usar librerías estándar: react-hook-form, sonner, lucide-react
  - Reutilizar utilidades globales de `@shared/utils/*`
- **Entregables**: Componentes, hooks, servicios, páginas, tipos por módulo
- **Validación**: Arquitectura MVC modular, uso de shadcn/ui, react-hook-form, sonner, lucide-react, estructura por módulo

### **Fase 3: Testing (Patrón cempresarial)** 🧪
- **Agente**: `testing-expert`
- **Duración estimada**: 20-40 minutos
- **Responsabilidades**:
  - Crear tests unitarios organizados por módulo en `tests/unit/modules/[module]/`
  - Implementar tests E2E por módulo en `tests/e2e/modules/`
  - Validar cobertura del 80%+ por módulo
  - Ejecutar tests y verificar que pasan
  - Tests específicos para componentes, hooks, services, tipos por módulo
  - Usar Vitest + Testing Library para unit tests
  - Usar Playwright para E2E tests
- **Entregables**: Tests unitarios por módulo, tests E2E por módulo, reportes de cobertura
- **Validación**: Cobertura 80%+ por módulo, tests pasando, flujos críticos cubiertos, estructura por módulo

### **Fase 4: Documentación (Patrón cempresarial)** 📚
- **Agente**: `documentation-expert`
- **Duración estimada**: 10-20 minutos
- **Responsabilidades**:
  - Generar README.md por módulo en `src/modules/[module]/README.md`
  - Documentar estructura completa del módulo (components, pages, hooks, services, types)
  - Crear guías de uso y ejemplos específicos del módulo
  - Documentar APIs y servicios del módulo
  - Incluir diagramas Mermaid de arquitectura del módulo
  - Documentar flujos principales del módulo
- **Entregables**: README.md por módulo, documentación completa del módulo
- **Validación**: Documentación completa por módulo, README.md generado, estructura documentada

### **Fase 5: Validación Final (Patrón cempresarial)** 🐞
- **Agente**: `debugging-expert`
- **Duración estimada**: 10-20 minutos
- **Responsabilidades**:
  - Verificar que no hay errores en el código por módulo
  - Validar arquitectura MVC modular y principios aplicados
  - Confirmar tests funcionando correctamente por módulo
  - Validar estructura de módulos creados
  - Verificar README.md generado por módulo
  - Confirmar uso de librerías estándar del proyecto
  - Generar reporte final de calidad por módulo
- **Entregables**: Reporte de calidad por módulo, correcciones finales
- **Validación**: Código limpio, sin errores, tests pasando, estructura MVC modular, patrones cempresarial cumplidos

## Gestión de Contexto (Patrón cempresarial)

### **Contexto Compartido entre Agentes**
El orquestador mantiene un archivo de contexto que se actualiza en cada fase con información específica de módulos:

```json
{
  "prp": "prp_user_management.md",
  "phase": "frontend",
  "modules": ["users", "auth"],
  "architecture": {
    "pattern": "cempresarial MVC Modular",
    "modules": ["users", "auth"],
    "patterns": ["MVC", "SOLID", "Modular"],
    "decisions": ["Zustand para estado", "shadcn/ui para componentes", "useApi para servicios"]
  },
  "implementation": {
    "components": ["UserList", "UserForm", "UserProfile"],
    "hooks": ["useUsers", "useUsersForm", "useUserStatus"],
    "services": ["usersService"],
    "types": ["usersTypes.ts"],
    "pages": ["UsersPage.tsx"]
  },
  "files_created": ["src/modules/users/..."],
  "files_modified": ["src/core/store/..."],
  "quality_metrics": {
    "coverage": "85%",
    "tests_passing": true,
    "linting_errors": 0,
    "modules_completed": ["users"]
  }
}
```

### **Ubicación del Contexto**
- **Archivo principal**: `.claude/context/current-context.json`
- **Historial**: `.claude/context/history/`
- **Backup**: `.claude/context/backups/`

## Validaciones Automáticas (Patrón cempresarial)

### **✅ Reglas Globales (Patrón cempresarial)**
- [ ] Estructura modular MVC respetada por módulo
- [ ] Archivos máximo 500 líneas
- [ ] Uso de yarn para dependencias
- [ ] Importaciones absolutas con alias
- [ ] TypeScript estricto
- [ ] Tailwind CSS para estilos
- [ ] shadcn/ui para componentes UI
- [ ] react-hook-form para formularios
- [ ] sonner para notificaciones
- [ ] lucide-react para iconos
- [ ] Un archivo de tipos por módulo (`[module]Types.ts`)
- [ ] README.md por módulo en `src/modules/[module]/README.md`
- [ ] Estructura MVC estricta por módulo
- [ ] Uso de servicios base (`baseService`, `createCRUDService`) exclusivamente en services
- [ ] Reutilización de utilidades globales `@shared/utils/*`

### **✅ Reglas de Agentes (Patrón cempresarial)**
- [ ] **Architect**: Principios SOLID, separación de responsabilidades, estructura modular MVC
- [ ] **Frontend**: shadcn/ui, react-hook-form, sonner, lucide-react, estructura por módulo
- [ ] **Testing**: Cobertura 80%+ por módulo, tests unitarios y E2E organizados por módulo
- [ ] **Documentation**: README.md por módulo, documentación completa del módulo
- [ ] **Debugging**: Código limpio, sin errores, tests pasando, validación de arquitectura MVC modular

### **✅ Criterios de Aceptación del PRP (Patrón cempresarial)**
- [ ] Funcionalidad implementada según especificaciones por módulo
- [ ] Tests pasando (unitarios y E2E) por módulo
- [ ] Documentación actualizada (README.md por módulo)
- [ ] Arquitectura validada (MVC modular)
- [ ] Código limpio y mantenible
- [ ] Reglas globales cumplidas
- [ ] Estructura modular MVC respetada
- [ ] Librerías estándar utilizadas correctamente
- [ ] Utilidades globales reutilizadas
- [ ] Convenciones de nomenclatura seguidas

## Manejo de Errores

### **🚨 Tipos de Errores**
1. **Errores de PRP**: Estructura inválida, información faltante
2. **Errores de Agente**: Fallo en ejecución de agente específico
3. **Errores de Validación**: No cumple reglas globales o criterios
4. **Errores de Contexto**: Pérdida de información entre fases

### **🔄 Estrategias de Recuperación**
1. **Rollback Automático**: Volver a fase anterior si hay errores críticos
2. **Re-ejecución**: Reintentar fase fallida con contexto corregido
3. **Modo Debug**: Activar debugging-expert para análisis detallado
4. **Modo Manual**: Permitir intervención manual en casos complejos

### **📊 Logs de Orquestación**
- **Log principal**: `.claude/logs/orchestration.log`
- **Log por fase**: `.claude/logs/phases/[fase].log`
- **Log de errores**: `.claude/logs/errors.log`
- **Log de contexto**: `.claude/logs/context.log`

## Métricas y Reportes

### **📈 KPIs del Orquestador**
- **Tiempo total de ejecución** del pipeline
- **Tasa de éxito** de fases completadas
- **Número de rollbacks** necesarios
- **Calidad del contexto** pasado entre agentes
- **Cumplimiento de reglas** globales
- **Cobertura de tests** alcanzada
- **Errores detectados y corregidos**

### **📊 Dashboard de Orquestación**
```bash
# Ver estado actual del pipeline
cat .claude/context/current-context.json

# Ver logs de orquestación
tail -f .claude/logs/orchestration.log

# Ver métricas de calidad
cat .claude/logs/quality-metrics.json

# Ver historial de ejecuciones
ls .claude/logs/history/
```

## Comparación con /execute-prp

| Característica | /execute-prp | /orchestrate |
|----------------|--------------|--------------|
| **Coordinación** | Manual | Automática |
| **Agentes** | Uno por vez | Secuencia completa |
| **Contexto** | No compartido | Compartido entre fases |
| **Validación** | Básica | Completa en cada fase |
| **Recuperación** | Manual | Automática con rollbacks |
| **Reportes** | Básicos | Detallados con métricas |
| **Uso recomendado** | Tareas simples | PRPs complejos |

## Ejemplo de Uso Completo (Patrón cempresarial)

```bash
# Ejecutar orquestación completa para módulo users
/orchestrate prp_user_management.md --interactive
```

**Flujo esperado:**
1. 🎯 **Análisis**: Analiza PRP de gestión de usuarios, identifica módulos afectados
2. 🏗️ **Arquitectura**: architect-expert diseña estructura modular MVC específica del proyecto
3. 🎨 **Implementación**: frontend-developer crea componentes, hooks, services, tipos y páginas siguiendo patrones cempresarial
4. 🧪 **Testing**: testing-expert implementa tests unitarios y E2E organizados por módulo
5. 📚 **Documentación**: documentation-expert genera README.md por módulo con documentación completa
6. 🐞 **Validación**: debugging-expert valida arquitectura MVC modular y corrige errores finales
7. 📊 **Reporte**: Genera reporte final con métricas de calidad por módulo

## Output Final (Patrón cempresarial)
- ✅ **Implementación completa** según PRP por módulo
- 📊 **Reporte de calidad** y cobertura por módulo
- 📚 **Documentación actualizada** (README.md por módulo)
- 🧪 **Tests funcionando** (unitarios y E2E por módulo)
- 🏗️ **Arquitectura validada** (MVC modular)
- 📋 **Checklist de cumplimiento** (patrones cempresarial)
- 🎯 **Métricas de orquestación** por módulo
- 🔧 **Estructura modular MVC** implementada
- 📁 **Archivos organizados** por módulo (components, pages, hooks, services, types)
- 🎨 **Librerías estándar** utilizadas correctamente

---

**Nota**: `/orchestrate` es el comando principal del ecosistema Claude Code para el proyecto cempresarial. Sigue automáticamente los patrones específicos del proyecto (MVC modular, README.md por módulo, tests por módulo, librerías estándar). Para tareas simples, puedes usar `/execute-prp` con agente específico, pero para PRPs complejos, `/orchestrate` es la opción recomendada.
