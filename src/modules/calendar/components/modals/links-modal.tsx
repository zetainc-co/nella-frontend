// src/components/calendario/modals/links-modal.tsx
'use client'

import { useState, useEffect } from 'react'
import { Copy, Calendar, Users, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from '@/components/shared/modal/modal'
import { Button } from '@/components/ui/button'
import { calendarFetch } from '@/lib/calendar-api'
import { useAuthStore } from '@/stores/auth-store'
import type { BookingLink } from '@/types/calendar-types'

interface LinksModalProps {
  open: boolean
  onClose: () => void
}

interface BookingLinksResponse {
  data: BookingLink[]
}

export function LinksModal({ open, onClose }: LinksModalProps) {
  const { session } = useAuthStore()
  const [links, setLinks] = useState<BookingLink[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !session?.accessToken) return

    setIsLoading(true)
    setError(null)

    calendarFetch<BookingLinksResponse>('/calendar/booking-links')
      .then(res => {
        setLinks(res.data ?? [])
      })
      .catch(() => {
        setError('No se pudieron cargar los links de agendamiento.')
      })
      .finally(() => setIsLoading(false))
  }, [open, session?.accessToken])

  function handleCopy(link: BookingLink) {
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'
    const url = `https://book.${appDomain}/${link.slug}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado al portapapeles')
  }

  return (
    <Modal
      open={open}
      onOpenChange={onClose}
      title="Enlaces de Agendamiento Activos"
      size="lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
          <AlertCircle className="size-8" />
          <p className="text-sm">{error}</p>
        </div>
      ) : links.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm text-muted-foreground">No hay links de agendamiento creados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map(link => (
            <div
              key={link.id}
              className="rounded-lg p-4 border-2 border-purple-500/60 bg-background/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{link.title}</h3>
                    {link.isTeamLink && (
                      <span className="text-purple-400 text-base">✦</span>
                    )}
                  </div>
                  {link.rotationType && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {link.rotationType === 'round_robin'
                        ? 'Rotación automática de vendedores'
                        : 'Asignación al menos ocupado'}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-xs rounded-md px-2 py-0.5 font-medium border ${
                    link.isActive
                      ? 'bg-teal-500/20 text-teal-400 border-teal-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}
                >
                  <Calendar className="size-3" />
                  {link.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="text-xs text-muted-foreground font-medium mb-2">
                Link público de agendamiento
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm text-muted-foreground font-mono truncate">
                  {link.slug}
                </div>
                <Button
                  onClick={() => handleCopy(link)}
                  className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                >
                  <Copy className="size-4" />
                  Copiar Link
                </Button>
              </div>

              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  🕐 {link.durationMinutes} min por reunión
                </span>
                {link.isTeamLink && (
                  <span className="flex items-center gap-1">
                    <Users className="size-3" /> Link de equipo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
