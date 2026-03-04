# 🧪 Comando: Testing por Módulo (Patrón cempresarial)

## Descripción
Ejecuta y/o genera tests para un **módulo específico** siguiendo la arquitectura MVC modular del proyecto **cempresarial** (Sistema de Gestión Empresarial), incluyendo Unit Tests y E2E organizados por módulo. Si ya existen tests, puede actualizarlos cuando cambie la funcionalidad.

- **Arquitectura**: MVC modular con separación clara de responsabilidades
- **Estructura**: Tests organizados por módulo en `tests/unit/modules/[module]/` y `tests/e2e/modules/`
- **Cobertura**: 80%+ por módulo
- **Herramientas**: Vitest + Testing Library (Unit), Playwright (E2E)

## Uso
```
/test [target] [opciones]
```

## Parámetros (Patrón cempresarial)
- `target`: **REQUERIDO** — Nombre del módulo (ej: `auth`, `dashboard`, `entity`, `roles`, `shareholdings`, `user`) o ruta de archivo específico
- `--unit`: Solo Unit Tests organizados por módulo (components, hooks, services, types)
- `--e2e`: Solo E2E Tests por módulo (flujos críticos del módulo)
- `--create`: Crear tests si no existen siguiendo estructura por módulo
- `--update`: Actualizar tests existentes (sin borrar casos válidos)
- `--report`: Generar reporte de cobertura del módulo
- `--coverage`: Verificar cobertura 80%+ del módulo

## Ejemplos (Patrón cempresarial)
```
# Crear Unit Tests para módulo users
/test users --unit --create

# Crear E2E Tests para módulo projects
/test projects --e2e --create

# Actualizar Unit Tests de un componente específico del módulo roles
/test src/modules/roles/components/RoleForm.tsx --unit --update

# Generar reporte de cobertura del módulo auth
/test auth --unit --report

# Verificar cobertura 80%+ del módulo cecos
/test cecos --coverage

# Crear tests completos (unit + e2e) para módulo users
/test users --create
```

## Estructura de Tests Generada (Patrón cempresarial)
```
tests/
├── unit/
│   └── modules/
│       ├── users/
│       │   ├── components/
│       │   │   ├── UserForm.test.tsx
│       │   │   ├── UserTable.test.tsx
│       │   │   └── UserDeleteModal.test.tsx
│       │   ├── hooks/
│       │   │   ├── useUsers.test.ts
│       │   │   ├── useUsersForm.test.ts
│       │   │   └── useUserStatus.test.ts
│       │   ├── services/
│       │   │   └── usersService.test.ts
│       │   └── types/
│       │       └── usersTypes.test.ts
│       ├── projects/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── services/
│       │   └── types/
│       └── roles/
│           ├── components/
│           ├── hooks/
│           ├── services/
│           └── types/
└── e2e/
    └── modules/
        ├── users.e2e.ts
        ├── projects.e2e.ts
        └── roles.e2e.ts
```

## Comportamiento por Tipo (Patrón cempresarial)
1. **Unit Tests por Módulo**
   - **Components (View)**: render, eventos, accesibilidad usando Testing Library
   - **Hooks (Controller)**: lógica, efectos, handlers usando renderHook
   - **Services (Model)**: entradas/salidas, mock de `baseService` y `createCRUDService`
   - **Types**: validación de interfaces TypeScript del módulo
   - **Pages**: integración de componentes del módulo

2. **E2E Tests por Módulo**
   - Flujos críticos del módulo usando Playwright
   - Selectores estables (`data-testid`) específicos del módulo
   - Validación de navegación, inputs y resultados visibles del módulo
   - Tests de integración entre componentes del módulo

## Output (Patrón cempresarial)
- Tests creados/actualizados en estructura por módulo
- Resultados de ejecución por módulo (si aplica)
- Reporte de cobertura por módulo (si `--report`)
- Verificación de cobertura 80%+ por módulo (si `--coverage`)
- Recomendaciones de mejora específicas del módulo
- Validación de estructura MVC modular

## Agente Principal (Patrón cempresarial)
- `@testing-expert`: analiza el target, crea/actualiza tests según la arquitectura MVC modular del proyecto cempresarial, y ejecuta la suite indicada (Unit/E2E) organizada por módulo.

## Flujo Típico del Agente (Patrón cempresarial)
1. Detecta si `target` es módulo o archivo específico
2. Genera/actualiza tests en estructura por módulo: `tests/unit/modules/[module]/` o `tests/e2e/modules/`
3. Para services: mockea `baseService` y `createCRUDService` y valida contratos del módulo
4. Para componentes: usa Testing Library con queries accesibles específicas del módulo
5. Para hooks: usa renderHook con lógica específica del módulo
6. Para types: valida interfaces TypeScript del módulo
7. Para E2E: crea flujos robustos con Playwright específicos del módulo
8. Ejecuta y reporta por módulo (si se solicita `--report`)
9. Verifica cobertura 80%+ por módulo (si se solicita `--coverage`)

## Notas (Patrón cempresarial)
- Estrategia oficial de testing: **Unit + E2E** organizados por módulo (sin capa intermedia de integración)
- Respetar arquitectura MVC modular y patrones específicos del proyecto cempresarial
- Reutilizar utilidades globales de `@shared/utils/*` en asserts y factories cuando aplique
- Usar librerías estándar del proyecto: shadcn/ui, lucide-react, sonner, react-hook-form
- Mantener cobertura 80%+ por módulo
- Tests específicos para cada capa del módulo: components, pages, hooks, services, types
- Validar estructura modular MVC en cada test generado
