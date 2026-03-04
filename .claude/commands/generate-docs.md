# 📚 Comando: Generar Documentación (Patrón cempresarial)

## Descripción
Este comando genera o actualiza documentación técnica y funcional de un módulo específico del proyecto **cempresarial** (Sistema de Gestión Empresarial) en un único archivo README.md siguiendo los patrones específicos del proyecto. La documentación debe estar escrita en español claro y técnico, orientada a desarrolladores y mantenedores.

Si el archivo ya existe, se debe mejorar y expandir sin perder contenido valioso.
Si no existe, se debe crear desde cero siguiendo la estructura específica del proyecto.

- **Ubicación**: `src/modules/[module]/README.md`
- **Patrón**: Un README.md por módulo documentando TODO el módulo
- **Estructura**: Documentación completa del módulo (components, pages, hooks, services, types)

## Uso (Patrón cempresarial)

Si ya hay un README.md en `src/modules/[module]/README.md`, actualízalo; si no hay, créalo siguiendo la estructura específica del proyecto.

```
/generate-docs [module]
```

**Ejemplos:**
```
# Generar documentación para módulo users
/generate-docs users

# Generar documentación para módulo projects
/generate-docs projects

# Generar documentación para módulo roles
/generate-docs roles

# Generar documentación para módulo auth
/generate-docs auth

# Generar documentación para módulo cecos
/generate-docs cecos
```

## Lo que debe llevar un README de un módulo (Patrón cempresarial)

El archivo `src/modules/[module]/README.md` debe contener como mínimo:

### 1. **Introducción**
- Nombre del módulo
- Descripción general y propósito
- Contexto dentro del sistema/proyecto cempresarial
- Arquitectura MVC modular utilizada

### 2. **Guía de Inicio Rápido**
- Requisitos previos
- Configuración mínima
- Ejemplo de uso inicial del módulo
- Estructura de archivos del módulo

### 3. **Estructura del Módulo**
- **Components**: Componentes UI del módulo
- **Pages**: Páginas del módulo
- **Hooks**: Custom hooks del módulo
- **Services**: Servicios API del módulo
- **Types**: Interfaces TypeScript del módulo
- **Utils**: Utilidades específicas del módulo (si aplica)

### 4. **API Reference (Referencia de la API)**
- Lista completa de endpoints utilizados por el módulo
- Métodos soportados (GET, POST, PUT, DELETE, etc.)
- Parámetros requeridos y opcionales
- Ejemplos de request/response en JSON
- Mensajes de error comunes

### 5. **Arquitectura del Módulo**
- Explicación de la arquitectura MVC interna
- Flujos principales del módulo
- Diagrama Mermaid de la arquitectura del módulo
- Dependencias externas (servicios, librerías, APIs)
- Uso de librerías estándar del proyecto (shadcn/ui, lucide-react, sonner, react-hook-form)

### 6. **Documentación del Módulo**
- Explicación detallada de componentes internos
- Casos de uso prácticos con ejemplos
- Ejemplos de integración con otros módulos
- Buenas prácticas recomendadas específicas del módulo
- Limitaciones conocidas

### 7. **Testing y QA**
- Cobertura y análisis de los tests del módulo
- Cómo ejecutar los tests del módulo (`yarn test:unit:[module]`, `yarn e2e:[module]`)
- Estrategias de validación específicas del módulo
- Estructura de tests por módulo

### 8. **Mantenimiento y Contribución**
- Guía para colaboradores específica del módulo
- Estándares de código del proyecto cempresarial
- Cómo reportar errores o sugerencias
- Convenciones de nomenclatura del módulo

### 9. **Historial de Cambios (opcional)**
- Breve changelog si aplica

## Uso del Comando (Patrón cempresarial)

```
/generate-docs [nombre-del-modulo]
```

**Ejemplos específicos del proyecto:**
```
/generate-docs users
/generate-docs projects
/generate-docs roles
/generate-docs auth
/generate-docs cecos
```

## Output esperado (Patrón cempresarial)

Un archivo `src/modules/[module]/README.md` en la raíz del módulo especificado.
Si ya existe, se sobrescribe mejorando la documentación sin eliminar lo importante.
El formato debe estar en Markdown estándar con títulos jerárquicos (#, ##, ###).
El contenido debe ser autoexplicativo, técnico y actualizado siguiendo los patrones específicos del proyecto cempresarial.

### Características específicas del output:
- **Ubicación**: `src/modules/[module]/README.md`
- **Estructura**: Documentación completa del módulo (components, pages, hooks, services, types)
- **Diagramas**: Diagramas Mermaid de arquitectura del módulo
- **Ejemplos**: Ejemplos reales usando interfaces del módulo
- **Tests**: Comandos específicos para tests del módulo
- **Librerías**: Referencias a librerías estándar del proyecto
- **Utilidades**: Referencias a utilidades globales `@shared/utils/*`

## 📌 Notas adicionales para Claude (Patrón cempresarial)

- Siempre redactar en español técnico
- Mantener un estilo claro, conciso y estructurado
- Seguir los patrones específicos del proyecto cempresarial
- Incluir diagramas Mermaid de arquitectura del módulo
- Usar ejemplos reales con interfaces del módulo
- Referenciar librerías estándar del proyecto (shadcn/ui, lucide-react, sonner, react-hook-form)
- Incluir comandos específicos para tests del módulo
- Si faltan datos (por ejemplo endpoints específicos), generar secciones con ejemplos realistas y dejar indicaciones TODO para completarlos
- El resultado debe ser directamente utilizable como documentación oficial del módulo
- Validar que la estructura MVC modular esté correctamente documentada
