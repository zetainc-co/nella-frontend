'use client'

import { useState, useEffect } from 'react'

/**
 * Hook personalizado para manejar el estado de carga inicial del Kanban
 * Simula un loading state para mejorar la UX
 */
export function useKanbanLoading(delay: number = 300) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return isLoading
}

