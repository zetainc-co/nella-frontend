LINEAMIENTOS DE ARQUITECTURA

Frontend

Descripción y Objetivo
Como equipo de desarrollo, necesitamos una única referencia de arquitectura para frontend que defina:
•   	Dónde ubicar cada componente del sistema
•   	Cómo fluyen las peticiones y respuestas
•   	Cómo se manejan errores de forma consistente
•   	Cómo funcionan los permisos y la autenticación
Este documento establece un estándar único que todo el equipo debe seguir, garantizando consistencia, mantenibilidad y claridad en el código.

Arquitectura de Directorios
Frontend
Estructura completa del proyecto frontend:

proyect_name/
├── public/                    	# Archivos estáticos
├── tests/
│   ├── unit/                  	# Tests unitarios
│   ├── e2e/                   	# Tests end-to-end
│   ├── mocks/
│   ├── setup/
│   └── utils/
├── docs/                      	# Documentación
├── scripts/                   	# Scripts de utilidad
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── assets/                	# Imágenes, fuentes
│   ├── components/
│   │   └── ui/               	# Componentes shadcn
│   ├── core/
│   │   ├── api/              	# useApi, interceptores
│   │   ├── config/           	# queryClient, queryKeys
│   │   ├── routes/           	# Configuración de rutas
│   │   ├── store/            	# Zustand stores
│   │   └── types/            	# Tipos globales
│   ├── modules/
│   │   └── <modulo>/
│   │   	├── components/
│   │   	├── pages/
│   │   	├── hooks/        	# queries, mutations
│   │   	├── services/
│   │   	└── types/
│   └── shared/
│   	├── components/        	# Componentes reutilizables
│   	├── data/
│   	├── hooks/            	# useApiError, useLogout
│   	├── layouts/          	# Layouts de página
│   	└── utils/
├── index.html
├── package.json, yarn.lock
├── vite.config.ts
├── vitest.config.ts
├── README.md
└── CLAUDE.md
Flujo de una petición del usuario:

Usuario → Router → ProtectedRoute →(useAuthValidation, usePermissions) →
Page → useApi() → Interceptor (Bearer token) → Backend → Query/Mutation →
UI Update
Flujo de manejo de errores:

Error en request →
  useApiError (handleError/withErrorHandling) →
	toast.error (sonner) + mensaje backend o mensaje amigable


Consumo en Frontend
Configuración de useApi para extraer data:

const { data, isLoading, error } = useApi({
  url: '/companies',
  options: { dataPath: 'data' }  // Extrae solo el payload
});
Mejores prácticas:
•   	Definir tipos en core/types/api.types.ts (genéricos)
•   	Tipos específicos en modules/<modulo>/types/
•   	Alinear nombres de tipos con backend
•   	Manejar paginación con tipo consistente


Filtros e Interceptores de Error

useApiError (Frontend)
Ubicación: shared/hooks/useApiError.ts
Funcionalidades:
•   	Normaliza errores de Axios, Error, y objetos con message
•   	Mensajes por status: 500, 404, 401, 403, 400, y genérico
•   	handleError(error, options): Maneja un error con configuración
•   	withErrorHandling(operation, options): Wrapper que retorna { data, error, success }
Ejemplo de uso:

const { handleError } = useApiError();

try {
  await deleteUser(id);
} catch (error) {
  handleError(error, {
	showToast: true,
	fallbackMessage: 'Error al eliminar usuario',
	logToConsole: true
  });
}
4.3 Interceptor de Respuesta (Frontend)
Comportamiento ante error 401:
•   	Intenta refresh del token automáticamente
•   	Si el refresh falla, limpia el auth store
•   	Redirige al usuario a /auth
•   	Previene loops infinitos
IMPORTANTE: Todos los mensajes 401/403 en ESPAÑOL

 
5.2 ProtectedRoute (Frontend)
Ubicación: core/routes/protection/ProtectedRoute.tsx
Flujo de protección:
•   	Usa useAuthValidation() → verifica token y usuario
•   	Si NO autenticado → <Navigate to='/auth' />
•   	Si autenticado pero SIN módulos → <Navigate to='/app/welcome' />
•   	Si requiere módulo específico → usePermissions()
•   	Si NO tiene permiso → <Navigate to='/app/welcome' />
•   	Mientras carga → <LoadingState fullScreen />
Hooks de validación:
•   	useAuthValidation: Valida token y usuario con auth store
•   	usePermissions: hasPermission(module, submodule), hasAnyPermission(modules, requireAll)
Interceptor de request:
•   	Añade Authorization: Bearer <token> automáticamente
•   	Token es desencriptado antes de enviarse
•   	Solo se aplica a instancia autenticada de API

Frontend (React Hook Form + Zod)
Stack de validación:
•   	React Hook Form: Manejo del formulario
•   	Zod: Esquemas de validación
•   	zodResolver: Integración entre ambos
Patrón recomendado:
•   	Schemas de validación en hooks (ej: useXxxValidations)
•   	Hook de formulario por pantalla (ej: useXxxForm)
•   	defaultValues definidos claramente
•   	reset en modo edición
•   	handleSubmit que ejecute callback (mutation)
Ejemplo:

// useUserValidations.ts
export const userSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'USER'])
});

// useUserForm.ts
export const useUserForm = (user?: User) => {
  const form = useForm<UserFormData>({
	resolver: zodResolver(userSchema),
	defaultValues: user || { name: '', email: '', role: 'USER' }
  });
 
  return { form };
};


Convenciones de Nombres:

Frontend

Elemento - Convención - Ejemplo
Componentes/Páginas - PascalCase - UserForm.tsx, UsersPage.tsx
Hooks - [use + camelCase] - useUsersQuery, useCreateRoleMutation
Servicios - [camelCase + Service] - usersService.ts, rolesService.ts
Tipos/Interfaces - PascalCase - UserFormData, TableProps
Constantes - UPPER_SNAKE_CASE - PRIVATE_ROUTES, MODULE_ICONS


Idioma
Regla de oro del idioma:
•   	CÓDIGO (variables, funciones, clases, rutas): INGLÉS
•   	MENSAJES (errores, éxitos, validaciones): ESPAÑOL
Ejemplos:

// ✅ CORRECTO
const user = await this.usersService.findOne(id);
if (!user) {
  throw new NotFoundException('Usuario no encontrado');
}

// ❌ INCORRECTO
const usuario = await this.usuariosService.buscarUno(id);
if (!usuario) {
  throw new NotFoundException('User not found');
}


Configuración y Entorno

Frontend
Variables de entorno:
•   	Prefijo obligatorio: VITE_*
•   	Documentar en .env.example
•   	No exponer secrets del backend
Aliases de rutas configurados:
•   	@/ → src/
•   	@core/ → src/core/
•   	@shared/ → src/shared/
•   	@modules/ → src/modules/
•   	@components/ → src/components/


Estrategia de Testing

Frontend
Tests Unitarios:
•   	Framework: Vitest + @testing-library/react
•   	Ubicación: tests/unit/ organizado por capa (core, shared, modules)
•   	Enfoque: Componentes, hooks, utilidades
Tests E2E:
•   	Framework: Playwright
•   	Ubicación: tests/e2e/
•   	Validar flujos completos de usuario
Estructura de tests/:
•   	tests/unit/ - Tests unitarios por capa
•   	tests/e2e/ - Tests end-to-end
•   	tests/mocks/ - Datos de prueba
•   	tests/setup/ - Configuración de testing
•   	tests/utils/ - Utilidades para tests
•   	tests/README.md - Convenciones y guías

 Estructura para Módulos Complejos
Cuando un módulo crece mucho o tiene múltiples variantes del mismo dominio, usar esta estructura extendida:

src/modules/<feature-grande>/
├── <feature-grande>.module.ts
├── <feature-grande>.controller.ts
├── <feature-grande>.service.ts
├── config/                       	# Configuración del módulo
├── constants/                    	# Constantes del módulo
├── dto/                          	# DTOs principales
├── entities/                     	# Entidades principales
├── types/                        	# Tipos principales
├── strategies/
├── interceptors/
├── shared/                       	# Compartido por submódulos
│   ├── services/
│   │   ├── parser.service.ts
│   │   ├── validation.service.ts
│   │   ├── error-report.service.ts
│   │   ├── batch-processor.service.ts
│   │   └── ...
│   ├── types/
│   └── utils/
├── modules/                      	# Variantes del dominio
│   ├── variant-a/
│   │   ├── dto/
│   │   ├── types/
│   │   ├── constants/
│   │   └── services/
│   │   	├── core/             	# Orquestadores
│   │   	│   ├── variant-a-main.service.ts
│   │   	│   └── index.ts
│   │   	├── validation/
│   │   	├── transformation/
│   │   	├── persistence/
│   │   	├── update/          	 # Si aplica
│   │   	├── domain/           	# Lógica específica
│   │   	└── index.ts
│   ├── variant-b/
│   │   └── ...
│   └── variant-c/
│   	└── ...
└── test/                         	# Tests del módulo
	└── *.spec.ts
Límites de código recomendados:
•   	Frontend: ~500 líneas por archivo
•   	Si se acerca al límite: REFACTORIZAR


Criterios de Aceptación
Para validar que una feature cumple con estos lineamientos:
-	Estructura de raíz respetada (docs, scripts, tests, configs) en backend y frontend
-   Frontend: módulos en src/modules/<nombre>/ con components, pages, hooks (queries, mutations), services, types; core (api, config, routes, store); shared (components, hooks, layouts)
-   Frontend: errores con useApiError; toasts con mensaje del backend cuando exista
-   Validación: DTOs + ValidationPipe en backend; React Hook Form + Zod en frontend
-   Ningún archivo supera el límite de líneas sin refactorizar


Checklist Rápido por Feature:

Frontend
•   	Módulo creado en src/modules/<nombre>/ con components, pages, hooks, services, types
•   	useApi() configurado con dataPath apropiado
•   	TanStack Query implementado con queryKeys consistentes
•   	Mutations con onSuccess (toast + invalidateQueries) y onError (useApiError)
•   	React Hook Form + Zod para validación de formularios
•   	ProtectedRoute configurado con permisos necesarios
•   	Tipos alineados con contratos de API backend
•   	Tests unitarios de componentes críticos


Formato del Mensaje de Commit en

### Estructura:
```
Tipo|IdTarea|YYYYMMDD|Descripción breve
```

### Componentes:

#### **[Tipo]** - Define la naturaleza del cambio:
- `feat` → Nueva funcionalidad
- `fix` → Corrección de error
- `refactor` → Reestructuración/mejora de código
- `review` → Reestructuración/mejora de código
- `test` → Implementación o ajuste de pruebas
- `docs` → Cambios en documentación
- `chore` → Mantenimiento o tareas menores

#### **[Id_Tarea]** → Número de ticket/Id tarea en el tablero

#### **[YYYYMMDD]** → Fecha del commit en formato año/mes/día para estandarizar trazabilidad

#### **[Descripción breve]** → Acción ejecutada en inglés (máx. 60 caracteres, concisa)

### Ejemplos de Commits:
```bash
feat|NELLA|20251022|Implement complete CRUD for cargos module
fix|NELLA|20251022|Fix regex validation in CreateCargoDto
refactor|NELLA|20251022|Optimize queries in CargosService
test|NELLA|20251022|Add unit tests for cargos module
docs|NELLA|20251022|Update cargos API documentation
chore|NELLA|20251022|Configure linting rules for DTOs

Checklist de Commit

Antes de hacer commit, verificar:

- [ ] El mensaje sigue el formato: `Tipo|IdTarea|YYYYMMDD|Descripción`
- [ ] La descripción es clara y concisa (máx. 60 caracteres)
- [ ] El código está testeado
- [ ] No hay errores de linting
- [ ] La funcionalidad está documentada
- [ ] Se han actualizado los tests si es necesario

```

Notas Finales
Este es un documento vivo y lo mismo para el `CLAUDE.md` que debe:
	Actualizarse cuando el equipo adopte nuevos patrones
    Ser revisado periódicamente en retrospectivas
    Servir como referencia en code reviews
    Ser consultado al iniciar nuevas features
    
- Responsabilidades del equipo:
  	Seguir estos lineamientos en todo código nuevo
  	Refactorizar código legacy gradualmente hacia estos estándares
  	Proponer mejoras o cambios en reuniones de equipo
  	Documentar excepciones justificadas

Beneficios esperados:
•   	Código más consistente y predecible
•   	Onboarding más rápido para nuevos miembros
•   	Menos tiempo en code reviews discutiendo estilos
•   	Mayor mantenibilidad del código
•   	Menos bugs por patrones inconsistentes