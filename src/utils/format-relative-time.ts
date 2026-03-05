/**
 * Formatea un timestamp Unix (número) o ISO string a formato relativo (min, h, días, Ayer)
 */
export function formatRelativeTime(timestamp: number | string): string {
  // Si es un número, asumimos que es timestamp Unix en segundos
  // Si es string, asumimos que es ISO 8601 date string
  const date = typeof timestamp === 'number'
    ? new Date(timestamp * 1000)
    : new Date(timestamp)

  const now = new Date()
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffHours < 1) {
    const mins = Math.floor(diffHours * 60)
    return mins === 0 ? 'Ahora' : `${mins} min`
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} h`
  } else {
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Ayer'
    return `${diffDays} día${diffDays > 1 ? 's' : ''}`
  }
}
