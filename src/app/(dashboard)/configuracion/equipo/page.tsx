// src/app/(dashboard)/configuracion/equipo/page.tsx
"use client"

import { mockTeam, mockBilling } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { UserPlus, Trash2 } from 'lucide-react'
import { HudCorners } from '@/components/ui/hud-corners'

export default function EquipoPage() {
  const licensePercentage = (mockBilling.licenses.used / mockBilling.licenses.total) * 100

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipo y Permisos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona quién tiene acceso a tus chats y leads
        </p>
      </div>

      {/* Licencias Usadas */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-4">Licencias Usadas</h2>

        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            Estás usando <span className="text-white font-semibold">{mockBilling.licenses.used}</span> de{' '}
            <span className="text-white font-semibold">{mockBilling.licenses.total}</span> licencias disponibles
          </p>

          <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-[#9EFF00] transition-all"
              style={{ width: `${licensePercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>{mockBilling.licenses.used}/{mockBilling.licenses.total}</span>
            <span>{licensePercentage.toFixed(0)}% usado</span>
          </div>
        </div>
      </div>

      {/* Miembros del Equipo */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Miembros del Equipo</h2>
          <Button className="gap-2 bg-[#9EFF00] text-black hover:bg-[#8FEE00]">
            <UserPlus className="h-4 w-4" />
            Invitar Miembro
          </Button>
        </div>

        <div className="space-y-4">
          {mockTeam.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg border border-primary/10 bg-black/20 hover:bg-black/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/10 text-sm font-bold text-primary">
                  {member.avatar}
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-gray-400">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-xs font-medium text-primary">{member.role}</span>
                </div>

                <div className="flex items-center gap-2">
                  {member.status === 'active' ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-xs text-green-500">Activo</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span className="text-xs text-yellow-500">Pendiente</span>
                    </>
                  )}
                </div>

                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
