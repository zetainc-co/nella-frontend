/**
 * Formatea un timestamp Unix a formato relativo (min, h, días, Ayer)
 */
export function formatRelativeTime(timestamp: number): string {
  const date = new Date(timestamp * 1000)
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
