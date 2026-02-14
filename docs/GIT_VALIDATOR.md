# 📋 Git Commit Validator

Sistema de validación automática de commits instalado.

## Formato Requerido

```
Tipo|IdTarea|YYYYMMDD|Descripción
```

**Tipos:** feat, fix, refactor, review, test, docs, chore

**Ejemplos:**
```bash
feat|backend|20250129|Add user authentication
fix|MV-001|20250129|Fix login validation
chore|backend|20250129|Update dependencies
```

## Uso

```bash
# Commits automáticos (validados)
git commit -m "feat|backend|20250129|Add feature"

# CLI interactivo
git-helper
```

## Tipos de Ramas

- feature/ - Nueva funcionalidad
- fix/ - Corrección de bug
- hotfix/ - Corrección urgente
- refactor/ - Refactorización
- chore/ - Mantenimiento
- docs/ - Documentación
- test/ - Tests
- release/ - Preparación de release

Instalado con: @mv/git-commit-validator
