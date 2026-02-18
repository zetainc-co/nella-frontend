// src/app/(dashboard)/configuracion/conexiones/page.tsx
"use client"

import { mockConnections } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { MessageCircle, Instagram, Facebook, Calendar, CheckCircle2, Circle } from 'lucide-react'

const iconMap = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  calendar: Calendar
}

const colorMap = {
  whatsapp: 'text-green-500 bg-green-500/10 border-green-500/20',
  instagram: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
  facebook: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  calendar: 'text-purple-500 bg-purple-500/10 border-purple-500/20'
}

export default function ConexionesPage() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Conexiones</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra tus integraciones con canales de comunicación
        </p>
      </div>

      {/* Connections */}
      <div className="space-y-4">
        {mockConnections.map((connection) => {
          const Icon = iconMap[connection.icon as keyof typeof iconMap]
          const colorClass = colorMap[connection.icon as keyof typeof colorMap]

          return (
            <div key={connection.id} className="auth-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground">{connection.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{connection.description}</p>
                  </div>
                </div>
              </div>

              {connection.connected ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">Conectado</span>
                  </div>

                  {connection.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>📱</span>
                      <span>{connection.phone}</span>
                    </div>
                  )}

                  {connection.token && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>🔑</span>
                      <span>Token: {connection.token}</span>
                    </div>
                  )}

                  {connection.note && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold text-blue-400">Nota:</span> {connection.note}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">Editar Token</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Circle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">No conectado</span>
                  </div>

                  <Button className="btn-primary">
                    {connection.id === 'calendar' ? 'Conectar con Google' : 'Conectar'}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
