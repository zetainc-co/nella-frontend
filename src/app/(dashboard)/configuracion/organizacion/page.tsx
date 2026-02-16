// src/app/(dashboard)/configuracion/organizacion/page.tsx
"use client"

import { useState } from 'react'
import { mockOrganization } from '@/lib/mock-data/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HudCorners } from '@/components/ui/hud-corners'

export default function OrganizacionPage() {
  const [org, setOrg] = useState(mockOrganization)

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organización</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información de tu empresa
        </p>
      </div>

      {/* Datos de la Empresa */}
      <div className="relative border border-primary/20 bg-black/40 p-6 backdrop-blur-sm">
        <HudCorners />
        <h2 className="text-lg font-bold text-white mb-6">Datos de la Empresa</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Nombre de la Empresa</Label>
              <Input
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">NIT / ID Fiscal</Label>
              <Input
                value={org.nit}
                onChange={(e) => setOrg({ ...org, nit: e.target.value })}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-400">Industria</Label>
              <Select value={org.industry} onValueChange={(value) => setOrg({ ...org, industry: value })}>
                <SelectTrigger className="bg-black/20 border-primary/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Servicios">Servicios</SelectItem>
                  <SelectItem value="Manufactura">Manufactura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-400">Teléfono</Label>
              <Input
                value={org.phone}
                onChange={(e) => setOrg({ ...org, phone: e.target.value })}
                className="bg-black/20 border-primary/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-400">Dirección</Label>
            <Input
              value={org.address}
              onChange={(e) => setOrg({ ...org, address: e.target.value })}
              className="bg-black/20 border-primary/20 text-white"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button className="bg-[#9EFF00] text-black hover:bg-[#8FEE00]">
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
