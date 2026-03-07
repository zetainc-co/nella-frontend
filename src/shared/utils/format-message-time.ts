/**
 * Formatea un timestamp Unix (número) o ISO string a formato HH:mm
 */
export function formatMessageTime(timestamp: number | string): string {
  // Si es un número, asumimos que es timestamp Unix en segundos
  // Si es string, asumimos que es ISO 8601 date string
  const date = typeof timestamp === 'number'
    ? new Date(timestamp * 1000)
    : new Date(timestamp)

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}
