# 🏗️ Comando: Analizar Arquitectura (Patrón cempresarial)

## Descripción
Analiza la arquitectura actual del proyecto **cempresarial** (Sistema de Gestión Empresarial) siguiendo los patrones específicos del proyecto (MVC modular, estructura por módulo, librerías estándar) y proporciona recomendaciones de mejora siguiendo principios SOLID.
Además, identifica cuellos de botella, evalúa el estado de performance/optimización y entrega un puntaje de salud del proyecto por módulo.

## Uso
```
/analyze-architecture [módulo] [opciones]
```

## Parámetros (Patrón cempresarial)
- `módulo` (opcional): Módulo específico a analizar (ej: auth, dashboard, entity, roles, shareholdings, user)
- `--perf`: Ejecutar auditoría de performance por módulo (carga, render, tamaño de bundle)
- `--deps`: Analizar dependencias por módulo (ciclos, tamaños, uso de alias)
- `--report`: Generar reporte detallado en Markdown por módulo
- `--quick-wins`: Incluir lista priorizada de quick wins por módulo
- `--mvc`: Validar estructura MVC modular específica del proyecto
- `--patterns`: Verificar cumplimiento de patrones cempresarial

## Ejemplos (Patrón cempresarial)
```
# Análisis completo del proyecto
/analyze-architecture

# Análisis específico del módulo users
/analyze-architecture users --perf --deps --report

# Análisis del módulo projects con quick wins
/analyze-architecture projects --quick-wins

# Validación de estructura MVC del módulo roles
/analyze-architecture roles --mvc --patterns

# Análisis completo del módulo auth
/analyze-architecture auth --perf --deps --report --quick-wins --mvc --patterns
```

## Funcionalidades (Patrón cempresarial)
1. **Análisis de Estructura Modular**: Revisa la organización MVC modular por módulo (components, pages, hooks, services, types)
2. **Principios SOLID por Módulo**: Verifica el cumplimiento de principios SOLID en cada módulo
3. **Dependencias por Módulo**: Identifica dependencias circulares o problemáticas, uso de aliases y tamaños relativos por módulo
4. **Performance por Módulo** (si `--perf`): Heurísticas de costo de render, puntos calientes, oportunidades de code splitting/lazy por módulo
5. **Estado de Optimización**: Revisión de patrones de memoización, uso de Suspense/lazy, assets pesados, utilidades duplicadas
6. **Patrones cempresarial**: Servicios base (`baseService`, `createCRUDService`) solo en services, reutilización de `@shared/utils/*`, uso de Radix UI (shadcn/ui), Zustand, React Hook Form, Sonner, lucide-react, TanStack Query v5
7. **Score de Salud por Módulo**: Puntaje 0–100 con explicación por categoría (Arquitectura MVC, Perf, Dependencias, Tests, Consistencia) por módulo
8. **Recomendaciones por Módulo**: Lista priorizada (alto impacto/bajo esfuerzo primero) y quick wins (si `--quick-wins`) por módulo
9. **Validación MVC Modular**: Verificación de estructura MVC específica del proyecto por módulo
10. **Cumplimiento de Patrones**: Verificación de patrones específicos del proyecto cempresarial

## Output (Patrón cempresarial)
- Reporte detallado de la arquitectura actual por módulo
- Puntos de mejora identificados con ejemplos de código específicos del módulo
- Checklist de calidad por capa MVC (View/Controller/Model) por módulo
- Auditoría de performance por módulo (si `--perf`) con riesgos y oportunidades específicas
- Análisis de dependencias por módulo (si `--deps`)
- Score de salud del proyecto por módulo (0–100) con desglose por categorías
- Quick wins por módulo (si `--quick-wins`)
- Validación de estructura MVC modular específica del proyecto
- Verificación de cumplimiento de patrones cempresarial
- (Opcional `--report`) Archivo Markdown con el informe por módulo
